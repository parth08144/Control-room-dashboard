/**
 * FeedwaterSVG — Two pump animations with rotating impeller indicators.
 */
import React, { useRef, useEffect, useId } from 'react'

function PumpIcon({ x, y, r = 22, running, fault, speed, label, id, angleRef }) {
  const diskRef = useRef(null)

  useEffect(() => {
    let frame
    const animate = () => {
      if (diskRef.current && running && !fault) {
        angleRef.current = (angleRef.current + speed * 0.06) % 360
        diskRef.current.setAttribute('transform', `rotate(${angleRef.current}, ${x}, ${y})`)
      }
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [running, fault, speed, x, y, angleRef])

  const color = fault ? '#ef4444' : running ? '#10b981' : '#64748b'

  return (
    <g filter="url(#drop-shadow)">
      {/* Heavy Pump Base Volute */}
      <circle cx={x} cy={y} r={r}
        fill="url(#metal-base)"
        stroke={fault ? '#ef4444' : 'url(#metal-chrome)'}
        strokeWidth={fault ? 2 : 2}
      />
      {/* Impeller Casing inner shadow */}
      <circle cx={x} cy={y} r={r - 4} fill="#020617" filter="url(#inner-shadow)" />

      <g ref={diskRef}>
        {[0, 60, 120, 180, 240, 300].map((a) => {
          const rad = (a * Math.PI) / 180
          return (
            <line key={a}
              x1={x + 6 * Math.cos(rad)} y1={y + 6 * Math.sin(rad)}
              x2={x + (r - 6) * Math.cos(rad)} y2={y + (r - 6) * Math.sin(rad)}
              stroke={color} strokeWidth={4} strokeLinecap="round"
              opacity={running ? 1 : 0.4}
            />
          )
        })}
      </g>
      {/* Central Hub */}
      <circle cx={x} cy={y} r={7}
        fill="url(#metal-chrome)"
        stroke={color} strokeWidth={2}
        filter="url(#drop-shadow)"
      />
      
      {/* Readout Plate */}
      <rect x={x - 22} y={y + r + 4} width={44} height={16} rx={2} fill="#020617" stroke="#475569" strokeWidth={1.5} />
      <text x={x} y={y + r + 15} textAnchor="middle"
        fontSize={9} fontFamily="'Share Tech Mono'" fontWeight="bold"
        fill={fault ? '#ef4444' : running ? '#10b981' : '#64748b'}
      >{label}</text>
      {fault && (
        <text x={x} y={y + r + 26} textAnchor="middle"
          fontSize={8} fontFamily="'Rajdhani'" fontWeight="700" fill="#ef4444"
        >FAULT</text>
      )}
    </g>
  )
}

export default function FeedwaterSVG({ feedwater = {}, width = 200, height = 100 }) {
  const {
    pump_a_running = false, pump_b_running = false,
    pump_a_fault = false, pump_b_fault = false,
    pump_a_speed = 0, pump_b_speed = 0,
    feedwater_flow = 0,
  } = feedwater

  const angleA = useRef(0)
  const angleB = useRef(0)
  const id = useId().replace(/:/g, '')

  const flowNorm = Math.min(1, feedwater_flow / 400)

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      
      {/* Header pipe (Steel base + shadow) */}
      <g filter="url(#drop-shadow)">
        <line x1={64} y1={50} x2={width - 64} y2={50}
          stroke="#0f172a" strokeWidth={10} strokeLinecap="round"
        />
        <line x1={64} y1={50} x2={width - 64} y2={50}
          stroke="#334155" strokeWidth={6} strokeLinecap="round"
        />
        <line x1={64} y1={50} x2={width - 64} y2={50}
          stroke="#94a3b8" strokeWidth={2} strokeLinecap="round" opacity={0.5}
        />
      </g>

      {flowNorm > 0.02 && (
        <line x1={64} y1={50} x2={width - 64} y2={50}
          stroke="#38bdf8" strokeWidth={3} strokeLinecap="round"
          strokeDasharray="10 8"
          style={{
            animation: `fwFlow${id} ${Math.max(0.5, 3 - flowNorm * 2.5)}s linear infinite`,
          }}
        />
      )}

      {/* Pump A */}
      <PumpIcon
        x={40} y={50} r={24}
        running={pump_a_running} fault={pump_a_fault} speed={pump_a_speed}
        label="FW-P-A" id={id} angleRef={angleA}
      />
      {/* Pump B */}
      <PumpIcon
        x={width - 40} y={50} r={24}
        running={pump_b_running} fault={pump_b_fault} speed={pump_b_speed}
        label="FW-P-B" id={id} angleRef={angleB}
      />

      {/* Total flow label */}
      <g filter="url(#drop-shadow)">
        <rect x={width / 2 - 30} y={4} width={60} height={18} rx={3} fill="#020617" stroke="#475569" strokeWidth={1.5} />
        <text x={width / 2} y={16} textAnchor="middle"
          fontSize={10} fontFamily="'Share Tech Mono'" fontWeight="bold"
          fill={flowNorm > 0 ? '#38bdf8' : '#64748b'}
        >{feedwater_flow.toFixed(0)} <tspan fontSize={7}>t/h</tspan></text>
      </g>

      <text x={width / 2} y={height - 2} textAnchor="middle"
        fontSize={9} fontFamily="'Exo 2'" fontWeight="600"
        letterSpacing="0.1em" fill="#7db8d4"
      >FEEDWATER PUMPS</text>

      <style>{`
        @keyframes fwFlow${id} {
          from { stroke-dashoffset: 0; }
          to   { stroke-dashoffset: -18; }
        }
      `}</style>
    </svg>
  )
}
