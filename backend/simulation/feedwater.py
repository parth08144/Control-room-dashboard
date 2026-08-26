"""
Feedwater system physics.
Two pumps (A/B) → feedwater flow → drum level contribution.
"""
import math
from .models import FeedwaterState


MAX_FLOW_PER_PUMP = 250.0   # t/h per pump


def _lag(current: float, target: float, tau: float, dt: float) -> float:
    alpha = 1.0 - math.exp(-dt / tau)
    return current + alpha * (target - current)


def update(state: FeedwaterState, dt: float, controls: dict) -> FeedwaterState:
    s = state

    # ── Pump A ────────────────────────────────────────────────────────────────
    if controls.get("pump_a_start"):
        s.pump_a_running = True
        s.pump_a_fault = False
    if controls.get("pump_a_stop"):
        s.pump_a_running = False
    if controls.get("fault_pump_a"):
        s.pump_a_fault = True
        s.pump_a_running = False

    if s.pump_a_running and not s.pump_a_fault:
        speed_a = float(controls.get("pump_a_speed", s.pump_a_speed))
        s.pump_a_speed = _lag(s.pump_a_speed, max(0, min(100, speed_a)), tau=3.0, dt=dt)
    else:
        s.pump_a_speed = _lag(s.pump_a_speed, 0.0, tau=3.0, dt=dt)

    # ── Pump B ────────────────────────────────────────────────────────────────
    if controls.get("pump_b_start"):
        s.pump_b_running = True
        s.pump_b_fault = False
    if controls.get("pump_b_stop"):
        s.pump_b_running = False
    if controls.get("fault_pump_b"):
        s.pump_b_fault = True
        s.pump_b_running = False

    if s.pump_b_running and not s.pump_b_fault:
        speed_b = float(controls.get("pump_b_speed", s.pump_b_speed))
        s.pump_b_speed = _lag(s.pump_b_speed, max(0, min(100, speed_b)), tau=3.0, dt=dt)
    else:
        s.pump_b_speed = _lag(s.pump_b_speed, 0.0, tau=3.0, dt=dt)

    # ── Total feedwater flow ──────────────────────────────────────────────────
    flow_a = (s.pump_a_speed / 100.0) * MAX_FLOW_PER_PUMP if s.pump_a_running else 0.0
    flow_b = (s.pump_b_speed / 100.0) * MAX_FLOW_PER_PUMP if s.pump_b_running else 0.0
    s.feedwater_flow = flow_a + flow_b

    # ── Discharge pressures ───────────────────────────────────────────────────
    s.pump_a_pressure = (s.pump_a_speed / 100.0) ** 2 * 200.0
    s.pump_b_pressure = (s.pump_b_speed / 100.0) ** 2 * 200.0

    # ── Feedwater temperature (heated by LP heaters) ──────────────────────────
    # Simplified: higher flow = cooler (less residence in heaters)
    total_flow_factor = min(1.0, s.feedwater_flow / 400.0)
    temp_target = 80.0 + total_flow_factor * 80.0
    s.feedwater_temp = _lag(s.feedwater_temp, temp_target, tau=20.0, dt=dt)

    return s
