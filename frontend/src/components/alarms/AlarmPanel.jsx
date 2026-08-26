/**
 * AlarmPanel — Full alarm management screen with live list + history.
 */
import React, { useState, useEffect } from 'react'
import usePlantStore from '../../hooks/usePlantStore'

const SEV_COLORS = {
  CRITICAL: { bg: 'rgba(255,23,68,0.1)', border: 'rgba(255,23,68,0.35)', text: '#ff5252', dot: '#ff1744' },
  WARNING:  { bg: 'rgba(255,179,0,0.08)', border: 'rgba(255,179,0,0.3)', text: '#ffb300', dot: '#ffb300' },
  INFO:     { bg: 'rgba(0,229,255,0.06)', border: 'rgba(0,229,255,0.2)', text: '#00e5ff', dot: '#00e5ff' },
}

function AlarmRow({ alarm, onAck }) {
  const c = SEV_COLORS[alarm.severity] || SEV_COLORS.INFO
  const pulse = alarm.severity === 'CRITICAL' && !alarm.acknowledged

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '8px 150px 1fr 80px 80px',
      gap: 12, alignItems: 'center',
      padding: '8px 16px',
      background: c.bg,
      borderBottom: `1px solid ${c.border}`,
      borderLeft: `3px solid ${c.dot}`,
      transition: 'background 0.2s',
      animation: pulse ? 'warnPulse 1.5s infinite' : 'none',
    }}>
      {/* Severity dot */}
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        background: c.dot,
        boxShadow: `0 0 6px ${c.dot}`,
        animation: pulse ? 'alarmPulse 1s infinite' : 'none',
      }} />

      {/* Tag */}
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: c.text, fontWeight: 700 }}>
        {alarm.tag}
      </span>

      {/* Description */}
      <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: '#e0f4ff' }}>
        {alarm.description}
      </span>

      {/* Timestamp */}
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#3a6a85' }}>
        {new Date(alarm.timestamp).toLocaleTimeString()}
      </span>

      {/* Ack button */}
      {!alarm.acknowledged ? (
        <button onClick={() => onAck(alarm.id)}
          style={{
            background: 'rgba(0,180,220,0.12)', border: '1px solid rgba(0,180,220,0.35)',
            color: '#00e5ff', fontFamily: 'var(--font-ui)', fontWeight: 700,
            fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
            padding: '3px 10px', cursor: 'pointer', borderRadius: 4,
          }}
        >ACK</button>
      ) : (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#3a6a85' }}>ACKED</span>
      )}
    </div>
  )
}

export default function AlarmPanel() {
  const plantState      = usePlantStore(s => s.plantState)
  const acknowledgeAlarm = usePlantStore(s => s.acknowledgeAlarm)
  const acknowledgeAll  = usePlantStore(s => s.acknowledgeAll)
  const [tab, setTab]   = useState('active')  // 'active' | 'history'
  const [history, setHistory] = useState([])

  const activeAlarms = plantState?.active_alarms ?? []

  useEffect(() => {
    if (tab === 'history') {
      fetch('/api/alarms/history')
        .then(r => r.json())
        .then(d => setHistory(d.history || []))
        .catch(() => {})
    }
  }, [tab])

  const TabBtn = ({ id, label, count }) => (
    <button onClick={() => setTab(id)}
      style={{
        background: tab === id ? 'rgba(0,180,220,0.18)' : 'transparent',
        border: `1px solid ${tab === id ? 'rgba(0,200,255,0.45)' : 'transparent'}`,
        borderRadius: 6, color: tab === id ? '#00e5ff' : '#7db8d4',
        fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 12,
        letterSpacing: '0.06em', padding: '5px 16px', cursor: 'pointer',
        textTransform: 'uppercase',
      }}
    >
      {label}{count != null && count > 0 ? ` (${count})` : ''}
    </button>
  )

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      padding: 20, gap: 12,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20,
          color: '#00e5ff', letterSpacing: '0.1em',
        }}>⚠ ALARM MANAGEMENT</h1>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="badge badge-red">
            {plantState?.alarm_count_critical ?? 0} CRITICAL
          </span>
          <span className="badge badge-amber">
            {plantState?.alarm_count_warning ?? 0} WARNING
          </span>
          <button onClick={acknowledgeAll}
            className="btn btn-amber"
            style={{ fontSize: 12, padding: '6px 16px' }}
          >ACK ALL</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid rgba(0,200,255,0.1)', paddingBottom: 8 }}>
        <TabBtn id="active" label="Active Alarms" count={activeAlarms.length} />
        <TabBtn id="history" label="Alarm History" />
      </div>

      {/* Column headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '8px 150px 1fr 80px 80px',
        gap: 12, padding: '4px 16px',
        fontFamily: 'var(--font-ui)', fontSize: 10,
        letterSpacing: '0.12em', color: '#3a6a85',
        textTransform: 'uppercase',
      }}>
        <div />
        <div>Tag</div><div>Description</div>
        <div>Time</div><div>Status</div>
      </div>

      {/* Alarm list */}
      <div style={{
        flex: 1, overflowY: 'auto',
        background: 'rgba(2,8,18,0.6)',
        border: '1px solid rgba(0,200,255,0.1)',
        borderRadius: 8,
      }}>
        {tab === 'active' && (
          activeAlarms.length > 0
            ? activeAlarms.map(a => (
                <AlarmRow key={a.id} alarm={a} onAck={acknowledgeAlarm} />
              ))
            : (
              <div style={{
                padding: 40, textAlign: 'center',
                fontFamily: 'var(--font-mono)', fontSize: 13, color: '#3a6a85',
              }}>
                ✓ No active alarms
              </div>
            )
        )}
        {tab === 'history' && (
          history.length > 0
            ? history.map((a, i) => (
                <div key={i} style={{
                  display: 'grid',
                  gridTemplateColumns: '8px 150px 1fr 80px 80px',
                  gap: 12, alignItems: 'center',
                  padding: '6px 16px',
                  borderBottom: '1px solid rgba(0,200,255,0.05)',
                  opacity: a.active ? 1 : 0.5,
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: a.severity === 'CRITICAL' ? '#ff1744' : a.severity === 'WARNING' ? '#ffb300' : '#00e5ff',
                  }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#7db8d4' }}>{a.tag}</span>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: '#7db8d4' }}>{a.description}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#3a6a85' }}>
                    {new Date(a.timestamp).toLocaleTimeString()}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10,
                    color: a.active ? '#ff5252' : '#00e676' }}>
                    {a.active ? 'ACTIVE' : 'CLEARED'}
                  </span>
                </div>
              ))
            : (
              <div style={{ padding: 40, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 13, color: '#3a6a85' }}>
                No alarm history yet
              </div>
            )
        )}
      </div>
    </div>
  )
}
