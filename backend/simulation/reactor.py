"""
Nuclear Reactor Model (PWR - Pressurized Water Reactor)
Simplistic physics for demonstration.
"""
from __future__ import annotations
import math
from typing import Dict, Any, Callable
from .models import ReactorState, FeedwaterState

# Tuning constants
ROD_WORTH = 2.0             # Reactivity per % withdrawn
DECAY_CONSTANT = 0.1        # Simple neutron decay
HEAT_CAPACITY = 100.0       # Thermal inertia of core
SG_HEAT_TRANSFER = 10.0     # Heat transfer coefficient to steam generator

def update(s: ReactorState, fw: FeedwaterState, dt: float, controls: Dict[str, Any], log: Callable) -> ReactorState:
    # 1. Handle commands
    if controls.get("reactor_scram"):
        if s.running and not s.tripped:
            log("TRIP", "REACTOR SCRAM", "Manual SCRAM initiated.")
            s.running = False
            s.tripped = True
            s.trip_reason = "MANUAL SCRAM"
    if controls.get("reactor_reset"):
        if s.tripped:
            log("COMMAND", "REACTOR RESET", "Trip reset.")
            s.tripped = False
            s.trip_reason = ""
    if controls.get("reactor_start"):
        if not s.running and not s.tripped:
            log("COMMAND", "REACTOR START", "Reactor start sequence initiated.")
            s.running = True

    # 2. Control Rods
    target_rods = float(controls.get("control_rods", s.control_rods))
    if s.tripped:
        target_rods = 0.0  # Drop rods on trip
    
    # Rate limit rod movement
    rod_speed = 5.0 * dt
    if target_rods > s.control_rods:
        s.control_rods = min(target_rods, s.control_rods + rod_speed)
    elif target_rods < s.control_rods:
        s.control_rods = max(target_rods, s.control_rods - (rod_speed if not s.tripped else 100.0)) # Fast drop on trip

    # 3. Neutron Flux (point kinetics approximation)
    if s.running or s.tripped:
        # Simple delayed/prompt model: flux follows rod position with some lag and decay heat
        reactivity = (s.control_rods / 100.0) * ROD_WORTH
        target_flux = max(0.0, (s.control_rods / 100.0) * 120.0)
        s.neutron_flux += (target_flux - s.neutron_flux) * 0.1 * dt
        # Minimum decay heat
        if s.tripped and s.neutron_flux < 5.0:
            s.neutron_flux = max(0.0, s.neutron_flux - 0.01 * dt)
    else:
        s.neutron_flux = 0.0
        s.control_rods = 0.0

    # 4. Core Temperature (Heat generation vs removal)
    heat_in = s.neutron_flux * 30.0 # Heat generated
    heat_out = s.coolant_flow * (s.core_temp - 290.0) * 0.5 # Heat removed by primary coolant
    s.core_temp += ((heat_in - heat_out) / HEAT_CAPACITY) * dt
    s.core_temp = max(40.0, s.core_temp)

    # 5. Coolant Flow (Primary)
    # Fixed at 100% when running for simplicity
    s.coolant_flow = 100.0 if (s.running or s.neutron_flux > 1.0) else 0.0

    # 6. Steam Generation (Secondary Loop)
    # Heat transfer from primary (core_temp) to secondary (steam generator)
    # Steam generator temperature approaches core temp based on flow
    sg_temp = max(20.0, s.core_temp - 20.0)
    
    # Steam pressure builds up if SG temp > 100C
    if sg_temp > 100.0:
        target_pressure = (sg_temp - 100.0) * 0.5 # Simplified pressure curve
    else:
        target_pressure = 0.0
    
    # Pressure dynamics
    steam_demand = controls.get("turbine_steam_demand", 0.0)
    pressure_change = (target_pressure - s.steam_pressure) * 0.1 - (steam_demand * 0.02)
    s.steam_pressure = max(0.0, s.steam_pressure + pressure_change * dt)
    s.steam_temp = sg_temp

    # Feedwater to Steam conversion (Mass balance)
    fw_in = fw.feedwater_flow
    steam_out = steam_demand if s.steam_pressure > 5.0 else 0.0
    s.steam_flow = steam_out

    # 7. Safety Limits
    if s.core_temp > 350.0 and not s.tripped:
        s.tripped = True
        s.running = False
        s.trip_reason = "CORE OVERTEMP"
        log("TRIP", "REACTOR SCRAM", f"Core overtemp: {s.core_temp:.1f} °C")
    
    if s.neutron_flux > 110.0 and not s.tripped:
        s.tripped = True
        s.running = False
        s.trip_reason = "HIGH FLUX"
        log("TRIP", "REACTOR SCRAM", f"High neutron flux: {s.neutron_flux:.1f}%")

    if s.steam_pressure > 180.0 and not s.tripped:
        s.tripped = True
        s.running = False
        s.trip_reason = "SG OVERPRESSURE"
        log("TRIP", "REACTOR SCRAM", f"SG pressure high: {s.steam_pressure:.1f} bar")

    return s
