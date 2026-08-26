/**
 * TurbineSVG — Animated turbine with rotating blades.
 * Rotation speed ∝ rpm_actual. Red glow + judder on fault.
 */
import React, { useRef, useEffect, useId } from 'react'

export default function TurbineSVG({ turbine = {}, width = 140, height = 180, onClick }) {
  const {
    rpm_actual = 0,
    vibration = 0.1,
    running = false,
    tripped = false,
    fault_vibration = false,
  } = turbine

  const id = useId().replace(/:/g, '')
  const rotorRef = useRef(null)
  const angleRef = useRef(0)
  const rpmRef = useRef(rpm_actual)

  const isAlarm = tripped || fault_vibration
  const vibration_alarm = vibration > 4

  useEffect(() => { rpmRef.current = rpm_actual }, [rpm_actual])

  // Continuous rotation animation
  useEffect(() => {
    let frame
    let lastTime = performance.now()
    const animate = (now) => {
      const dt = (now - lastTime) / 1000
      lastTime = now
      // degrees per second = rpm * 6
      const dps = rpmRef.current * 6
      angleRef.current = (angleRef.current + dps * dt) % 360
      if (rotorRef.current) {
        // Judder when vibration alarm
        const judder = vibration_alarm ? (Math.random() - 0.5) * 2.5 : 0
        rotorRef.current.setAttribute(
          'transform',
          `rotate(${angleRef.current + judder}, ${width / 2}, ${height * 0.42})`
        )
      }
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [width, height, vibration_alarm])

  const cx = width / 2
  const cy = height * 0.42
  const R  = width * 0.28   // outer blade tip radius
  const rh = R * 0.22       // hub radius
  const NUM_BLADES = 6

  // Generate blade paths
  const blades = Array.from({ length: NUM_BLADES }, (_, i) => {
    const angle = (i / NUM_BLADES) * 360
    const rad = (angle * Math.PI) / 180
    const tip = { x: cx + R * Math.cos(rad), y: cy + R * Math.sin(rad) }
    // Blade shape: swept airfoil approximation
    const left = { x: cx + rh * Math.cos(rad + 0.5), y: cy + rh * Math.sin(rad + 0.5) }
    const right = { x: cx + rh * Math.cos(rad - 0.3), y: cy + rh * Math.sin(rad - 0.3) }
    const ctrl1 = { x: (left.x + tip.x) / 2 - (tip.y - left.y) * 0.25, y: (left.y + tip.y) / 2 + (tip.x - left.x) * 0.25 }
    const ctrl2 = { x: (right.x + tip.x) / 2 + (tip.y - right.y) * 0.1, y: (right.y + tip.y) / 2 - (tip.x - right.x) * 0.1 }
    return `M ${left.x.toFixed(2)} ${left.y.toFixed(2)}
            Q ${ctrl1.x.toFixed(2)} ${ctrl1.y.toFixed(2)} ${tip.x.toFixed(2)} ${tip.y.toFixed(2)}
            Q ${ctrl2.x.toFixed(2)} ${ctrl2.y.toFixed(2)} ${right.x.toFixed(2)} ${right.y.toFixed(2)} Z`
  })

  const bladeColor = isAlarm ? '#ff5252' : running ? '#00c8e0' : 'var(--text-muted)'
  const bladeGlow  = isAlarm ? 'rgba(255,50,50,0.5)' : running ? 'rgba(0,200,224,0.4)' : 'transparent'

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}
      style={{ cursor: onClick ? 'pointer' : 'default', overflow: 'visible' }}
      onClick={onClick}
    >
      <defs>
        <filter id={`tg-${id}`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation={isAlarm ? 4 : 2} result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <radialGradient id={`tbg-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor={isAlarm ? '#ff1744' : '#0090b0'} stopOpacity="0.8" />
          <stop offset="100%" stopColor={isAlarm ? '#550000' : '#002030'} stopOpacity="0.2" />
        </radialGradient>
      </defs>

      {/* Heavy structural mount */}
      <path d={`M ${cx - R - 10} ${cy + R} L ${cx + R + 10} ${cy + R} L ${cx + R + 20} ${cy + R + 15} L ${cx - R - 20} ${cy + R + 15} Z`}
        fill="url(#metal-dark)" stroke="#334155" strokeWidth={2} filter="url(#drop-shadow)" />

      {/* Main outer casing / stator shell */}
      <g filter={isAlarm ? `url(#tg-${id})` : 'url(#drop-shadow)'}>
        <circle cx={cx} cy={cy} r={R + 14}
          fill="url(#metal-base)"
          stroke={isAlarm ? '#ff1744' : 'url(#metal-chrome)'}
          strokeWidth={isAlarm ? 3 : 4}
        />
        {/* Cooling ribs */}
        <line x1={cx - R - 14} y1={cy} x2={cx + R + 14} y2={cy} stroke="#020617" strokeWidth={6} />
        <line x1={cx - R - 14} y1={cy} x2={cx + R + 14} y2={cy} stroke="#64748b" strokeWidth={2} />
        <line x1={cx} y1={cy - R - 14} x2={cx} y2={cy + R + 14} stroke="#020617" strokeWidth={6} />
        <line x1={cx} y1={cy - R - 14} x2={cx} y2={cy + R + 14} stroke="#64748b" strokeWidth={2} />
      </g>

      {/* Inner casing opening (where blades are visible) */}
      <circle cx={cx} cy={cy} r={R}
        fill="#020617"
        stroke="#0f172a"
        strokeWidth={4}
        filter="url(#inner-shadow)"
      />

      {/* Rotating blades group */}
      <g ref={rotorRef}>
        {blades.map((d, i) => (
          <path key={i} d={d}
            fill={isAlarm ? '#ef4444' : 'url(#metal-chrome)'}
            filter={running ? `url(#tg-${id})` : undefined}
            stroke="#0f172a"
            strokeWidth={1}
          />
        ))}
        {/* Hub / Rotor Shaft */}
        <circle cx={cx} cy={cy} r={rh}
          fill={isAlarm ? '#7f1d1d' : 'url(#metal-dark)'}
          stroke={isAlarm ? '#ef4444' : 'url(#metal-chrome)'}
          strokeWidth={3}
          filter="url(#drop-shadow)"
        />
        <circle cx={cx} cy={cy} r={rh * 0.4}
          fill="url(#metal-base)"
        />
        <circle cx={cx} cy={cy} r={rh * 0.2}
          fill="#020617"
        />
      </g>

      {/* Solid Shaft going out horizontally */}
      <rect x={cx + R + 14} y={cy - 8} width={20} height={16} fill="url(#metal-chrome)" stroke="#334155" strokeWidth={2} />
      <line x1={cx + R + 14} y1={cy} x2={cx + R + 34} y2={cy} stroke="#ffffff" strokeOpacity={0.3} strokeWidth={2} />

      {/* Digital Readout Screen for RPM / VIB */}
      <g filter="url(#drop-shadow)">
        <rect x={cx - 45} y={cy + R + 18} width={90} height={32} rx={4} fill="#020617" stroke="#475569" strokeWidth={2} />
        <text x={cx} y={cy + R + 32} textAnchor="middle"
          fontSize={12} fontFamily="'Share Tech Mono'" fill={isAlarm ? '#ef4444' : '#10b981'} fontWeight="bold"
        >{rpm_actual.toFixed(0)} <tspan fontSize={8} fill="#64748b">RPM</tspan></text>
        <text x={cx} y={cy + R + 44} textAnchor="middle"
          fontSize={9} fontFamily="'Share Tech Mono'"
          fill={vibration > 4 ? '#f59e0b' : vibration > 6 ? '#ef4444' : '#64748b'}
        >VIB: {vibration.toFixed(2)} mm/s</text>
      </g>

      {/* Status label */}
      <rect x={cx - 35} y={height - 22} width={70} height={16}
        rx={3} fill={tripped ? 'rgba(255,23,68,0.15)' : running ? 'rgba(0,180,100,0.1)' : 'rgba(0,0,0,0.3)'}
        stroke={tripped ? 'rgba(255,23,68,0.4)' : running ? 'rgba(0,230,118,0.3)' : 'rgba(255,255,255,0.05)'}
        strokeWidth={1}
      />
      <text x={cx} y={height - 11} textAnchor="middle"
        fontSize={9} fontFamily="'Rajdhani'" fontWeight="700" letterSpacing="0.1em"
        fill={tripped ? '#ff5252' : running ? '#00e676' : '#3a6a85'}
      >{tripped ? 'TRIPPED' : running ? 'RUNNING' : 'OFFLINE'}</text>

      <text x={cx} y={8} textAnchor="middle"
        fontSize={10} fontFamily="'Exo 2'" fontWeight="600"
        letterSpacing="0.12em" fill="#7db8d4"
      >TURBINE</text>
    </svg>
  )
}
