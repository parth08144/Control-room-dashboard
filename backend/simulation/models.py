"""
PlantState — full serializable snapshot of all simulation variables.
Broadcast over WebSocket every simulation tick.
"""
from __future__ import annotations
from dataclasses import dataclass, field, asdict
from typing import List, Optional
import json


@dataclass
class BoilerState:
    fuel_demand: float = 0.0        # % operator setpoint 0-100
    firing_rate: float = 0.0        # % actual (lagged)
    steam_pressure: float = 0.0     # bar
    steam_temp: float = 20.0        # °C
    drum_level: float = 50.0        # % (0-100)
    steam_flow: float = 0.0         # t/h
    flue_gas_temp: float = 20.0     # °C
    running: bool = False
    tripped: bool = False
    trip_reason: str = ""


@dataclass
class TurbineState:
    rpm_setpoint: float = 0.0       # rpm target
    rpm_actual: float = 0.0         # rpm actual (lagged)
    mechanical_power: float = 0.0   # MW
    steam_flow_in: float = 0.0      # t/h consumed
    vibration: float = 0.1          # mm/s
    bearing_temp: float = 40.0      # °C
    running: bool = False
    tripped: bool = False
    trip_reason: str = ""
    fault_vibration: bool = False
    fault_overspeed: bool = False


@dataclass
class GeneratorState:
    mw_output: float = 0.0          # MW
    mvar_output: float = 0.0        # MVAr
    frequency: float = 50.0         # Hz
    voltage: float = 11.0           # kV
    stator_temp: float = 40.0       # °C
    excitation: float = 0.0         # % 0-100
    breaker_closed: bool = False
    tripped: bool = False
    trip_reason: str = ""
    running: bool = False


@dataclass
class FeedwaterState:
    pump_a_speed: float = 0.0       # % 0-100
    pump_b_speed: float = 0.0       # % 0-100
    pump_a_running: bool = False
    pump_b_running: bool = False
    pump_a_fault: bool = False
    pump_b_fault: bool = False
    feedwater_flow: float = 0.0     # t/h total
    feedwater_temp: float = 120.0   # °C
    pump_a_pressure: float = 0.0    # bar
    pump_b_pressure: float = 0.0    # bar


@dataclass
class CondenserState:
    condensate_flow: float = 0.0    # t/h
    condensate_temp: float = 40.0   # °C
    cooling_water_in: float = 25.0  # °C
    cooling_water_out: float = 25.0 # °C
    cooling_water_flow: float = 0.0 # m³/h
    vacuum: float = -0.85           # bar (negative = vacuum)
    heat_rejection: float = 0.0     # MW
    cooling_tower_fans: int = 0     # number running (0-4)


@dataclass
class AlarmEntry:
    id: str = ""
    timestamp: str = ""
    tag: str = ""
    description: str = ""
    severity: str = "INFO"          # INFO / WARNING / CRITICAL
    acknowledged: bool = False
    active: bool = True
    value: float = 0.0
    limit: float = 0.0


@dataclass
class PlantState:
    tick: int = 0
    timestamp: float = 0.0
    plant_running: bool = False
    plant_power_mw: float = 0.0
    
    boiler: BoilerState = field(default_factory=BoilerState)
    turbine: TurbineState = field(default_factory=TurbineState)
    generator: GeneratorState = field(default_factory=GeneratorState)
    feedwater: FeedwaterState = field(default_factory=FeedwaterState)
    condenser: CondenserState = field(default_factory=CondenserState)
    
    active_alarms: List[AlarmEntry] = field(default_factory=list)
    alarm_count_critical: int = 0
    alarm_count_warning: int = 0
    alarm_count_info: int = 0

    def to_dict(self) -> dict:
        return asdict(self)

    def to_json(self) -> str:
        return json.dumps(self.to_dict())
