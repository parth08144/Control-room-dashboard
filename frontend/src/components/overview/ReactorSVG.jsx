import React from 'react'

export default function ReactorSVG({ reactor, width = 140, height = 200, onClick }) {
  const isRunning = reactor?.running
  const isTripped = reactor?.tripped

  // Visual mapping
  const fluxColor = isTripped ? '#ff1744' : (isRunning ? '#00e5ff' : '#475569')
  const rodPct = reactor?.control_rods ?? 0
  const coreTemp = reactor?.core_temp ?? 40

  const rodHeight = (100 - rodPct) / 100 * (height * 0.4)

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} 
         style={{ cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
      <defs>
        <linearGradient id="reactorBody" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="50%" stopColor="#475569" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={fluxColor} stopOpacity={isRunning ? 0.6 : 0.1} />
          <stop offset="100%" stopColor={fluxColor} stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* Main Vessel */}
      <rect x={width * 0.1} y={height * 0.1} width={width * 0.8} height={height * 0.8} rx={20}
            fill="url(#reactorBody)" stroke="#64748b" strokeWidth={2} />
      
      {/* Core Glow */}
      <circle cx={width * 0.5} cy={height * 0.6} r={width * 0.35} fill="url(#coreGlow)" />

      {/* Control Rods (3 of them) */}
      {[0.3, 0.5, 0.7].map((pos, i) => (
        <g key={i}>
          {/* Channel */}
          <rect x={width * pos - 3} y={height * 0.1} width={6} height={height * 0.4} fill="#0f172a" />
          {/* Rod */}
          <rect x={width * pos - 2} y={height * 0.1 + rodHeight} width={4} height={height * 0.4 - rodHeight} fill="#94a3b8" />
        </g>
      ))}

      {/* Labels */}
      <text x={width * 0.5} y={height * 0.9} textAnchor="middle" fill="#e2e8f0" 
            fontFamily="'Exo 2'" fontSize={10} fontWeight="bold">PWR CORE</text>
      <text x={width * 0.5} y={height * 0.5} textAnchor="middle" fill={fluxColor} 
            fontFamily="'Share Tech Mono'" fontSize={10} fontWeight="bold">
        {coreTemp.toFixed(0)} °C
      </text>
    </svg>
  )
}
