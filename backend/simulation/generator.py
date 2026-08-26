"""
Generator physics simulation.
RPM → MW output, frequency, voltage.
"""
import math
from .models import GeneratorState, TurbineState


RATED_MW = 660.0
RATED_RPM = 3000.0
RATED_FREQ = 50.0
RATED_KV = 11.0
FREQ_TRIP_LOW = 47.5
FREQ_TRIP_HIGH = 52.0
TEMP_TRIP = 120.0


def _lag(current: float, target: float, tau: float, dt: float) -> float:
    alpha = 1.0 - math.exp(-dt / tau)
    return current + alpha * (target - current)


def update(state: GeneratorState, turbine: TurbineState, dt: float, controls: dict) -> GeneratorState:
    s = state

    # ── Reset ─────────────────────────────────────────────────────────────────
    if controls.get("gen_reset") and s.tripped:
        s.tripped = False
        s.trip_reason = ""

    # ── Running state ─────────────────────────────────────────────────────────
    can_run = turbine.running and turbine.rpm_actual > 2800 and not turbine.tripped
    s.running = can_run and not s.tripped

    # ── Frequency ─────────────────────────────────────────────────────────────
    freq_target = RATED_FREQ * (turbine.rpm_actual / RATED_RPM) if turbine.rpm_actual > 0 else 0.0
    s.frequency = _lag(s.frequency, freq_target, tau=2.0, dt=dt)

    # ── Excitation & voltage ──────────────────────────────────────────────────
    if s.running:
        exc_setpoint = float(controls.get("excitation_setpoint", 100.0))
        s.excitation = _lag(s.excitation, exc_setpoint, tau=3.0, dt=dt)
        s.voltage = RATED_KV * (s.excitation / 100.0) * (s.frequency / RATED_FREQ)
    else:
        s.excitation = _lag(s.excitation, 0.0, tau=5.0, dt=dt)
        s.voltage = _lag(s.voltage, 0.0, tau=5.0, dt=dt)

    # ── Breaker & MW output ───────────────────────────────────────────────────
    if controls.get("gen_breaker_close") and s.running and abs(s.frequency - 50.0) < 0.5:
        s.breaker_closed = True
    if controls.get("gen_breaker_open") or s.tripped:
        s.breaker_closed = False

    if s.breaker_closed and s.running:
        mw_target = turbine.mechanical_power * 0.985  # generator efficiency
        s.mw_output = _lag(s.mw_output, mw_target, tau=2.0, dt=dt)
        # MVAr ~ 30% of MW for typical pf 0.95
        s.mvar_output = s.mw_output * 0.33
    else:
        s.mw_output = _lag(s.mw_output, 0.0, tau=3.0, dt=dt)
        s.mvar_output = _lag(s.mvar_output, 0.0, tau=3.0, dt=dt)

    # ── Stator temp ───────────────────────────────────────────────────────────
    load_pu = s.mw_output / RATED_MW
    temp_target = 40.0 + load_pu * 65.0
    s.stator_temp = _lag(s.stator_temp, temp_target, tau=60.0, dt=dt)

    # ── Trip logic ────────────────────────────────────────────────────────────
    if not s.tripped and s.running:
        if s.frequency > 0 and s.frequency < FREQ_TRIP_LOW:
            s.tripped = True
            s.trip_reason = f"Under-frequency: {s.frequency:.2f} Hz"
        elif s.frequency > FREQ_TRIP_HIGH:
            s.tripped = True
            s.trip_reason = f"Over-frequency: {s.frequency:.2f} Hz"
        elif s.stator_temp >= TEMP_TRIP:
            s.tripped = True
            s.trip_reason = f"Stator overtemp: {s.stator_temp:.1f} °C"

    return s
