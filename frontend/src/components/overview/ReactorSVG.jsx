import React from 'react'

export default function ReactorSVG({ reactor, width = 140, height = 200, onClick }) {
  const isRunning = reactor?.running
  const isTripped = reactor?.tripped

  // Visual mapping
  const fluxColor = isTripped ? '#ff1744' : (isRunning ? '#00ffaa' : '#475569')
  const rodPct = reactor?.control_rods ?? 0
  const coreTemp = reactor?.core_temp ?? 40

  const rodHeight = (100 - rodPct) / 100 * (height * 0.45)

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} 
         style={{ cursor: onClick ? 'pointer' : 'default', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))' }} 
         onClick={onClick}>
      <defs>
        <linearGradient id="reactorOuter" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="50%" stopColor="#334155" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="reactorGlass" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.0)" />
        </linearGradient>
        <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={fluxColor} stopOpacity={isRunning ? 0.8 : 0.15} />
          <stop offset="70%" stopColor={fluxColor} stopOpacity={isRunning ? 0.3 : 0.05} />
          <stop offset="100%" stopColor={fluxColor} stopOpacity={0} />
        </radialGradient>
        <pattern id="hexGrid" width="10" height="17.32" patternUnits="userSpaceOnUse" patternTransform="scale(0.5)">
          <path d="M5,0 L10,2.88 L10,8.66 L5,11.54 L0,8.66 L0,2.88 Z M5,17.32 L10,14.43 L10,8.66 L5,11.54 L0,8.66 L0,14.43 Z M10,8.66 L15,11.54 L15,17.32 L10,14.43 Z M0,8.66 L-5,11.54 L-5,17.32 L0,14.43 Z" fill="none" stroke="rgba(0,255,170,0.15)" strokeWidth="1"/>
        </pattern>
        
        {/* Coolant Bubble Animation */}
        <linearGradient id="bubbleGrad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={fluxColor} stopOpacity="0" />
          <stop offset="50%" stopColor={fluxColor} stopOpacity="0.5" />
          <stop offset="100%" stopColor={fluxColor} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Main Vessel Background */}
      <rect x={width * 0.1} y={height * 0.1} width={width * 0.8} height={height * 0.8} rx={25}
            fill="url(#reactorOuter)" stroke="#475569" strokeWidth={3} />
            
      {/* Inner Cavity (Hex Grid) */}
      <rect x={width * 0.15} y={height * 0.15} width={width * 0.7} height={height * 0.7} rx={20}
            fill="#020617" />
      <rect x={width * 0.15} y={height * 0.15} width={width * 0.7} height={height * 0.7} rx={20}
            fill="url(#hexGrid)" />

      {/* Animated Core Glow */}
      <circle cx={width * 0.5} cy={height * 0.65} r={width * 0.4} fill="url(#coreGlow)">
        {isRunning && <animate attributeName="r" values={`${width*0.35};${width*0.42};${width*0.35}`} dur="2s" repeatCount="indefinite" />}
      </circle>
      
      {/* Coolant fluid level */}
      <rect x={width * 0.15} y={height * 0.4} width={width * 0.7} height={height * 0.45} rx={15} 
            fill="url(#bubbleGrad)" style={{ mixBlendMode: 'screen' }} />

      {/* Control Rods (3 of them) */}
      {[0.3, 0.5, 0.7].map((pos, i) => (
        <g key={i}>
          {/* Channel Guides */}
          <rect x={width * pos - 4} y={height * 0.15} width={8} height={height * 0.45} 
                fill="rgba(0,0,0,0.5)" rx={4} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
          {/* Rod */}
          <rect x={width * pos - 3} y={height * 0.15 + rodHeight} width={6} height={height * 0.45 - rodHeight} 
                fill="url(#reactorOuter)" stroke={fluxColor} strokeWidth={1} rx={3} 
                style={{ transition: 'y 0.5s ease, height 0.5s ease', filter: `drop-shadow(0 0 4px ${fluxColor})` }} />
          {/* Rod Tip Glow */}
          <circle cx={width * pos} cy={height * 0.15 + height * 0.45} r={3} fill={fluxColor} 
                  style={{ opacity: rodPct > 5 ? 1 : 0.2 }} />
        </g>
      ))}
      
      {/* Glassmorphism Overlay */}
      <rect x={width * 0.1} y={height * 0.1} width={width * 0.8} height={height * 0.8} rx={25}
            fill="url(#reactorGlass)" pointerEvents="none" />
            
      {/* Glare effect */}
      <path d={`M ${width*0.15} ${height*0.15} Q ${width*0.5} ${height*0.25} ${width*0.85} ${height*0.15} L ${width*0.85} ${height*0.1} L ${width*0.15} ${height*0.1} Z`} 
            fill="rgba(255,255,255,0.15)" pointerEvents="none" />

      {/* Digital Readout Screen */}
      <rect x={width * 0.25} y={height * 0.73} width={width * 0.5} height={height * 0.14} rx={6}
            fill="#020617" stroke={fluxColor} strokeWidth={1} strokeOpacity={0.5} />
            
      {/* Labels */}
      <text x={width * 0.5} y={height * 0.78} textAnchor="middle" fill="#7db8d4" 
            fontFamily="'Exo 2'" fontSize={7} fontWeight="800" letterSpacing="0.1em">CORE TEMP</text>
      <text x={width * 0.5} y={height * 0.85} textAnchor="middle" fill={fluxColor} 
            fontFamily="'Share Tech Mono'" fontSize={11} fontWeight="bold"
            style={{ filter: `drop-shadow(0 0 2px ${fluxColor})` }}>
        {coreTemp.toFixed(1)} °C
      </text>
    </svg>
  )
}
