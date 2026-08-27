"""
Turbine physics simulation.
Steam pressure/flow → RPM → mechanical power.
"""
import math
import random
from .models import TurbineState, BoilerState


RPM_RATED = 3000.0          # rpm  — synchronous
RPM_TRIP = 3300.0           # rpm  — overspeed trip
VIB_TRIP = 7.0              # mm/s — vibration trip
BEARING_TEMP_TRIP = 95.0    # °C


def _lag(current: float, target: float, tau: float, dt: float) -> float:
    alpha = 1.0 - math.exp(-dt / tau)
    return current + alpha * (target - current)


def update(state: TurbineState, boiler: BoilerState, dt: float, controls: dict) -> TurbineState:
    s = state

    # ── Reset ─────────────────────────────────────────────────────────────────
    if controls.get("turbine_reset"):
        if s.tripped:
            s.tripped = False
            s.trip_reason = ""
            s.fault_vibration = False
            s.fault_overspeed = False
        controls.pop("fault_vibration", None)
        controls.pop("fault_overspeed", None)

    # ── Start / Stop ──────────────────────────────────────────────────────────
    if controls.get("turbine_start") and not s.tripped and boiler.running and boiler.steam_pressure > 20.0:
        s.running = True
    if controls.get("turbine_stop"):
        s.running = False

    if s.tripped:
        s.running = False

    # ── RPM setpoint ──────────────────────────────────────────────────────────
    if s.running:
        # Target RPM from governor setpoint (default 3000), limited by steam availability
        gov_setpoint = float(controls.get("governor_setpoint", 100.0))  # % of rated
        steam_factor = min(1.0, boiler.steam_pressure / 80.0)           # needs ≥80 bar
        s.rpm_setpoint = gov_setpoint / 100.0 * RPM_RATED * steam_factor
    else:
        s.rpm_setpoint = 0.0

    # ── RPM actual (inertia) ─────────────────────────────────────────────────
    s.rpm_actual = _lag(s.rpm_actual, s.rpm_setpoint, tau=20.0, dt=dt)

    # ── Steam flow consumed ───────────────────────────────────────────────────
    if s.running and s.rpm_actual > 100:
        s.steam_flow_in = (s.rpm_actual / RPM_RATED) * boiler.steam_flow * 0.9
    else:
        s.steam_flow_in = 0.0

    # ── Mechanical power ──────────────────────────────────────────────────────
    # Power ∝ (rpm/rated)³ * steam_pressure factor
    rpm_pu = s.rpm_actual / RPM_RATED          # per-unit
    pressure_factor = min(1.0, boiler.steam_pressure / 160.0)
    s.mechanical_power = rpm_pu ** 1.5 * pressure_factor * 660.0  # MW at full load

    # ── Vibration ─────────────────────────────────────────────────────────────
    baseline_vib = 0.5 + rpm_pu * 1.5
    noise = random.gauss(0, 0.05)
    if s.fault_vibration:
        s.vibration = _lag(s.vibration, 12.0, tau=10.0, dt=dt)
    elif controls.get("fault_vibration"):
        s.fault_vibration = True
        s.vibration = _lag(s.vibration, 12.0, tau=10.0, dt=dt)
    else:
        s.vibration = _lag(s.vibration, baseline_vib + noise, tau=5.0, dt=dt)

    # ── Bearing temp ─────────────────────────────────────────────────────────
    temp_target = 45.0 + rpm_pu * 30.0 + s.vibration * 3.0
    s.bearing_temp = _lag(s.bearing_temp, temp_target, tau=30.0, dt=dt)

    # ── Fault injection ───────────────────────────────────────────────────────
    if controls.get("fault_overspeed"):
        s.fault_overspeed = True
        s.rpm_actual = min(RPM_TRIP + 50, s.rpm_actual + 20.0 * dt)

    # ── Trip logic ────────────────────────────────────────────────────────────
    if not s.tripped and s.running:
        if s.rpm_actual >= RPM_TRIP:
            s.tripped = True
            s.trip_reason = f"Overspeed: {s.rpm_actual:.0f} rpm"
        elif s.vibration >= VIB_TRIP:
            s.tripped = True
            s.trip_reason = f"High vibration: {s.vibration:.2f} mm/s"
        elif s.bearing_temp >= BEARING_TEMP_TRIP:
            s.tripped = True
            s.trip_reason = f"Bearing overtemp: {s.bearing_temp:.1f} °C"

    if s.tripped:
        s.rpm_setpoint = 0.0

    # Expose steam demand back (used by boiler)
    return s


PRESSURE_RATED = 160.0  # module-level for import
