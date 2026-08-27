"""
Main simulation engine — async tick loop, coordinates all subsystems.
"""
from __future__ import annotations
import asyncio
import time
from dataclasses import asdict
from collections import deque
from typing import Callable, Awaitable, Optional, Dict, Any, Deque

from .models import PlantState
from . import boiler, turbine, generator, feedwater, condenser
from .alarm_engine import AlarmEngine


TICK_INTERVAL = 1.0          # seconds per simulation tick
HISTORY_LENGTH = 300         # max data points in trend history


class SimulationEngine:
    def __init__(self):
        self.state = PlantState()
        self.controls: Dict[str, Any] = {
            "fuel_demand": 0.0,
            "governor_setpoint": 100.0,
            "excitation_setpoint": 100.0,
            "pump_a_speed": 70.0,
            "pump_b_speed": 70.0,
            "cooling_fans": 4,
        }
        self.alarm_engine = AlarmEngine()
        self.history: Deque[dict] = deque(maxlen=HISTORY_LENGTH)
        self._broadcast_fn: Optional[Callable[[str], Awaitable[None]]] = None
        self._task: Optional[asyncio.Task] = None
        self._tick_count = 0

    def set_broadcast(self, fn: Callable[[str], Awaitable[None]]):
        """Register a callback to broadcast state JSON each tick."""
        self._broadcast_fn = fn

    def apply_controls(self, cmd: Dict[str, Any]):
        """Merge incoming control command into current controls dict."""
        self.controls.update(cmd)

    def start(self):
        if self._task is None or self._task.done():
            self._task = asyncio.create_task(self._run())

    def stop(self):
        if self._task and not self._task.done():
            self._task.cancel()

    async def _run(self):
        dt = TICK_INTERVAL
        while True:
            t0 = time.monotonic()
            self._tick()
            elapsed = time.monotonic() - t0
            await asyncio.sleep(max(0.0, dt - elapsed))

    def _tick(self):
        s = self.state
        c = self.controls
        s.tick = self._tick_count
        s.timestamp = time.time()
        self._tick_count += 1

        # ── 1. Feedwater (first — feeds drum level in boiler) ─────────────────
        s.feedwater = feedwater.update(s.feedwater, TICK_INTERVAL, c, s.add_soe)

        # ── 2. Boiler ─────────────────────────────────────────────────────────
        c["turbine_steam_demand"] = s.turbine.steam_flow_in
        s.boiler = boiler.update(s.boiler, s.feedwater, TICK_INTERVAL, c, s.add_soe)

        # ── 3. Turbine ────────────────────────────────────────────────────────
        s.turbine = turbine.update(s.turbine, s.boiler, TICK_INTERVAL, c, s.add_soe)

        # ── 4. Generator ──────────────────────────────────────────────────────
        s.generator = generator.update(s.generator, s.turbine, TICK_INTERVAL, c, s.add_soe)

        # ── 5. Condenser ──────────────────────────────────────────────────────
        s.condenser = condenser.update(s.condenser, s.turbine, s.generator, TICK_INTERVAL, c, s.add_soe)

        # ── 6. Plant-level summary ────────────────────────────────────────────
        s.plant_running = s.boiler.running or s.turbine.running
        s.plant_power_mw = s.generator.mw_output

        # ── 7. Alarm evaluation ───────────────────────────────────────────────
        active_alarms = self.alarm_engine.evaluate(s)
        s.active_alarms = active_alarms
        s.alarm_count_critical = sum(1 for a in active_alarms if a.severity == "CRITICAL")
        s.alarm_count_warning  = sum(1 for a in active_alarms if a.severity == "WARNING")
        s.alarm_count_info     = sum(1 for a in active_alarms if a.severity == "INFO")

        # ── 8. History snapshot ───────────────────────────────────────────────
        self.history.append({
            "t": s.timestamp,
            "tick": s.tick,
            "steam_pressure": s.boiler.steam_pressure,
            "steam_temp": s.boiler.steam_temp,
            "drum_level": s.boiler.drum_level,
            "rpm": s.turbine.rpm_actual,
            "vibration": s.turbine.vibration,
            "mw": s.generator.mw_output,
            "frequency": s.generator.frequency,
            "fw_flow": s.feedwater.feedwater_flow,
            "condenser_vacuum": s.condenser.vacuum,
            "heat_rejection": s.condenser.heat_rejection,
        })

        # ── 9. Broadcast ─────────────────────────────────────────────────────
        if self._broadcast_fn:
            asyncio.ensure_future(self._broadcast_fn(s.to_json()))

        # ── 10. Clear one-shot events ────────────────────────────────────────
        for event in [
            "boiler_start", "boiler_stop", "boiler_reset",
            "turbine_start", "turbine_stop", "turbine_reset",
            "gen_breaker_close", "gen_breaker_open", "gen_reset",
            "pump_a_start", "pump_a_stop",
            "pump_b_start", "pump_b_stop"
        ]:
            self.controls.pop(event, None)

    def get_history(self) -> list:
        return list(self.history)


# Singleton
engine = SimulationEngine()
