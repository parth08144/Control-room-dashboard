/**
 * PipeSVG — Animated pipe segment with moving dash pattern showing flow direction & rate.
 * Props: x1,y1 → x2,y2 (SVG coords), flowRate (0-1), media ('steam'|'water'|'fuel'|'condensate')
 */
import React, { useId } from 'react'

const MEDIA_COLORS = {
  steam:      { stroke: '#b0d8ff', glow: 'rgba(160,210,255,0.5)', dashColor: '#ffffff' },
  water:      { stroke: '#0077cc', glow: 'rgba(0,120,220,0.4)',   dashColor: '#44aaff' },
  fuel:       { stroke: '#ff6d00', glow: 'rgba(255,110,0,0.5)',   dashColor: '#ffaa44' },
  condensate: { stroke: '#006688', glow: 'rgba(0,100,140,0.4)',   dashColor: '#00aacc' },
  cooling:    { stroke: '#00aa44', glow: 'rgba(0,170,70,0.4)',    dashColor: '#44ff88' },
}

export default function PipeSVG({
  x1 = 0, y1 = 0, x2 = 100, y2 = 0,
  flowRate = 0,      // 0-1 normalised
  media = 'steam',
  strokeWidth = 5,
  reversed = false,  // reverse flow direction
}) {
  const id = useId().replace(/:/g, '')
  const colors = MEDIA_COLORS[media] || MEDIA_COLORS.water

  const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
  const dashLen = 12
  const gapLen = 10
  const period = length / (flowRate * 80 + 0.001)   // seconds for one dash cycle
  const animDur = Math.max(0.3, Math.min(8, period))
  const direction = reversed ? 'reverse' : 'normal'

  return (
    <g>
      <defs>
        <filter id={`pf-${id}`} x="-10%" y="-100%" width="120%" height="300%">
          <feGaussianBlur stdDeviation={1.5} result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Pipe shadow */}
      <line x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="rgba(0,0,0,0.6)" strokeWidth={strokeWidth + 4} strokeLinecap="round"
        filter="url(#drop-shadow)"
      />
      {/* Pipe base (dark metal) */}
      <line x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="#1e293b" strokeWidth={strokeWidth + 2} strokeLinecap="round"
      />
      {/* Pipe highlight (cylindrical effect) */}
      <line x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="#475569" strokeWidth={strokeWidth} strokeLinecap="round"
      />
      <line x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="#cbd5e1" strokeWidth={strokeWidth * 0.3} strokeLinecap="round"
        opacity={0.4}
      />

      {/* Flow animation — glowing fluid pulse inside the pipe */}
      {flowRate > 0.02 && (
        <line x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={colors.dashColor}
          strokeWidth={strokeWidth * 0.55}
          strokeLinecap="round"
          strokeDasharray={`${dashLen} ${gapLen}`}
          opacity={Math.min(1, flowRate * 1.5 + 0.3)}
          filter={`url(#pf-${id})`}
          style={{
            animation: `pipeFlow${id} ${animDur}s linear infinite ${direction}`,
          }}
        />
      )}

      {/* Pipe highlight */}
      <line x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={colors.stroke}
        strokeWidth={1}
        strokeOpacity={0.4}
        strokeLinecap="round"
      />

      <style>{`
        @keyframes pipeFlow${id} {
          from { stroke-dashoffset: 0; }
          to   { stroke-dashoffset: ${reversed ? -(dashLen + gapLen) : (dashLen + gapLen)}; }
        }
      `}</style>
    </g>
  )
}
