/**
 * ControlPanel — Start/stop sequences, setpoint sliders, fault injection.
 */
import React, { useState } from 'react'
import usePlantStore from '../../hooks/usePlantStore'

function SliderRow({ label, value, min, max, step = 1, unit, onCommit, disabled = false }) {
  const [local, setLocal] = useState(value)
  const [isDragging, setIsDragging] = useState(false)

  // Sync with backend when not dragging
  React.useEffect(() => {
    if (!isDragging) setLocal(value)
  }, [value, isDragging])

  const pct = ((local - min) / (max - min) * 100).toFixed(1)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: '#7db8d4', letterSpacing: '0.05em' }}>
          {label}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: '#00e5ff', fontWeight: 700 }}>
          {local.toFixed(step < 1 ? 1 : 0)} <span style={{ fontSize: 10, color: '#7db8d4' }}>{unit}</span>
        </span>
      </div>
      <input type="range" min={min} max={max} step={step}
        value={local} disabled={disabled}
        onMouseDown={() => setIsDragging(true)}
        onTouchStart={() => setIsDragging(true)}
        onChange={e => { setLocal(Number(e.target.value)) }}
        onMouseUp={() => { setIsDragging(false); onCommit(local) }}
        onTouchEnd={() => { setIsDragging(false); onCommit(local) }}
        style={{ '--pct': `${pct}%` }}
      />
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="glass-panel" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="section-header">{title}</div>
      {children}
    </div>
  )
}

function CtrlBtn({ label, onClick, variant = 'cyan', disabled = false }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`btn btn-${variant}`}
      style={{ flex: 1, fontSize: 12, padding: '8px 12px' }}
    >{label}</button>
  )
}

export default function ControlPanel({ playClick }) {
  const sendControlStore = usePlantStore(s => s.sendControl)
  
  const sendControl = (payload) => {
    if (playClick) playClick()
    sendControlStore(payload)
  }
  const plantState  = usePlantStore(s => s.plantState)

  const simMode   = plantState?.sim_mode  ?? 'coal'
  const boiler    = plantState?.boiler    ?? {}
  const reactor   = plantState?.reactor   ?? {}
  const turbine   = plantState?.turbine   ?? {}
  const generator = plantState?.generator ?? {}
  const feedwater = plantState?.feedwater ?? {}
  const condenser = plantState?.condenser ?? {}

  // ── Boiler ─────────────────────────────────────────────────────────────────
  const startBoiler = () => sendControl({ 
    boiler_start: true, pump_a_start: true, pump_b_start: true,
    fuel_demand: 25, pump_a_speed: 60, pump_b_speed: 60
  })
  const stopBoiler  = () => sendControl({ boiler_stop: true })
  const resetBoiler = () => sendControl({ boiler_reset: true, turbine_reset: true, gen_reset: true })

  // ── Turbine ────────────────────────────────────────────────────────────────
  const startTurbine = () => sendControl({ turbine_start: true })
  const stopTurbine  = () => sendControl({ turbine_stop: true })
  const resetTurbine = () => sendControl({ turbine_reset: true })

  // ── Generator ─────────────────────────────────────────────────────────────
  const closeBreaker = () => sendControl({ gen_breaker_close: true })
  const openBreaker  = () => sendControl({ gen_breaker_open: true })

  // ── Fault injection ───────────────────────────────────────────────────────
  const injectFault = (fault) => sendControl({ [fault]: true })

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      padding: 20, gap: 12, overflowY: 'auto',
    }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: '#00e5ff', letterSpacing: '0.1em' }}>
        🎛 CONTROL PANEL
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>

        {/* ── Source Controls ── */}
        {simMode === 'coal' ? (
          <Section title="🔥 Boiler">
            <div style={{ display: 'flex', gap: 8 }}>
              <CtrlBtn label="START" onClick={startBoiler} variant="green"
                disabled={boiler.running && !boiler.tripped} />
              <CtrlBtn label="STOP" onClick={stopBoiler} variant="red"
                disabled={!boiler.running} />
              <CtrlBtn label="RESET" onClick={resetBoiler} variant="amber"
                disabled={!boiler.tripped} />
            </div>

            <SliderRow
              label="Fuel Demand" value={boiler.fuel_demand ?? 0}
              min={0} max={100} unit="%"
              disabled={!boiler.running}
              onCommit={v => sendControl({ fuel_demand: v })}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: '#3a6a85', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Status
              </span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className={`badge ${boiler.running ? 'badge-green' : 'badge-grey'}`}>
                  {boiler.running ? 'RUNNING' : 'OFFLINE'}
                </span>
                {boiler.tripped && <span className="badge badge-red">TRIPPED: {boiler.trip_reason}</span>}
              </div>
            </div>
          </Section>
        ) : (
          <Section title="☢ Reactor">
            <div style={{ display: 'flex', gap: 8 }}>
              <CtrlBtn label="START" onClick={() => sendControl({ reactor_start: true, pump_a_start: true, pump_b_start: true, pump_a_speed: 60, pump_b_speed: 60, control_rods: 10 })} variant="green"
                disabled={reactor.running && !reactor.tripped} />
              <CtrlBtn label="SCRAM" onClick={() => sendControl({ reactor_scram: true })} variant="red"
                disabled={!reactor.running} />
              <CtrlBtn label="RESET" onClick={() => sendControl({ reactor_reset: true, turbine_reset: true, gen_reset: true })} variant="amber"
                disabled={!reactor.tripped} />
            </div>

            <SliderRow
              label="Control Rods (Withdraw)" value={reactor.control_rods ?? 0}
              min={0} max={100} unit="%"
              disabled={!reactor.running}
              onCommit={v => sendControl({ control_rods: v })}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: '#3a6a85', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Status
              </span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className={`badge ${reactor.running ? 'badge-green' : 'badge-grey'}`}>
                  {reactor.running ? 'RUNNING' : 'OFFLINE'}
                </span>
                {reactor.tripped && <span className="badge badge-red">TRIPPED: {reactor.trip_reason}</span>}
              </div>
            </div>
          </Section>
        )}

        {/* ── Turbine Controls ── */}
        <Section title="⚙ Turbine">
          <div style={{ display: 'flex', gap: 8 }}>
            <CtrlBtn label="START" onClick={startTurbine} variant="green"
              disabled={turbine.running || (simMode==='coal' ? (!boiler.running || boiler.steam_pressure < 20) : (!reactor.running || reactor.steam_pressure < 20))} />
            <CtrlBtn label="TRIP" onClick={stopTurbine} variant="red"
              disabled={!turbine.running} />
            <CtrlBtn label="RESET" onClick={resetTurbine} variant="amber"
              disabled={!turbine.tripped} />
          </div>

          <SliderRow
            label="Governor Setpoint" value={100}
            min={0} max={100} unit="% rated"
            disabled={!turbine.running}
            onCommit={v => sendControl({ governor_setpoint: v })}
          />

          <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className={`badge ${turbine.running ? 'badge-green' : 'badge-grey'}`}>
              {turbine.running ? 'RUNNING' : 'OFFLINE'}
            </span>
            <span className="badge badge-cyan" style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>
              {(turbine.rpm_actual ?? 0).toFixed(0)} RPM
            </span>
            {turbine.tripped && <span className="badge badge-red">TRIPPED</span>}
          </div>
        </Section>

        {/* ── Generator Controls ── */}
        <Section title="⚡ Generator">
          <div style={{ display: 'flex', gap: 8 }}>
            <CtrlBtn label="CLOSE BKR" onClick={closeBreaker} variant="green"
              disabled={generator.breaker_closed || !generator.running} />
            <CtrlBtn label="OPEN BKR" onClick={openBreaker} variant="red"
              disabled={!generator.breaker_closed} />
          </div>

          <SliderRow
            label="Excitation" value={100}
            min={80} max={110} unit="%"
            disabled={!generator.running}
            onCommit={v => sendControl({ excitation_setpoint: v })}
          />

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span className={`badge ${generator.breaker_closed ? 'badge-green' : 'badge-grey'}`}>
              {generator.breaker_closed ? 'ON GRID' : 'ISOLATED'}
            </span>
            <span className="badge badge-cyan" style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>
              {(generator.mw_output ?? 0).toFixed(1)} MW
            </span>
          </div>
        </Section>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

        {/* ── Feedwater ── */}
        <Section title="💧 Feedwater Pumps">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: feedwater.pump_a_fault ? '#ff5252' : feedwater.pump_a_running ? '#00e5ff' : '#3a6a85', marginBottom: 6 }}>
                PUMP A {feedwater.pump_a_fault ? '⚠FAULT' : feedwater.pump_a_running ? '●RUN' : '○STOP'}
              </div>
              <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                <CtrlBtn label="START" onClick={() => sendControl({ pump_a_start: true })} variant="green"
                  disabled={feedwater.pump_a_running} />
                <CtrlBtn label="STOP" onClick={() => sendControl({ pump_a_stop: true })} variant="red"
                  disabled={!feedwater.pump_a_running} />
              </div>
              <SliderRow
                label="Speed A" value={feedwater.pump_a_speed ?? 0}
                min={0} max={100} unit="%"
                disabled={!feedwater.pump_a_running}
                onCommit={v => sendControl({ pump_a_speed: v })}
              />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: feedwater.pump_b_fault ? '#ff5252' : feedwater.pump_b_running ? '#00e5ff' : '#3a6a85', marginBottom: 6 }}>
                PUMP B {feedwater.pump_b_fault ? '⚠FAULT' : feedwater.pump_b_running ? '●RUN' : '○STOP'}
              </div>
              <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                <CtrlBtn label="START" onClick={() => sendControl({ pump_b_start: true })} variant="green"
                  disabled={feedwater.pump_b_running} />
                <CtrlBtn label="STOP" onClick={() => sendControl({ pump_b_stop: true })} variant="red"
                  disabled={!feedwater.pump_b_running} />
              </div>
              <SliderRow
                label="Speed B" value={feedwater.pump_b_speed ?? 0}
                min={0} max={100} unit="%"
                disabled={!feedwater.pump_b_running}
                onCommit={v => sendControl({ pump_b_speed: v })}
              />
            </div>
          </div>
        </Section>

        {/* ── Fault Injection ── */}
        <Section title="🧪 FAULT INJECTION (Simulation)">
          <div style={{
            padding: '8px 10px',
            background: 'rgba(255,50,0,0.06)',
            border: '1px solid rgba(255,80,0,0.2)',
            borderRadius: 6, marginBottom: 8,
            fontFamily: 'var(--font-ui)', fontSize: 11, color: '#ff9800',
          }}>
            ⚠ Inject simulated faults for testing alarm response
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {simMode === 'coal' && [
              { key: 'fault_overtemp',   label: '🔥 Boiler Overtemp' },
            ].map(f => (
              <button key={f.key}
                onClick={() => injectFault(f.key)}
                style={{
                  background: 'rgba(200,50,0,0.1)',
                  border: '1px solid rgba(255,80,0,0.35)',
                  color: '#ff9800', fontFamily: 'var(--font-ui)',
                  fontWeight: 600, fontSize: 11, letterSpacing: '0.04em',
                  padding: '7px 10px', cursor: 'pointer', borderRadius: 5,
                  textAlign: 'left', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.target.style.background = 'rgba(255,80,0,0.2)' }}
                onMouseLeave={e => { e.target.style.background = 'rgba(200,50,0,0.1)' }}
              >{f.label}</button>
            ))}
            {[
              { key: 'fault_vibration',  label: '〰 Turbine Vibration' },
              { key: 'fault_overspeed',  label: '⚡ Turbine Overspeed' },
              { key: 'fault_pump_a',     label: '💧 FW Pump A Fault' },
              { key: 'fault_pump_b',     label: '💧 FW Pump B Fault' },
              { key: 'fault_loss_of_feedwater', label: '🛑 Loss of All FW' },
            ].map(f => (
              <button key={f.key}
                onClick={() => injectFault(f.key)}
                style={{
                  background: 'rgba(200,50,0,0.1)',
                  border: '1px solid rgba(255,80,0,0.35)',
                  color: '#ff9800', fontFamily: 'var(--font-ui)',
                  fontWeight: 600, fontSize: 11, letterSpacing: '0.04em',
                  padding: '7px 10px', cursor: 'pointer', borderRadius: 5,
                  textAlign: 'left', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.target.style.background = 'rgba(255,80,0,0.2)' }}
                onMouseLeave={e => { e.target.style.background = 'rgba(200,50,0,0.1)' }}
              >{f.label}</button>
            ))}
            <button onClick={() => simMode === 'coal' ? resetBoiler() : sendControl({ reactor_reset: true, turbine_reset: true, gen_reset: true })}
              style={{
                background: 'rgba(0,180,220,0.1)',
                border: '1px solid rgba(0,180,220,0.35)',
                color: '#00e5ff', fontFamily: 'var(--font-ui)',
                fontWeight: 700, fontSize: 11, letterSpacing: '0.04em',
                padding: '7px 10px', cursor: 'pointer', borderRadius: 5,
                textAlign: 'left',
              }}
            >🔄 RESET ALL TRIPS</button>
          </div>
        </Section>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* ── Simulation Mode ── */}
        <Section title="🌐 Simulation Mode">
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => sendControl({ sim_mode: 'coal' })}
              style={{
                flex: 1, padding: '10px',
                background: simMode === 'coal' ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${simMode === 'coal' ? '#00ff88' : '#334155'}`,
                color: simMode === 'coal' ? '#00ff88' : '#94a3b8',
                borderRadius: 8, fontFamily: 'var(--font-ui)', fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >COAL / GAS</button>
            <button onClick={() => sendControl({ sim_mode: 'nuclear' })}
              style={{
                flex: 1, padding: '10px',
                background: simMode === 'nuclear' ? 'rgba(0,255,170,0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${simMode === 'nuclear' ? '#00ffaa' : '#334155'}`,
                color: simMode === 'nuclear' ? '#00ffaa' : '#94a3b8',
                borderRadius: 8, fontFamily: 'var(--font-ui)', fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >NUCLEAR (PWR)</button>
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
            Warning: Switching modes will reset the plant dynamics.
          </div>
        </Section>

        {/* ── Cooling tower ── */}
        <Section title="🌬 Cooling Tower">
        <SliderRow
          label="Cooling Fans Active"
          value={condenser.cooling_tower_fans ?? 4}
          min={0} max={4} step={1} unit=" fans"
          onCommit={v => sendControl({ cooling_fans: Math.round(v) })}
        />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span className="badge badge-cyan" style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>
            CW ΔT: {((condenser.cooling_water_out ?? 0) - (condenser.cooling_water_in ?? 0)).toFixed(1)} °C
          </span>
          <span className="badge badge-cyan" style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>
            Vacuum: {(condenser.vacuum ?? 0).toFixed(3)} bar
          </span>
          <span className="badge badge-cyan" style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>
            Q_rej: {(condenser.heat_rejection ?? 0).toFixed(0)} MW
          </span>
        </div>
      </Section>
      </div>
    </div>
  )
}
