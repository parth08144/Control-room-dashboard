/**
 * Gauge — SVG circular gauge with glowing arc.
 * Props: value, min, max, label, unit, size, color, alarmHigh, alarmLow
 */
import React, { useMemo } from 'react'

const TAU = Math.PI * 2
const START_ANGLE = 225  // degrees (bottom-left)
const SWEEP = 270        // total sweep degrees

function polarToXY(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function describeArc(cx, cy, r, startDeg, endDeg) {
  const s = polarToXY(cx, cy, r, startDeg)
  const e = polarToXY(cx, cy, r, endDeg)
  const large = endDeg - startDeg > 180 ? 1 : 0
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`
}

export default function Gauge({
  value = 0, min = 0, max = 100,
  label = '', unit = '',
  size = 120,
  color = '#00e5ff',
  alarmHigh = null, alarmLow = null,
  decimals = 1,
}) {
  const cx = size / 2, cy = size / 2
  const r = size * 0.38
  const trackR = r + size * 0.04

  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)))
  const valueDeg = START_ANGLE + pct * SWEEP
  const endDeg = START_ANGLE + SWEEP

  const isAlarm = (alarmHigh !== null && value >= alarmHigh) ||
                  (alarmLow !== null  && value <= alarmLow)
  const arcColor = isAlarm ? '#ff1744' : color

  // Needle tip
  const needle = polarToXY(cx, cy, r * 0.85, valueDeg)

  const glowId = useMemo(() => `gauge-glow-${Math.random().toString(36).slice(2)}`, [])

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Track arc */}
      <path
        d={describeArc(cx, cy, r, START_ANGLE, endDeg)}
        fill="none"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth={size * 0.06}
        strokeLinecap="round"
      />

      {/* Value arc */}
      {pct > 0 && (
        <path
          d={describeArc(cx, cy, r, START_ANGLE, valueDeg)}
          fill="none"
          stroke={arcColor}
          strokeWidth={size * 0.06}
          strokeLinecap="round"
          filter={`url(#${glowId})`}
          style={{ transition: 'd 0.5s ease' }}
        />
      )}

      {/* Alarm zone (outer ring) */}
      {alarmHigh !== null && (() => {
        const alarmPct = (alarmHigh - min) / (max - min)
        const alarmDeg = START_ANGLE + alarmPct * SWEEP
        return (
          <path
            d={describeArc(cx, cy, r, alarmDeg, endDeg)}
            fill="none"
            stroke="rgba(255,23,68,0.25)"
            strokeWidth={size * 0.035}
            strokeLinecap="round"
          />
        )
      })()}

      {/* Center dot */}
      <circle cx={cx} cy={cy} r={size * 0.04} fill={arcColor} filter={`url(#${glowId})`} />

      {/* Needle */}
      <line
        x1={cx} y1={cy} x2={needle.x} y2={needle.y}
        stroke={arcColor} strokeWidth={size * 0.025} strokeLinecap="round"
        filter={`url(#${glowId})`}
        style={{ transition: 'x2 0.5s ease, y2 0.5s ease' }}
      />

      {/* Value text */}
      <text
        x={cx} y={cy + size * 0.18}
        textAnchor="middle"
        fontSize={size * 0.165}
        fontFamily="'Share Tech Mono', monospace"
        fill={isAlarm ? '#ff5252' : '#e0f4ff'}
        fontWeight="bold"
      >
        {typeof value === 'number' ? value.toFixed(decimals) : '---'}
      </text>

      {/* Unit */}
      <text x={cx} y={cy + size * 0.32} textAnchor="middle"
        fontSize={size * 0.09} fontFamily="'Rajdhani', sans-serif"
        fill="#7db8d4" letterSpacing="0.05em"
      >{unit}</text>

      {/* Label */}
      <text x={cx} y={size - size * 0.05} textAnchor="middle"
        fontSize={size * 0.085} fontFamily="'Rajdhani', sans-serif"
        fill="#3a6a85" letterSpacing="0.08em"
      >{label}</text>

      {/* Tick marks */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const deg = START_ANGLE + t * SWEEP
        const inner = polarToXY(cx, cy, r - size * 0.08, deg)
        const outer = polarToXY(cx, cy, r + size * 0.01, deg)
        return (
          <line key={t}
            x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
            stroke="rgba(255,255,255,0.2)" strokeWidth={1}
          />
        )
      })}
    </svg>
  )
}
