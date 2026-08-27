/**
 * GeneratorSVG — Pulsing electromagnetic field rings tied to MW output.
 * Rotating coupling shaft synced to turbine RPM.
 */
import React, { useRef, useEffect, useId } from 'react'

export default function GeneratorSVG({ generator = {}, turbine = {}, width = 140, height = 180, onClick }) {
  const {
    mw_output = 0,
    frequency = 0,
    voltage = 0,
    running = false,
    tripped = false,
    breaker_closed = false,
  } = generator
  const { rpm_actual = 0 } = turbine

  const id = useId().replace(/:/g, '')
  const shaftRef = useRef(null)
  const ring1Ref = useRef(null)
  const ring2Ref = useRef(null)
  const angleRef = useRef(0)
  const rpmRef = useRef(rpm_actual)

  useEffect(() => { rpmRef.current = rpm_actual }, [rpm_actual])

  const isAlarm = tripped
  const loadPct = Math.min(1, mw_output / 660)
  const cx = width / 2, cy = height * 0.42

  // Shaft rotation + ring pulse
  useEffect(() => {
    let frame
    let lastTime = performance.now()
    let ringPhase = 0
    const animate = (now) => {
      const dt = (now - lastTime) / 1000
      lastTime = now
      angleRef.current = (angleRef.current + rpmRef.current * 6 * dt) % 360
      ringPhase += dt * (1 + loadPct * 3)

      if (shaftRef.current) {
        shaftRef.current.setAttribute(
          'transform',
          `rotate(${angleRef.current}, ${cx}, ${cy})`
        )
      }
      // Breathing ring radii
      const pulse = Math.sin(ringPhase * Math.PI * 2) * 0.08 + 1
      if (ring1Ref.current) ring1Ref.current.setAttribute('r', (width * 0.28 * pulse).toFixed(2))
      if (ring2Ref.current) ring2Ref.current.setAttribute('r', (width * 0.36 * pulse).toFixed(2))

      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [cx, cy, width, loadPct])

  const baseColor = isAlarm ? '#ff1744' : breaker_closed ? '#00e5ff' : running ? '#7c4dff' : '#1a3060'
  const glowColor = isAlarm ? 'rgba(255,23,68,0.4)' : breaker_closed ? 'rgba(0,229,255,0.35)' : 'rgba(124,77,255,0.25)'

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}
      style={{ cursor: onClick ? 'pointer' : 'default', overflow: 'visible' }}
      onClick={onClick}
    >
      <defs>
        <filter id={`gg-${id}`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation={3} result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <radialGradient id={`ggrad-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor={baseColor} stopOpacity="0.35" />
          <stop offset="100%" stopColor={baseColor} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Heavy structural mount */}
      <path d={`M ${cx - width * 0.44 + 5} ${cy + height * 0.26} L ${cx + width * 0.44 - 5} ${cy + height * 0.26} L ${cx + width * 0.44 + 10} ${cy + height * 0.26 + 15} L ${cx - width * 0.44 - 10} ${cy + height * 0.26 + 15} Z`}
        fill="url(#metal-dark)" stroke="#334155" strokeWidth={2} filter="url(#drop-shadow)" />

      {/* Outer casing */}
      <g filter={isAlarm ? `url(#gg-${id})` : 'url(#drop-shadow)'}>
        <ellipse cx={cx} cy={cy} rx={width * 0.44} ry={height * 0.26}
          fill="url(#metal-base)"
          stroke={isAlarm ? '#ff1744' : 'url(#metal-chrome)'}
          strokeWidth={isAlarm ? 3 : 4}
        />
        {/* Structural Ribs */}
        {[0.1, 0.3, 0.5, 0.7, 0.9].map((pct, i) => (
          <ellipse key={i} cx={cx} cy={cy} rx={width * 0.44 * pct} ry={height * 0.26 * pct}
            fill="none" stroke="#0f172a" strokeWidth={2} opacity={0.5} />
        ))}
      </g>

      {/* EM field rings (Glowing Energy inside stator) */}
      {running && (
        <>
          <circle ref={ring2Ref} cx={cx} cy={cy} r={width * 0.36}
            fill={`url(#ggrad-${id})`}
            stroke={baseColor} strokeWidth={1} strokeOpacity={0.25 * loadPct}
            filter={`url(#gg-${id})`}
          />
          <circle ref={ring1Ref} cx={cx} cy={cy} r={width * 0.28}
            fill="none"
            stroke={baseColor} strokeWidth={1.5} strokeOpacity={0.4 * loadPct}
            strokeDasharray="8 6"
            filter={`url(#gg-${id})`}
          />
        </>
      )}

      {/* Stator copper windings */}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2
        const r1 = width * 0.18, r2 = width * 0.30
        return (
          <line key={i}
            x1={cx + r1 * Math.cos(a)} y1={cy + r1 * Math.sin(a) * 0.6}
            x2={cx + r2 * Math.cos(a)} y2={cy + r2 * Math.sin(a) * 0.6}
            stroke="url(#metal-copper)" strokeWidth={6} strokeLinecap="round" filter="url(#drop-shadow)"
          />
        )
      })}

      {/* Central opening (dark) */}
      <ellipse cx={cx} cy={cy} rx={width * 0.16} ry={height * 0.12}
        fill="#020617" filter="url(#inner-shadow)"
        stroke="#0f172a" strokeWidth={2}
      />

      {/* Rotating rotor/shaft with copper accents */}
      <g ref={shaftRef}>
        {Array.from({ length: 4 }, (_, i) => {
          const a = (i / 4) * Math.PI * 2
          const rr = width * 0.12
          return (
            <line key={i}
              x1={cx} y1={cy}
              x2={cx + rr * Math.cos(a)} y2={cy + rr * Math.sin(a) * 0.6}
              stroke="url(#metal-copper)" strokeWidth={4}
              strokeLinecap="round"
            />
          )
        })}
        {Array.from({ length: 4 }, (_, i) => {
          const a = (i / 4) * Math.PI * 2 + Math.PI/4
          const rr = width * 0.14
          return (
            <line key={i}
              x1={cx} y1={cy}
              x2={cx + rr * Math.cos(a)} y2={cy + rr * Math.sin(a) * 0.6}
              stroke={running ? baseColor : 'url(#metal-chrome)'} strokeWidth={3}
              strokeLinecap="round"
            />
          )
        })}
      </g>

      {/* Core Hub */}
      <ellipse cx={cx} cy={cy} rx={width * 0.08} ry={height * 0.06}
        fill="url(#metal-dark)" stroke="url(#metal-chrome)" strokeWidth={2}
        filter="url(#drop-shadow)"
      />
      <ellipse cx={cx} cy={cy} rx={width * 0.03} ry={height * 0.02}
        fill="#020617"
      />

      {/* Breaker indicator */}
      <rect x={cx - 20} y={cy - height * 0.28} width={40} height={14}
        rx={3}
        fill={breaker_closed ? 'rgba(0,230,118,0.15)' : 'rgba(60,60,80,0.4)'}
        stroke={breaker_closed ? 'rgba(0,230,118,0.5)' : 'rgba(100,100,120,0.3)'}
        strokeWidth={1}
      />
      <text x={cx} y={cy - height * 0.28 + 10} textAnchor="middle"
        fontSize={8} fontFamily="'Share Tech Mono'"
        fill={breaker_closed ? '#00e676' : '#3a6a85'}
      >{breaker_closed ? 'BKR CLOSED' : 'BKR OPEN'}</text>

      {/* MW output */}
      <text x={cx} y={cy + height * 0.2} textAnchor="middle"
        fontSize={15} fontFamily="'Share Tech Mono'" fontWeight="bold"
        fill={isAlarm ? '#ff5252' : '#00e5ff'}
      >{mw_output.toFixed(1)}<tspan fontSize={9} fill="#7db8d4"> MW</tspan></text>
      <text x={cx} y={cy + height * 0.2 + 14} textAnchor="middle"
        fontSize={9} fontFamily="'Share Tech Mono'" fill="#3a6a85"
      >{frequency.toFixed(2)} Hz  ·  {voltage.toFixed(1)} kV</text>

      {/* Status */}
      <rect x={cx - 35} y={height - 22} width={70} height={16}
        rx={3} fill={tripped ? 'rgba(255,23,68,0.15)' : running ? 'rgba(0,180,100,0.1)' : 'rgba(0,0,0,0.3)'}
        stroke={tripped ? 'rgba(255,23,68,0.4)' : running ? 'rgba(0,230,118,0.3)' : 'rgba(255,255,255,0.05)'}
        strokeWidth={1}
      />
      <text x={cx} y={height - 11} textAnchor="middle"
        fontSize={9} fontFamily="'Rajdhani'" fontWeight="700" letterSpacing="0.1em"
        fill={tripped ? '#ff5252' : running ? '#00e676' : '#3a6a85'}
      >{tripped ? 'TRIPPED' : running ? 'GENERATING' : 'OFFLINE'}</text>

      <text x={cx} y={8} textAnchor="middle"
        fontSize={10} fontFamily="'Exo 2'" fontWeight="600"
        letterSpacing="0.12em" fill="#7db8d4"
      >GENERATOR</text>
    </svg>
  )
}
