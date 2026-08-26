/** LED status indicator */
import React from 'react'

const COLORS = {
  green:  { fill: '#00e676', shadow: 'rgba(0,230,118,0.7)' },
  red:    { fill: '#ff1744', shadow: 'rgba(255,23,68,0.8)' },
  amber:  { fill: '#ffb300', shadow: 'rgba(255,179,0,0.7)' },
  cyan:   { fill: '#00e5ff', shadow: 'rgba(0,229,255,0.7)' },
  grey:   { fill: '#3a6a85', shadow: 'none' },
}

export default function LED({ color = 'grey', label = '', size = 10, pulse = false }) {
  const c = COLORS[color] || COLORS.grey
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{
        display: 'inline-block',
        width: size, height: size,
        borderRadius: '50%',
        background: c.fill,
        boxShadow: c.shadow !== 'none' ? `0 0 6px ${c.shadow}, 0 0 2px ${c.shadow}` : 'none',
        animation: pulse ? 'alarmPulse 1.2s infinite' : 'none',
        flexShrink: 0,
      }} />
      {label && <span style={{ fontSize: 11, color: '#7db8d4', fontFamily: 'var(--font-ui)' }}>{label}</span>}
    </span>
  )
}
