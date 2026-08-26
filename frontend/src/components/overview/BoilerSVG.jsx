/**
 * BoilerSVG — Animated boiler with realistic flame effect.
 * Flame height, flicker speed, and glow intensity all scale with firing_rate.
 * When off/tripped, flame fades out smoothly.
 */
import React, { useRef, useEffect, useId } from 'react'

export default function BoilerSVG({ boiler = {}, width = 140, height = 200, onClick }) {
  const {
    firing_rate = 0,
    steam_pressure = 0,
    drum_level = 50,
    running = false,
    tripped = false,
  } = boiler

  const id = useId().replace(/:/g, '')
  const flameRef = useRef(null)
  const emberRef = useRef(null)
  const turbRef = useRef(null)
  const glowRef = useRef(null)

  const intensity = running ? Math.max(0.2, firing_rate / 100) : 0
  const isAlarm = tripped

  // Animate turbulence baseFrequency to make flame flicker
  useEffect(() => {
    if (!turbRef.current) return
    let frame
    let t = 0
    const animate = () => {
      t += 0.015 + intensity * 0.02
      const bf = 0.012 + intensity * 0.008 + Math.sin(t * 2.3) * 0.003
      turbRef.current?.setAttribute('baseFrequency', `${bf.toFixed(4)} 0.02`)
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [intensity])

  const cx = width / 2
  const bodyTop = height * 0.08
  const bodyH = height * 0.62
  const bodyW = width * 0.72
  const bodyX = (width - bodyW) / 2
  const drumY = height * 0.06
  const drumH = height * 0.08

  // Flame dimensions scale with intensity
  const flameH = bodyH * 0.55 * Math.max(0.05, intensity)
  const flameY = bodyTop + bodyH * 0.82 - flameH
  const flameW = bodyW * 0.5

  // Drum level bar
  const levelH = bodyH * 0.28
  const levelFill = (drum_level / 100) * levelH

  return (
    <svg
      width={width} height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ cursor: onClick ? 'pointer' : 'default', overflow: 'visible' }}
      onClick={onClick}
    >
      <defs>
        {/* Flame gradient */}
        <radialGradient id={`fg-${id}`} cx="50%" cy="80%" r="55%">
          <stop offset="0%"   stopColor="#fff7aa" stopOpacity={0.95} />
          <stop offset="20%"  stopColor="#ffcc00" stopOpacity={0.9} />
          <stop offset="55%"  stopColor="#ff6600" stopOpacity={0.8} />
          <stop offset="85%"  stopColor="#cc1100" stopOpacity={0.5} />
          <stop offset="100%" stopColor="#550000" stopOpacity={0} />
        </radialGradient>

        {/* Turbulence for flame warp */}
        <filter id={`ff-${id}`} x="-30%" y="-50%" width="160%" height="200%">
          <feTurbulence ref={turbRef} type="turbulence" baseFrequency="0.015 0.02"
            numOctaves="3" seed="8" result="turb" />
          <feDisplacementMap in="SourceGraphic" in2="turb"
            scale={8 + intensity * 18} xChannelSelector="R" yChannelSelector="G"
            result="displaced" />
          <feGaussianBlur in="displaced" stdDeviation={0.5 + intensity * 0.8} />
        </filter>

        {/* Boiler body glow */}
        <filter id={`bg-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={isAlarm ? 5 : 2} result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>

        {/* Drum level clip */}
        <clipPath id={`lc-${id}`}>
          <rect x={bodyX + bodyW * 0.12} y={bodyTop + bodyH * 0.52 + levelH - levelFill}
            width={bodyW * 0.76} height={levelFill} />
        </clipPath>
      </defs>

      {/* ── Steam pipe to turbine (top) ── */}
      <rect x={cx - 10} y={0} width={20} height={bodyTop + 4}
        fill="url(#metal-dark)" stroke="#334155" strokeWidth={2} />

      {/* ── Boiler outer casing (Heavy Steel) ── */}
      <g filter={isAlarm ? `url(#bg-${id})` : 'url(#drop-shadow)'}>
        <rect
          x={bodyX} y={bodyTop} width={bodyW} height={bodyH}
          rx={8} ry={8}
          fill={isAlarm ? 'rgba(80,0,0,0.9)' : 'url(#metal-base)'}
          stroke={isAlarm ? '#ff1744' : '#64748b'}
          strokeWidth={isAlarm ? 3 : 2}
          style={{ transition: 'fill 0.5s, stroke 0.5s' }}
        />
        {/* Structural Ribs */}
        <line x1={bodyX} y1={bodyTop + bodyH * 0.2} x2={bodyX + bodyW} y2={bodyTop + bodyH * 0.2} stroke="#0f172a" strokeWidth={4} />
        <line x1={bodyX} y1={bodyTop + bodyH * 0.2} x2={bodyX + bodyW} y2={bodyTop + bodyH * 0.2} stroke="#64748b" strokeWidth={1} />
        
        <line x1={bodyX} y1={bodyTop + bodyH * 0.8} x2={bodyX + bodyW} y2={bodyTop + bodyH * 0.8} stroke="#0f172a" strokeWidth={4} />
        <line x1={bodyX} y1={bodyTop + bodyH * 0.8} x2={bodyX + bodyW} y2={bodyTop + bodyH * 0.8} stroke="#64748b" strokeWidth={1} />
      </g>

      {/* ── Furnace window (fire chamber) with heavy rim ── */}
      <rect x={bodyX + bodyW * 0.15} y={bodyTop + bodyH * 0.35}
        width={bodyW * 0.7} height={bodyH * 0.4}
        rx={6} fill="#020617" stroke="url(#metal-chrome)" strokeWidth={4}
        filter="url(#drop-shadow)"
      />
      {/* Inner dark rim */}
      <rect x={bodyX + bodyW * 0.15 + 2} y={bodyTop + bodyH * 0.35 + 2}
        width={bodyW * 0.7 - 4} height={bodyH * 0.4 - 4}
        rx={4} fill="none" stroke="#000000" strokeWidth={2}
      />

      {/* ── FLAME ── */}
      {intensity > 0.02 && (
        <g style={{ opacity: Math.min(1, intensity * 1.5 + 0.1), transition: 'opacity 0.8s' }} clipPath={`url(#flame-clip-${id})`}>
          <defs>
            <clipPath id={`flame-clip-${id}`}>
              <rect x={bodyX + bodyW * 0.15 + 4} y={bodyTop + bodyH * 0.35 + 4} width={bodyW * 0.7 - 8} height={bodyH * 0.4 - 8} rx={2} />
            </clipPath>
          </defs>
          {/* Base glow */}
          <ellipse
            cx={cx} cy={bodyTop + bodyH * 0.75}
            rx={flameW * 0.8} ry={flameH * 0.15}
            fill={`rgba(255,120,0,${0.6 * intensity})`}
            filter={`url(#bg-${id})`}
          />
          {/* Main flame shape */}
          <path
            d={`M ${cx - flameW * 0.5} ${bodyTop + bodyH * 0.75}
               C ${cx - flameW * 0.4} ${flameY + flameH * 0.5},
                 ${cx - flameW * 0.2} ${flameY + flameH * 0.2},
                 ${cx} ${flameY - flameH * 0.1}
               C ${cx + flameW * 0.2} ${flameY + flameH * 0.2},
                 ${cx + flameW * 0.4} ${flameY + flameH * 0.5},
                 ${cx + flameW * 0.5} ${bodyTop + bodyH * 0.75}
               Z`}
            fill={`url(#fg-${id})`}
            filter={`url(#ff-${id})`}
          />
          {/* Inner hot core */}
          <path
            d={`M ${cx - flameW * 0.2} ${bodyTop + bodyH * 0.7}
               C ${cx - flameW * 0.1} ${flameY + flameH * 0.5},
                 ${cx} ${flameY + flameH * 0.3},
                 ${cx} ${flameY + flameH * 0.1}
               C ${cx} ${flameY + flameH * 0.3},
                 ${cx + flameW * 0.1} ${flameY + flameH * 0.5},
                 ${cx + flameW * 0.2} ${bodyTop + bodyH * 0.7}
               Z`}
            fill="rgba(255,255,200,0.8)"
            filter={`url(#ff-${id})`}
          />
        </g>
      )}

      {/* ── Physical Steam Drum & Level ── */}
      <g filter="url(#drop-shadow)">
        <rect x={bodyX - 5} y={bodyTop - 10} width={bodyW + 10} height={35} rx={17}
          fill="url(#metal-dark)" stroke="url(#metal-chrome)" strokeWidth={2} />
        <line x1={bodyX - 5} y1={bodyTop + 7} x2={bodyX + bodyW + 5} y2={bodyTop + 7} stroke="#020617" strokeWidth={3} />
        <line x1={bodyX - 5} y1={bodyTop + 8} x2={bodyX + bodyW + 5} y2={bodyTop + 8} stroke="#64748b" strokeWidth={1} />
      </g>
      
      {/* Sight Glass */}
      <rect x={cx - 15} y={bodyTop - 5} width={30} height={25} rx={3} fill="#0f172a" stroke="#475569" strokeWidth={2} />
      <rect x={cx - 13} y={bodyTop - 3 + (21 - (drum_level/100)*21)} width={26} height={(drum_level/100)*21} rx={2}
        fill={drum_level < 15 ? '#ef4444' : drum_level < 25 ? '#f59e0b' : '#3b82f6'} style={{transition: 'height 0.8s, y 0.8s'}} />
      <text x={cx} y={bodyTop - 15} textAnchor="middle" fontSize={8} fontFamily="'Share Tech Mono'" fill="#94a3b8">DRUM</text>

      {/* ── Physical Analog Pressure Gauge ── */}
      <g filter="url(#drop-shadow)" transform={`translate(${bodyX + bodyW + 16}, ${bodyTop + bodyH * 0.3})`}>
        {/* Gauge Body */}
        <circle cx={0} cy={0} r={16} fill="url(#metal-chrome)" />
        <circle cx={0} cy={0} r={13} fill="#020617" />
        {/* Ticks */}
        <line x1="-9" y1="9" x2="-7" y2="7" stroke="#cbd5e1" strokeWidth={1} />
        <line x1="-11" y1="0" x2="-9" y2="0" stroke="#cbd5e1" strokeWidth={1} />
        <line x1="-9" y1="-9" x2="-7" y2="-7" stroke="#cbd5e1" strokeWidth={1} />
        <line x1="0" y1="-11" x2="0" y2="-9" stroke="#ef4444" strokeWidth={1.5} />
        <line x1="9" y1="-9" x2="7" y2="-7" stroke="#ef4444" strokeWidth={1.5} />
        <line x1="11" y1="0" x2="9" y2="0" stroke="#ef4444" strokeWidth={1.5} />
        {/* Value Text */}
        <text x={0} y={6} textAnchor="middle" fontSize={7} fontFamily="'Share Tech Mono'" fill="#e2e8f0">{steam_pressure.toFixed(0)}</text>
        <text x={0} y={11} textAnchor="middle" fontSize={4} fontFamily="'Rajdhani'" fill="#64748b">BAR</text>
        {/* Needle (min 0, max 200 mapped to angle -135 to 135) */}
        <g style={{ transform: `rotate(${-135 + (Math.min(200, steam_pressure) / 200) * 270}deg)`, transition: 'transform 0.5s ease-out' }}>
          <polygon points="-1,2 1,2 0,-10" fill="#ef4444" />
          <circle cx={0} cy={0} r={2} fill="url(#metal-chrome)" />
        </g>
      </g>

      {/* ── Status label ── */}
      <rect x={bodyX} y={bodyTop + bodyH + 4} width={bodyW} height={18}
        rx={3} fill={tripped ? 'rgba(255,23,68,0.15)' : running ? 'rgba(0,180,100,0.1)' : 'rgba(0,0,0,0.3)'}
        stroke={tripped ? 'rgba(255,23,68,0.4)' : running ? 'rgba(0,230,118,0.3)' : 'rgba(255,255,255,0.05)'}
        strokeWidth={1}
      />
      <text x={cx} y={bodyTop + bodyH + 16} textAnchor="middle"
        fontSize={9} fontFamily="'Rajdhani'" fontWeight="700"
        letterSpacing="0.1em" fill={tripped ? '#ff5252' : running ? '#00e676' : '#3a6a85'}
      >{tripped ? 'TRIPPED' : running ? 'RUNNING' : 'OFFLINE'}</text>

      {/* ── Equipment label ── */}
      <text x={cx} y={height - 2} textAnchor="middle"
        fontSize={10} fontFamily="'Exo 2'" fontWeight="600"
        letterSpacing="0.12em" fill="#7db8d4"
      >BOILER</text>
    </svg>
  )
}
