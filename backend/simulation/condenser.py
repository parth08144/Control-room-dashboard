"""
Condenser / Cooling Tower physics.
Steam from turbine exhaust → condensate, cooling water temp rise.
"""
import math
from .models import CondenserState, TurbineState, GeneratorState


CP_WATER = 4.186       # kJ/(kg·°C)
MAX_CW_FLOW = 8000.0   # m³/h


def _lag(current: float, target: float, tau: float, dt: float) -> float:
    alpha = 1.0 - math.exp(-dt / tau)
    return current + alpha * (target - current)


def update(state: CondenserState, turbine: TurbineState, generator: GeneratorState,
           dt: float, controls: dict, add_soe=None) -> CondenserState:
    s = state

    # ── Cooling tower fans ────────────────────────────────────────────────────
    fans_target = int(controls.get("cooling_fans", 4)) if turbine.running else 0
    s.cooling_tower_fans = fans_target

    # ── Cooling water flow ────────────────────────────────────────────────────
    cw_flow_target = (s.cooling_tower_fans / 4.0) * MAX_CW_FLOW
    s.cooling_water_flow = _lag(s.cooling_water_flow, cw_flow_target, tau=5.0, dt=dt)

    # ── Heat rejection ─────────────────────────────────────────────────────────
    # Heat in = total steam heat minus electrical output
    # Simplified: heat_rejection ≈ turbine_steam_flow × latent_heat × (1 - η)
    steam_enthalpy = turbine.steam_flow_in * 2.1   # MJ/t approx latent+sensible
    electrical_out = generator.mw_output
    s.heat_rejection = max(0.0, steam_enthalpy - electrical_out)

    # ── Cooling water outlet temperature ─────────────────────────────────────
    if s.cooling_water_flow > 0:
        # Q = m_dot * Cp * dT  →  dT = Q / (m_dot * Cp)
        m_dot_kgs = s.cooling_water_flow / 3.6   # m³/h → kg/s (approx for water)
        delta_t_target = (s.heat_rejection * 1000.0) / (m_dot_kgs * CP_WATER * 3600.0) if m_dot_kgs > 0 else 0.0
        delta_t_target = min(15.0, delta_t_target)
    else:
        delta_t_target = 0.0

    s.cooling_water_out = _lag(s.cooling_water_out,
                               s.cooling_water_in + delta_t_target, tau=10.0, dt=dt)

    # ── Condensate ────────────────────────────────────────────────────────────
    s.condensate_flow = turbine.steam_flow_in * 0.98   # 98% conversion
    condensate_temp_target = s.cooling_water_out + 5.0
    s.condensate_temp = _lag(s.condensate_temp, condensate_temp_target, tau=5.0, dt=dt)

    # ── Vacuum (better cooling → deeper vacuum) ───────────────────────────────
    # Full cooling water flow → -0.92 bar, no flow → -0.50 bar
    cw_fraction = min(1.0, s.cooling_water_flow / MAX_CW_FLOW)
    vacuum_target = -0.50 - cw_fraction * 0.42 if turbine.running else -0.01
    s.vacuum = _lag(s.vacuum, vacuum_target, tau=15.0, dt=dt)

    return s
