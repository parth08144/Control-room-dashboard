/**
 * OverviewScreen v2 — Plant diagram + colourful KPI strip + status panels.
 */
import React from 'react'
import PlantDiagram from './PlantDiagram'
import usePlantStore from '../../hooks/usePlantStore'

function KpiCard({ label, value, unit, subtext, color, bg, border, icon, alarm }) {
  return (
    <div style={{
      flex: 1, minWidth: 110,
      padding: '10px 14px',
      background: alarm ? 'rgba(80,0,10,0.5)' : bg,
      border: `1px solid ${alarm ? 'rgba(255,23,68,0.5)' : border}`,
      borderRadius: 10,
      position: 'relative', overflow: 'hidden',
      backdropFilter: 'blur(12px)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'default',
      animation: alarm ? 'alarmPulse 1.2s infinite' : 'none',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 24px ${border}44` }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
    >
      {/* Bottom accent bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
        background: alarm
          ? 'linear-gradient(90deg, transparent, #ff1744, transparent)'
          : `linear-gradient(90deg, transparent, ${color}, transparent)`,
        boxShadow: `0 0 8px ${alarm ? '#ff1744' : color}`,
      }} />
      {/* Icon */}
      <div style={{ fontSize: 16, marginBottom: 3 }}>{icon}</div>
      {/* Value */}
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700,
        color: alarm ? '#ff5252' : color,
        textShadow: `0 0 10px ${alarm ? 'rgba(255,80,80,0.6)' : color}88`,
        lineHeight: 1,
      }}>
        {value}
        <span style={{ fontSize: 10, fontFamily: 'var(--font-ui)', color: 'var(--text-secondary)', marginLeft: 3 }}>
          {unit}
        </span>
      </div>
      {/* Label */}
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 3 }}>
        {label}
      </div>
      {subtext && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>
          {subtext}
        </div>
      )}
    </div>
  )
}

function StatusStrip({ state }) {
  const b = state?.boiler    ?? {}
  const t = state?.turbine   ?? {}
  const g = state?.generator ?? {}
  const f = state?.feedwater ?? {}
  const c = state?.condenser ?? {}

  const systems = [
    {
      name: 'BOILER', icon: '🔥',
      status: b.tripped ? 'TRIPPED' : b.running ? 'RUNNING' : 'OFFLINE',
      color: b.tripped ? '#ff1744' : b.running ? '#00ff88' : '#3a6a85',
      detail: `${(b.steam_pressure??0).toFixed(0)} bar · ${(b.firing_rate??0).toFixed(0)}% fire`,
    },
    {
      name: 'TURBINE', icon: '⚙',
      status: t.tripped ? 'TRIPPED' : t.running ? 'RUNNING' : 'OFFLINE',
      color: t.tripped ? '#ff1744' : t.running ? '#00ff88' : '#3a6a85',
      detail: `${(t.rpm_actual??0).toFixed(0)} rpm · ${(t.vibration??0).toFixed(2)} mm/s`,
    },
    {
      name: 'GENERATOR', icon: '⚡',
      status: g.tripped ? 'TRIPPED' : g.breaker_closed ? 'ON GRID' : g.running ? 'SYNC' : 'OFFLINE',
      color: g.tripped ? '#ff1744' : g.breaker_closed ? '#00ff88' : g.running ? '#b040ff' : '#3a6a85',
      detail: `${(g.mw_output??0).toFixed(1)} MW · ${(g.frequency??50).toFixed(2)} Hz`,
    },
    {
      name: 'FW PUMPS', icon: '💧',
      status: (f.pump_a_running||f.pump_b_running) ? 'RUNNING' : 'OFFLINE',
      color: (f.pump_a_fault||f.pump_b_fault) ? '#ff9800' : (f.pump_a_running||f.pump_b_running) ? '#00e5ff' : '#3a6a85',
      detail: `${(f.feedwater_flow??0).toFixed(0)} t/h · ${(b.drum_level??50).toFixed(0)}% drum`,
    },
    {
      name: 'CONDENSER', icon: '❄',
      status: t.running ? 'ACTIVE' : 'STANDBY',
      color: t.running ? '#00ffd5' : '#3a6a85',
      detail: `${(c.vacuum??0).toFixed(3)} bar vac`,
    },
  ]

  return (
    <div style={{ display: 'flex', gap: 6, padding: '0 16px 10px', flexShrink: 0 }}>
      {systems.map(s => (
        <div key={s.name} style={{
          flex: 1, padding: '7px 10px',
          background: 'rgba(0,0,0,0.4)',
          border: `1px solid ${s.color}33`,
          borderRadius: 8, backdropFilter: 'blur(8px)',
          transition: 'border-color 0.3s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
            <span style={{ fontSize: 12 }}>{s.icon}</span>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 8, fontWeight: 700,
              color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              {s.name}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.color,
              boxShadow: `0 0 6px ${s.color}`, flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700,
              color: s.color, letterSpacing: '0.05em' }}>{s.status}</span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)' }}>
            {s.detail}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function OverviewScreen() {
  const state = usePlantStore(s => s.plantState)
  const b = state?.boiler    ?? {}
  const t = state?.turbine   ?? {}
  const g = state?.generator ?? {}
  const c = state?.condenser ?? {}
  const f = state?.feedwater ?? {}

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Colourful KPI strip ── */}
      <div style={{ display: 'flex', gap: 8, padding: '10px 16px 6px', flexShrink: 0 }}>
        <KpiCard label="Power Output" value={(g.mw_output??0).toFixed(1)} unit="MW"
          subtext={`${((g.mw_output??0)/660*100).toFixed(0)}% capacity`}
          color="#00ff88" bg="rgba(0,180,80,0.1)" border="rgba(0,255,136,0.3)" icon="⚡"
          alarm={(g.mw_output??0) > 700} />
        <KpiCard label="Steam Pressure" value={(b.steam_pressure??0).toFixed(1)} unit="bar"
          subtext={`${(b.steam_temp??0).toFixed(0)}°C steam temp`}
          color="#00e5ff" bg="rgba(0,150,220,0.1)" border="rgba(0,229,255,0.3)" icon="🌡"
          alarm={(b.steam_pressure??0) > 155} />
        <KpiCard label="Turbine Speed" value={(t.rpm_actual??0).toFixed(0)} unit="rpm"
          subtext={`VIB: ${(t.vibration??0).toFixed(2)} mm/s`}
          color="#b040ff" bg="rgba(140,20,220,0.1)" border="rgba(176,64,255,0.3)" icon="⚙"
          alarm={(t.vibration??0) > 4} />
        <KpiCard label="Grid Frequency" value={(g.frequency??50).toFixed(3)} unit="Hz"
          subtext={`${(g.voltage??0).toFixed(2)} kV terminal`}
          color="#ffb300" bg="rgba(200,140,0,0.1)" border="rgba(255,179,0,0.3)" icon="📡"
          alarm={g.running && Math.abs((g.frequency??50)-50) > 0.5} />
        <KpiCard label="Drum Level" value={(b.drum_level??50).toFixed(1)} unit="%"
          subtext={`FW: ${(f.feedwater_flow??0).toFixed(0)} t/h`}
          color="#00ffd5" bg="rgba(0,180,160,0.1)" border="rgba(0,255,213,0.3)" icon="💧"
          alarm={(b.drum_level??50) < 25 || (b.drum_level??50) > 85} />
        <KpiCard label="Heat Rejection" value={(c.heat_rejection??0).toFixed(0)} unit="MW"
          subtext={`Vac: ${(c.vacuum??0).toFixed(3)} bar`}
          color="#ff2d78" bg="rgba(200,0,80,0.1)" border="rgba(255,45,120,0.3)" icon="❄"
          alarm={false} />
      </div>

      {/* ── Status strip ── */}
      <StatusStrip state={state} />

      {/* ── Main diagram ── */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <PlantDiagram />
      </div>
    </div>
  )
}
