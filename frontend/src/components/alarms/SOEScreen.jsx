import React from 'react'
import usePlantStore from '../../hooks/usePlantStore'

export default function SOEScreen() {
  const plantState = usePlantStore(s => s.plantState)
  const soeLog = plantState?.soe_log ?? []

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      padding: 20, gap: 12,
    }}>
      <h1 style={{
        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20,
        color: '#b040ff', letterSpacing: '0.1em',
      }}>📜 SEQUENCE OF EVENTS (SOE)</h1>
      
      <div style={{
        flex: 1, overflowY: 'auto',
        background: 'rgba(2,8,18,0.6)',
        border: '1px solid rgba(176,64,255,0.1)',
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '130px 90px 1.5fr 2fr',
          gap: 12, padding: '12px 16px',
          borderBottom: '1px solid rgba(176,64,255,0.2)',
          fontFamily: 'var(--font-ui)', fontSize: 11,
          letterSpacing: '0.12em', color: '#9070b0',
          textTransform: 'uppercase',
          background: 'rgba(2,8,18,0.95)',
          position: 'sticky', top: 0, zIndex: 2
        }}>
          <div>Timestamp</div>
          <div>Category</div>
          <div>Message</div>
          <div>Details</div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Render in reverse order (newest first) by copying and reversing the array */}
          {[...soeLog].reverse().map((evt, i) => {
            let color = '#7db8d4'
            if (evt.category === 'TRIP') color = '#ff5252'
            else if (evt.category === 'ALARM') color = '#ffb300'
            else if (evt.category === 'COMMAND') color = '#00e5ff'

            // Format timestamp: hh:mm:ss.SSS
            const date = new Date(evt.timestamp * 1000)
            const timeStr = date.toISOString().split('T')[1].replace('Z', '')

            return (
              <div key={evt.id || i} style={{
                display: 'grid',
                gridTemplateColumns: '130px 90px 1.5fr 2fr',
                gap: 12, padding: '8px 16px',
                borderBottom: '1px solid rgba(176,64,255,0.05)',
                alignItems: 'start',
                background: evt.category === 'TRIP' ? 'rgba(255,82,82,0.05)' : 'transparent'
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#6a5a8a' }}>
                  {timeStr}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: color, fontWeight: 700,
                  background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 4, display: 'inline-block', width: 'fit-content'
                 }}>
                  {evt.category}
                </span>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: color, fontWeight: evt.category === 'TRIP' ? 600 : 400 }}>
                  {evt.message}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#9070b0' }}>
                  {evt.details}
                </span>
              </div>
            )
          })}
          
          {soeLog.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 13, color: '#6a5a8a' }}>
              Waiting for events...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
