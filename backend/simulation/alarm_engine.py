"""
Alarm engine — evaluates plant state each tick, generates/clears alarm entries.
"""
from __future__ import annotations
from datetime import datetime, timezone
from typing import List, Dict
import uuid
from .models import PlantState, AlarmEntry


# ── Alarm definitions: (tag, description, severity, check_fn) ─────────────────
def _make_check(tag, description, severity, check_fn):
    return {"tag": tag, "description": description, "severity": severity, "check": check_fn}


ALARM_DEFS = [
    # Boiler
    _make_check("B-PT-001-HH", "Boiler Steam Pressure HIGH HIGH",  "CRITICAL", lambda s: s.sim_mode == "coal" and s.boiler.steam_pressure > 170.0),
    _make_check("B-PT-001-H",  "Boiler Steam Pressure HIGH",       "WARNING",  lambda s: s.sim_mode == "coal" and s.boiler.steam_pressure > 155.0),
    _make_check("B-TT-001-HH", "Steam Temperature HIGH HIGH",      "CRITICAL", lambda s: s.sim_mode == "coal" and s.boiler.steam_temp > 545.0),
    _make_check("B-TT-001-H",  "Steam Temperature HIGH",           "WARNING",  lambda s: s.sim_mode == "coal" and s.boiler.steam_temp > 530.0),
    _make_check("B-LT-001-LL", "Drum Level LOW LOW",               "CRITICAL", lambda s: s.sim_mode == "coal" and s.boiler.drum_level < 15.0),
    _make_check("B-LT-001-L",  "Drum Level LOW",                   "WARNING",  lambda s: s.sim_mode == "coal" and s.boiler.drum_level < 25.0),
    _make_check("B-LT-001-HH", "Drum Level HIGH HIGH",             "CRITICAL", lambda s: s.sim_mode == "coal" and s.boiler.drum_level > 85.0),
    _make_check("B-TRIP",      "Boiler TRIPPED",                   "CRITICAL", lambda s: s.sim_mode == "coal" and s.boiler.tripped),

    # Reactor
    _make_check("R-FLX-001-HH", "Reactor Neutron Flux HIGH HIGH", "CRITICAL", lambda s: s.sim_mode == "nuclear" and s.reactor.neutron_flux > 105.0),
    _make_check("R-FLX-001-H",  "Reactor Neutron Flux HIGH",      "WARNING",  lambda s: s.sim_mode == "nuclear" and s.reactor.neutron_flux > 95.0),
    _make_check("R-TT-001-HH",  "Core Temperature HIGH HIGH",     "CRITICAL", lambda s: s.sim_mode == "nuclear" and s.reactor.core_temp > 340.0),
    _make_check("R-TT-001-H",   "Core Temperature HIGH",          "WARNING",  lambda s: s.sim_mode == "nuclear" and s.reactor.core_temp > 320.0),
    _make_check("R-PT-001-HH",  "Steam Generator Press HIGH HIGH", "CRITICAL", lambda s: s.sim_mode == "nuclear" and s.reactor.steam_pressure > 170.0),
    _make_check("R-PT-001-H",   "Steam Generator Press HIGH",     "WARNING",  lambda s: s.sim_mode == "nuclear" and s.reactor.steam_pressure > 155.0),
    _make_check("R-TRIP",       "Reactor SCRAM (TRIPPED)",        "CRITICAL", lambda s: s.sim_mode == "nuclear" and s.reactor.tripped),

    # Turbine
    _make_check("T-ST-001-HH", "Turbine Overspeed TRIP",           "CRITICAL", lambda s: s.turbine.rpm_actual > 3250.0),
    _make_check("T-ST-001-H",  "Turbine Speed HIGH",               "WARNING",  lambda s: s.turbine.rpm_actual > 3100.0),
    _make_check("T-VB-001-HH", "Turbine Vibration HIGH HIGH",      "CRITICAL", lambda s: s.turbine.vibration > 6.0),
    _make_check("T-VB-001-H",  "Turbine Vibration HIGH",           "WARNING",  lambda s: s.turbine.vibration > 4.0),
    _make_check("T-TT-001-H",  "Bearing Temp HIGH",                "WARNING",  lambda s: s.turbine.bearing_temp > 80.0),
    _make_check("T-TRIP",      "Turbine TRIPPED",                   "CRITICAL", lambda s: s.turbine.tripped),

    # Generator
    _make_check("G-FQ-001-L",  "Generator Under-frequency",        "CRITICAL", lambda s: s.generator.frequency < 48.0 and s.generator.running),
    _make_check("G-FQ-001-H",  "Generator Over-frequency",         "CRITICAL", lambda s: s.generator.frequency > 51.5 and s.generator.running),
    _make_check("G-TT-001-H",  "Generator Stator Temp HIGH",       "WARNING",  lambda s: s.generator.stator_temp > 100.0),
    _make_check("G-TRIP",      "Generator TRIPPED",                "CRITICAL", lambda s: s.generator.tripped),

    # Feedwater
    _make_check("FW-PA-FAULT",  "Feedwater Pump A FAULT",          "WARNING",  lambda s: s.feedwater.pump_a_fault),
    _make_check("FW-PB-FAULT",  "Feedwater Pump B FAULT",          "WARNING",  lambda s: s.feedwater.pump_b_fault),
    _make_check("FW-FLOW-L",    "Feedwater Flow LOW",               "WARNING",
                lambda s: s.feedwater.feedwater_flow < 100.0 and ((s.sim_mode == "coal" and s.boiler.running) or (s.sim_mode == "nuclear" and s.reactor.running))),

    # Condenser
    _make_check("C-VAC-L",  "Condenser Vacuum LOW",                "WARNING",  lambda s: s.condenser.vacuum > -0.6 and s.turbine.running),
]


class AlarmEngine:
    def __init__(self):
        self._active: Dict[str, AlarmEntry] = {}    # tag → AlarmEntry
        self._history: List[AlarmEntry] = []         # all historical entries

    def evaluate(self, state: PlantState) -> List[AlarmEntry]:
        """
        Evaluate all alarm conditions. Return current active alarm list.
        """
        now = datetime.now(timezone.utc).isoformat()

        for defn in ALARM_DEFS:
            tag = defn["tag"]
            triggered = defn["check"](state)

            if triggered and tag not in self._active:
                # New alarm raised
                entry = AlarmEntry(
                    id=str(uuid.uuid4())[:8],
                    timestamp=now,
                    tag=tag,
                    description=defn["description"],
                    severity=defn["severity"],
                    acknowledged=False,
                    active=True,
                    value=0.0,
                    limit=0.0,
                )
                self._active[tag] = entry
                self._history.append(entry)
                state.add_soe("ALARM", f"ALARM RAISED: {tag}", f"Severity: {defn['severity']} - {defn['description']}")

            elif not triggered and tag in self._active:
                # Alarm cleared
                self._active[tag].active = False
                state.add_soe("ALARM", f"ALARM CLEARED: {tag}", f"{defn['description']}")
                del self._active[tag]

        active_list = list(self._active.values())
        # Sort: CRITICAL first, then WARNING, then INFO
        severity_order = {"CRITICAL": 0, "WARNING": 1, "INFO": 2}
        active_list.sort(key=lambda a: (severity_order.get(a.severity, 9), a.timestamp))
        return active_list

    def acknowledge(self, alarm_id: str):
        for alarm in self._active.values():
            if alarm.id == alarm_id:
                alarm.acknowledged = True
                return True
        return False

    def acknowledge_all(self):
        for alarm in self._active.values():
            alarm.acknowledged = True

    def get_history(self, limit: int = 200) -> List[AlarmEntry]:
        return list(reversed(self._history[-limit:]))
