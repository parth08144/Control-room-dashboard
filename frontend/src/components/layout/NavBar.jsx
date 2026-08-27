/**
 * NavBar v2 — Colourful, vibrant, premium feel
 */
import React, { useState, useEffect } from 'react'
import usePlantStore from '../../hooks/usePlantStore'
import LED from '../ui/LED'

const VIEWS = [
  { id: 'overview',   label: 'Overview',   icon: '⬡', color: '#00e5ff' },
  { id: 'alarms',     label: 'Alarms',     icon: '⚠',  color: '#ff1744' },
  { id: 'soe',        label: 'SOE Log',    icon: '📜', color: '#b040ff' },
  { id: 'trends',     label: 'Trends',     icon: '📈', color: '#b040ff' },
  { id: 'controls',   label: 'Controls',   icon: '🎛', color: '#ffb300' },
]

function Clock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <div style={{ textAlign: 'right', lineHeight: 1.2 }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700,
        background: 'linear-gradient(90deg, #00e5ff, #b040ff)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)' }}>
        {time.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}
      </div>
    </div>
  )
}

export default function NavBar({ audioEnabled, toggleAudio }) {
  const connected     = usePlantStore(s => s.connected)
  const plantState    = usePlantStore(s => s.plantState)
  const activeView    = usePlantStore(s => s.activeView)
  const setActiveView = usePlantStore(s => s.setActiveView)

  const critCount = plantState?.alarm_count_critical ?? 0
  const warnCount = plantState?.alarm_count_warning  ?? 0
  const mw        = plantState?.plant_power_mw       ?? 0
  const freq      = plantState?.generator?.frequency ?? 50
  const pressure  = plantState?.boiler?.steam_pressure ?? 0
  const rpm       = plantState?.turbine?.rpm_actual ?? 0

  return (
    <nav style={{
      height: 'var(--nav-height)',
      display: 'flex', alignItems: 'center',
      padding: '0 20px',
      background: 'rgba(1,8,22,0.96)',
      borderBottom: '1px solid rgba(0,200,255,0.14)',
      backdropFilter: 'blur(20px)',
      position: 'relative', zIndex: 100,
      gap: 12, flexShrink: 0,
      boxShadow: '0 2px 30px rgba(0,0,0,0.6), 0 1px 0 rgba(0,200,255,0.08)',
    }}>
      {/* ── Logo ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 8,
          background: 'linear-gradient(135deg, rgba(0,180,255,0.25), rgba(160,0,255,0.2))',
          border: '1px solid rgba(0,200,255,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16,
          boxShadow: '0 0 12px rgba(0,180,255,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}>⚡</div>
        <div>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 16,
            letterSpacing: '0.15em',
            background: 'linear-gradient(90deg, #00e5ff 0%, #b040ff 60%, #ff2d78 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>POWERSIM</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
            SCADA · UNIT-1 · 660 MW
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 32, background: 'linear-gradient(180deg, transparent, rgba(0,200,255,0.25), transparent)', flexShrink: 0 }} />

      {/* ── Nav links ── */}
      <div style={{ display: 'flex', gap: 3 }}>
        {VIEWS.map(v => {
          const isActive = activeView === v.id
          const hasBadge = v.id === 'alarms' && critCount > 0
          return (
            <button key={v.id}
              onClick={() => setActiveView(v.id)}
              style={{
                background: isActive
                  ? `rgba(${v.color === '#00e5ff' ? '0,180,220' : v.color === '#ff1744' ? '200,0,40' : v.color === '#b040ff' ? '140,20,200' : '180,120,0'}, 0.18)`
                  : 'transparent',
                border: isActive
                  ? `1px solid ${v.color}55`
                  : '1px solid transparent',
                borderRadius: 8,
                color: isActive ? v.color : 'var(--text-secondary)',
                fontFamily: 'var(--font-ui)', fontWeight: 700,
                fontSize: 11, letterSpacing: '0.07em',
                padding: '5px 14px', cursor: 'pointer',
                transition: 'all 0.2s',
                textTransform: 'uppercase',
                position: 'relative',
                boxShadow: isActive ? `0 0 12px ${v.color}33` : 'none',
              }}
            >
              <span style={{ marginRight: 4 }}>{v.icon}</span>{v.label}
              {hasBadge && (
                <span style={{
                  position: 'absolute', top: -5, right: -5,
                  background: 'linear-gradient(135deg, #ff1744, #ff5252)',
                  color: '#fff', borderRadius: '50%', width: 17, height: 17,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, fontWeight: 700,
                  boxShadow: '0 0 10px rgba(255,23,68,0.8)',
                  animation: 'alarmPulse 1s infinite',
                }}>{critCount}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Detail breadcrumb */}
      {['boiler','turbine','generator'].includes(activeView) && (
        <>
          <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>›</span>
          <button onClick={() => setActiveView('overview')}
            style={{
              background: 'rgba(255,179,0,0.12)', border: '1px solid rgba(255,179,0,0.35)',
              borderRadius: 7, color: 'var(--amber)', fontFamily: 'var(--font-ui)',
              fontWeight: 700, fontSize: 10, letterSpacing: '0.1em',
              padding: '4px 12px', cursor: 'pointer', textTransform: 'uppercase',
              boxShadow: '0 0 8px rgba(255,179,0,0.15)',
            }}
          >← {activeView.toUpperCase()} DETAIL</button>
        </>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* ── Audio Toggle ── */}
      <button onClick={toggleAudio} style={{
        background: audioEnabled ? 'rgba(0,255,136,0.1)' : 'rgba(255,23,68,0.1)',
        border: `1px solid ${audioEnabled ? 'rgba(0,255,136,0.3)' : 'rgba(255,23,68,0.3)'}`,
        borderRadius: 8, padding: '4px 10px',
        color: audioEnabled ? '#00ff88' : '#ff1744',
        fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700,
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
        boxShadow: audioEnabled ? '0 0 10px rgba(0,255,136,0.2)' : 'none',
      }}>
        <span>{audioEnabled ? '🔊' : '🔇'}</span>
        {audioEnabled ? 'AUDIO ON' : 'ENABLE AUDIO'}
      </button>

      <div style={{ width: 1, height: 32, background: 'linear-gradient(180deg, transparent, rgba(0,200,255,0.25), transparent)', margin: '0 4px', flexShrink: 0 }} />

      {/* ── Live KPIs ── */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {[
          { label: 'MW', value: mw.toFixed(1), color: '#00ff88', glow: 'rgba(0,255,136,0.6)' },
          { label: 'Hz', value: freq.toFixed(2), color: '#ffb300', glow: 'rgba(255,179,0,0.6)' },
          { label: 'bar', value: pressure.toFixed(0), color: '#00e5ff', glow: 'rgba(0,229,255,0.6)' },
          { label: 'rpm', value: rpm.toFixed(0), color: '#b040ff', glow: 'rgba(176,64,255,0.6)' },
        ].map(kpi => (
          <div key={kpi.label} style={{
            textAlign: 'center',
            padding: '3px 10px',
            background: 'rgba(0,0,0,0.3)',
            border: `1px solid ${kpi.color}33`,
            borderRadius: 6,
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700,
              color: kpi.color,
              textShadow: `0 0 8px ${kpi.glow}`,
              lineHeight: 1,
            }}>{kpi.value}</div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
              {kpi.label}
            </div>
          </div>
        ))}
      </div>

      <div style={{ width: 1, height: 32, background: 'linear-gradient(180deg, transparent, rgba(0,200,255,0.2), transparent)', flexShrink: 0 }} />

      {/* ── Alarm badges ── */}
      {critCount > 0 && (
        <span className="badge badge-red" style={{ animation: 'alarmPulse 1s infinite', fontSize: 10 }}>
          ● {critCount} CRITICAL
        </span>
      )}
      {warnCount > 0 && (
        <span className="badge badge-amber" style={{ fontSize: 10 }}>
          ● {warnCount} WARN
        </span>
      )}

      {/* ── Connection ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6,
        padding: '4px 10px', borderRadius: 20,
        background: connected ? 'rgba(0,255,136,0.07)' : 'rgba(255,23,68,0.07)',
        border: `1px solid ${connected ? 'rgba(0,255,136,0.25)' : 'rgba(255,23,68,0.25)'}`,
      }}>
        <div style={{
          width: 7, height: 7, borderRadius: '50%',
          background: connected ? 'var(--green-ok)' : 'var(--red-alarm)',
          boxShadow: connected ? '0 0 8px var(--green-ok)' : '0 0 8px var(--red-alarm)',
          animation: connected ? 'greenPulse 2s infinite' : 'alarmPulse 1s infinite',
        }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10,
          color: connected ? 'var(--green-ok)' : 'var(--red-alarm)', letterSpacing: '0.06em' }}>
          {connected ? 'LIVE' : 'RECONNECTING'}
        </span>
      </div>

      <Clock />
    </nav>
  )
}
