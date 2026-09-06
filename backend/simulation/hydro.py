"""
Hydro plant physics simulation.
Gate opening → water flow → turbine power.
"""
import math
from .models import HydroState


def _lag(current: float, target: float, tau: float, dt: float) -> float:
    alpha = 1.0 - math.exp(-dt / tau)
    return current + alpha * (target - current)


def update(state: HydroState, dt: float, controls: dict, add_soe=None) -> HydroState:
    s = state

    # Reset
    if controls.get("hydro_reset"):
        if s.tripped:
            s.tripped = False
            s.trip_reason = ""

    # Start/Stop
    if controls.get("hydro_start") and not s.tripped and not s.running:
        s.running = True
        if add_soe: add_soe("COMMAND", "Hydro Plant Start Command")
    if controls.get("hydro_stop") and s.running:
        s.running = False
        if add_soe: add_soe("COMMAND", "Hydro Plant Stop Command")

    if s.tripped:
        s.running = False

    # Gate opening setpoint
    if s.running:
        target_gate = float(controls.get("gate_opening", 0.0))
        s.gate_opening = _lag(s.gate_opening, target_gate, tau=15.0, dt=dt)
    else:
        s.gate_opening = _lag(s.gate_opening, 0.0, tau=10.0, dt=dt)

    if "hydro_inflow" in controls:
        s.inflow = float(controls["hydro_inflow"])

    # Water flow (calc based on current gate and pressure)
    # Using previous tick's head pressure to avoid circular dependency
    s.water_flow = (s.gate_opening / 100.0) * math.sqrt(s.head_pressure / 100.0) * 1200.0
    s.steam_flow = s.water_flow

    # Reservoir dynamics
    inflow_rate = (s.inflow / 100.0) * 0.5  # up to 0.5 m/s
    outflow_rate = (s.water_flow / 1200.0) * 0.5 # up to 0.5 m/s
    
    s.level_trend = inflow_rate - outflow_rate
    s.reservoir_level += s.level_trend * dt
    
    new_level = max(0.0, min(100.0, s.reservoir_level))
    if new_level == 100.0 and s.level_trend > 0:
        s.level_trend = 0.0
    if new_level == 0.0 and s.level_trend < 0:
        s.level_trend = 0.0
    s.reservoir_level = new_level

    # Head pressure is derived from reservoir level. Let's say 100m = 100 bar (for turbine compatibility)
    s.head_pressure = s.reservoir_level
    s.steam_pressure = s.head_pressure  # Alias for turbine logic

    # Faults/Trips
    if not s.tripped and s.running:
        if s.reservoir_level < 10.0:
            s.tripped = True
            s.trip_reason = "Low Reservoir Level"
            if add_soe: add_soe("TRIP", "HYDRO TRIP", s.trip_reason)

    if s.tripped:
        s.gate_opening = _lag(s.gate_opening, 0.0, tau=5.0, dt=dt)

    return s
