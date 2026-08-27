"""
Boiler physics simulation.
Fuel input → firing rate (lagged) → steam pressure / temperature / drum level.
"""
import math
import random
from .models import BoilerState, FeedwaterState


# ─── Limits ───────────────────────────────────────────────────────────────────
PRESSURE_MAX = 180.0        # bar  — trip
PRESSURE_RATED = 160.0      # bar  — normal full-load
TEMP_MAX = 560.0            # °C  — trip
DRUM_LEVEL_LOW_LOW = 10.0   # %   — trip
DRUM_LEVEL_HIGH_HIGH = 90.0 # %   — trip


def _lag(current: float, target: float, tau: float, dt: float) -> float:
    """First-order lag (exponential smoothing)."""
    alpha = 1.0 - math.exp(-dt / tau)
    return current + alpha * (target - current)


def update(state: BoilerState, fw: FeedwaterState, dt: float, controls: dict, add_soe=None) -> BoilerState:
    """
    Update boiler state by one simulation step of dt seconds.
    controls: dict with optional keys:
        fuel_demand (%), boiler_start (bool), boiler_stop (bool), boiler_reset (bool)
        fault_overtemp (bool), fault_stuck_valve (bool)
    """
    s = state  # alias

    # ── Reset trip ────────────────────────────────────────────────────────────
    if controls.get("boiler_reset"):
        if s.tripped:
            s.tripped = False
            s.trip_reason = ""
        controls.pop("fault_overtemp", None)

    # ── Start / Stop ──────────────────────────────────────────────────────────
    if controls.get("boiler_start") and not s.tripped and not s.running:
        s.running = True
        if add_soe: add_soe("COMMAND", "Boiler Start Command")
    if controls.get("boiler_stop") and s.running:
        s.running = False
        if add_soe: add_soe("COMMAND", "Boiler Stop Command")

    if s.tripped:
        s.running = False

    # ── Fuel demand & firing rate ─────────────────────────────────────────────
    target_fuel = float(controls.get("fuel_demand", s.fuel_demand)) if s.running else 0.0
    target_fuel = max(0.0, min(100.0, target_fuel))
    s.fuel_demand = target_fuel

    firing_target = target_fuel if s.running else 0.0
    s.firing_rate = _lag(s.firing_rate, firing_target, tau=5.0, dt=dt)
    s.firing_rate = max(0.0, s.firing_rate)

    # ── Heat input & steam production ─────────────────────────────────────────
    heat_input = s.firing_rate / 100.0          # normalised 0-1
    
    # Steam pressure target scales with firing rate (at full fire → 160 bar)
    pressure_target = heat_input * PRESSURE_RATED
    # Steam demand from turbine reduces pressure
    steam_out = controls.get("turbine_steam_demand", 0.0)   # t/h
    steam_out_effect = steam_out / 400.0 * 20.0             # pressure drop
    pressure_target = max(0.0, pressure_target - steam_out_effect)
    s.steam_pressure = _lag(s.steam_pressure, pressure_target, tau=15.0, dt=dt)

    # Steam temperature
    temp_target = 250.0 + heat_input * 290.0    # 250–540°C range
    s.steam_temp = _lag(s.steam_temp, temp_target, tau=10.0, dt=dt)

    # Flue gas temp
    s.flue_gas_temp = 120.0 + heat_input * 230.0

    # Steam flow (t/h) — proportional to pressure and firing
    s.steam_flow = heat_input * 400.0  # max 400 t/h at full load

    # ── Drum water level ──────────────────────────────────────────────────────
    # Level rises with feedwater in, falls with steam out
    fw_in = fw.feedwater_flow         # t/h
    steam_out_th = s.steam_flow       # t/h equivalent

    # Rate of level change: %/s
    level_rate = (fw_in - steam_out_th) / 400.0 * (100.0 / 600.0)   # 10 min residence
    s.drum_level += level_rate * dt
    s.drum_level = max(0.0, min(100.0, s.drum_level))

    # ── Fault injection ───────────────────────────────────────────────────────
    if controls.get("fault_overtemp"):
        s.steam_temp = min(600.0, s.steam_temp + 2.0 * dt)

    # ── Trip logic ────────────────────────────────────────────────────────────
    if not s.tripped and s.running:
        if s.steam_pressure >= PRESSURE_MAX:
            s.tripped = True
            s.trip_reason = f"Overpressure: {s.steam_pressure:.1f} bar"
            if add_soe: add_soe("TRIP", "BOILER TRIP", s.trip_reason)
        elif s.steam_temp >= TEMP_MAX:
            s.tripped = True
            s.trip_reason = f"Overtemperature: {s.steam_temp:.1f} °C"
            if add_soe: add_soe("TRIP", "BOILER TRIP", s.trip_reason)
        elif s.drum_level <= DRUM_LEVEL_LOW_LOW:
            s.tripped = True
            s.trip_reason = f"Drum low-low level: {s.drum_level:.1f} %"
            if add_soe: add_soe("TRIP", "BOILER TRIP", s.trip_reason)

    if s.tripped:
        s.firing_rate = _lag(s.firing_rate, 0.0, tau=3.0, dt=dt)

    return s
