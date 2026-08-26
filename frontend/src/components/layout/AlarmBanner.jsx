/**
 * AlarmBanner — Scrolling ticker of unacknowledged alarms at bottom of screen.
 */
import React from 'react'
import usePlantStore from '../../hooks/usePlantStore'

const SEV_COLORS = {
  CRITICAL: '#ff1744',
  WARNING:  '#ffb300',
  INFO:     '#00e5ff',
}

export default function AlarmBanner() {
  const plantState     = usePlantStore(s => s.plantState)
  const acknowledgeAll = usePlantStore(s => s.acknowledgeAll)
  const alarms = plantState?.active_alarms ?? []
  const unacked = alarms.filter(a => !a.acknowledged)

  if (unacked.length === 0) return null

  const items = [...unacked, ...unacked, ...unacked]  // repeat for continuous scroll

  return (
    <div style={{
      height: 'var(--alarm-bar-height)',
      background: 'rgba(80,0,10,0.92)',
      borderTop: '1px solid rgba(255,23,68,0.4)',
      display: 'flex', alignItems: 'center',
      overflow: 'hidden', position: 'relative',
      flexShrink: 0,
    }}>
      {/* Label */}
      <div style={{
        padding: '0 12px',
        fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 10,
        letterSpacing: '0.12em', color: '#ff1744',
        whiteSpace: 'nowrap', flexShrink: 0,
        borderRight: '1px solid rgba(255,23,68,0.3)',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span style={{ animation: 'alarmPulse 1s infinite', display: 'inline-block' }}>⚠</span>
        ALARM
      </div>

      {/* Scrolling text */}
      <div style={{
        flex: 1, overflow: 'hidden', position: 'relative',
      }}>
        <div style={{
          display: 'flex', gap: 40,
          animation: `alarmScroll ${Math.max(15, unacked.length * 8)}s linear infinite`,
          whiteSpace: 'nowrap',
        }}>
          {items.map((a, i) => (
            <span key={i} style={{
              fontFamily: 'var(--font-mono)', fontSize: 11,
              color: SEV_COLORS[a.severity] ?? '#ff1744',
              padding: '0 4px',
            }}>
              [{a.tag}] {a.description}
            </span>
          ))}
        </div>
      </div>

      {/* ACK ALL */}
      <button onClick={acknowledgeAll}
        style={{
          background: 'rgba(255,23,68,0.15)',
          border: '1px solid rgba(255,23,68,0.4)',
          color: '#ff5252', fontFamily: 'var(--font-ui)', fontWeight: 700,
          fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
          padding: '4px 12px', cursor: 'pointer', flexShrink: 0,
          borderRadius: 4, margin: '0 8px',
        }}
      >ACK ALL</button>

      <style>{`
        @keyframes alarmScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  )
}
