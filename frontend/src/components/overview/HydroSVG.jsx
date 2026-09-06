import React from 'react'

export default function HydroSVG({ hydro, width = 140, height = 200, onClick }) {
  const isRunning = hydro?.running
  const isTripped = hydro?.tripped

  // Visual mapping
  const statusColor = isTripped ? '#ff1744' : (isRunning ? '#00e5ff' : '#475569')
  const reservoirLvl = hydro?.reservoir_level ?? 100
  const gatePct = hydro?.gate_opening ?? 0
  const inflowPct = hydro?.inflow ?? 50
  const levelTrend = hydro?.level_trend ?? 0

  // Water level max is 100
  const waterHeight = Math.max(0, Math.min(100, reservoirLvl)) / 100 * (height * 0.7)
  const waterY = height * 0.9 - waterHeight
  
  // Gate animation
  // when gatePct = 0, y is 0.75 * height (closed)
  // when gatePct = 100, y is 0.6 * height (open)
  const gateY = height * 0.75 - (gatePct / 100) * (height * 0.15)

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} 
         style={{ cursor: onClick ? 'pointer' : 'default', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))' }} 
         onClick={onClick}>
      <defs>
        <linearGradient id="damConcrete" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="50%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
        <linearGradient id="waterBody" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#0077cc" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="penstockTube" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="50%" stopColor="#334155" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>

      {/* Background/Sky cutout */}
      <rect x={width * 0.05} y={height * 0.1} width={width * 0.9} height={height * 0.8} rx={10}
            fill="#020617" stroke="#475569" strokeWidth={2} />

      {/* Reservoir Water */}
      <path d={`M ${width * 0.05} ${waterY} L ${width * 0.5} ${waterY} L ${width * 0.5} ${height * 0.9} L ${width * 0.05} ${height * 0.9} Z`}
            fill="url(#waterBody)" />

      {/* Inflow animation (Refill) */}
      {inflowPct > 0 && (
        <path d={`M ${width * 0.05} ${height * 0.15} L ${width * 0.25} ${height * 0.25} L ${width * 0.3} ${waterY}`}
              stroke="#00e5ff" strokeWidth={3} strokeDasharray="6 6" fill="none">
          <animate attributeName="stroke-dashoffset" from="24" to="0" dur={`${Math.max(0.5, 30 / inflowPct)}s`} repeatCount="indefinite" />
        </path>
      )}

      {/* Dam Structure (Sloped) */}
      <path d={`M ${width * 0.5} ${height * 0.1} L ${width * 0.65} ${height * 0.1} L ${width * 0.95} ${height * 0.9} L ${width * 0.5} ${height * 0.9} Z`}
            fill="url(#damConcrete)" stroke="#1e293b" strokeWidth={2} />

      {/* Spillway Overflow (when level is very high) */}
      {reservoirLvl > 95 && (
        <>
          <path d={`M ${width * 0.65} ${height * 0.1} L ${width * 0.95} ${height * 0.9}`}
                stroke="#00e5ff" strokeWidth={6} strokeOpacity={0.6} strokeDasharray="16 8" fill="none">
            <animate attributeName="stroke-dashoffset" from="48" to="0" dur="0.4s" repeatCount="indefinite" />
          </path>
          <path d={`M ${width * 0.65} ${height * 0.1} L ${width * 0.95} ${height * 0.9}`}
                stroke="#ffffff" strokeWidth={3} strokeOpacity={0.8} strokeDasharray="10 14" fill="none">
            <animate attributeName="stroke-dashoffset" from="48" to="0" dur="0.3s" repeatCount="indefinite" />
          </path>
        </>
      )}

      {/* Penstock inside dam */}
      <path d={`M ${width * 0.5} ${height * 0.75} L ${width * 0.95} ${height * 0.82} L ${width * 0.95} ${height * 0.86} L ${width * 0.5} ${height * 0.79} Z`}
            fill="url(#penstockTube)" />

      {/* Flow animation in penstock & Waterfall exit */}
      {isRunning && gatePct > 5 && (
        <>
          {/* Internal Penstock flow */}
          <path d={`M ${width * 0.52} ${height * 0.77} L ${width * 0.95} ${height * 0.84}`}
                stroke="#00e5ff" strokeWidth={3} strokeDasharray="8 4">
            <animate attributeName="stroke-dashoffset" from="12" to="0" dur={`${Math.max(0.1, 10 / gatePct)}s`} repeatCount="indefinite" />
          </path>
          
          {/* External Waterfall Jet */}
          <path d={`M ${width * 0.95} ${height * 0.84} Q ${width * 0.98} ${height * 0.84} ${width * 0.98} ${height * 1.0}`}
                stroke="#00e5ff" strokeWidth={3 + (gatePct/25)} strokeDasharray="10 5" fill="none" strokeOpacity={0.9} strokeLinecap="round">
            <animate attributeName="stroke-dashoffset" from="30" to="0" dur={`${Math.max(0.1, 10 / gatePct)}s`} repeatCount="indefinite" />
          </path>
          <path d={`M ${width * 0.95} ${height * 0.84} Q ${width * 0.98} ${height * 0.84} ${width * 0.98} ${height * 1.0}`}
                stroke="#ffffff" strokeWidth={1 + (gatePct/40)} strokeDasharray="6 8" fill="none" strokeOpacity={0.7} strokeLinecap="round">
            <animate attributeName="stroke-dashoffset" from="28" to="0" dur={`${Math.max(0.08, 8 / gatePct)}s`} repeatCount="indefinite" />
          </path>
          
          {/* Splashes at bottom */}
          <circle cx={width * 0.96} cy={height * 0.95} r={1.5} fill="#ffffff">
            <animate attributeName="cy" values={`${height * 0.95};${height * 1.02}`} dur="0.25s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0" dur="0.25s" repeatCount="indefinite" />
          </circle>
          <circle cx={width * 0.99} cy={height * 0.96} r={2} fill="#00e5ff">
            <animate attributeName="cy" values={`${height * 0.96};${height * 1.03}`} dur="0.3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0" dur="0.3s" repeatCount="indefinite" />
          </circle>
        </>
      )}

      {/* Turbine Wheel under waterfall */}
      <g transform={`translate(${width * 0.97}, ${height * 0.94})`}>
        {/* Turbine Housing (semi-circle) */}
        <path d="M -18 0 A 18 18 0 0 0 18 0 L 18 18 L -18 18 Z" fill="#0f172a" />
        <circle cx={0} cy={0} r={16} fill="#1e293b" stroke="#475569" strokeWidth={1.5} />
        
        {/* Rotor */}
        <g>
          {isRunning && gatePct > 5 && (
            <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur={`${Math.max(0.1, 8 / gatePct)}s`} repeatCount="indefinite" />
          )}
          {/* Hub */}
          <circle cx={0} cy={0} r={4} fill="#00e5ff" />
          {/* Blades */}
          {[0, 60, 120, 180, 240, 300].map(angle => (
            <path key={angle} transform={`rotate(${angle})`} d="M 0 -4 L 3.5 -13 L -3.5 -13 Z" fill="#64748b" />
          ))}
        </g>
      </g>

      {/* Gate / Valve */}
      {/* Channel */}
      <rect x={width * 0.48} y={height * 0.5} width={8} height={height * 0.3} rx={2} fill="#1e293b" />
      {/* Moving Gate */}
      <rect x={width * 0.49} y={gateY} width={6} height={height * 0.79 - gateY} fill="#ffcc00" rx={1} />
      {/* Valve Motor */}
      <circle cx={width * 0.52} cy={height * 0.5} r={8} fill={statusColor} />

      {/* Digital Readout Screen */}
      <rect x={width * 0.1} y={height * 0.15} width={width * 0.35} height={height * 0.16} rx={4}
            fill="#020617" stroke={statusColor} strokeWidth={1} strokeOpacity={0.5} />
            
      {/* Labels */}
      <text x={width * 0.27} y={height * 0.22} textAnchor="middle" fill="#7db8d4" 
            fontFamily="'Exo 2'" fontSize={7} fontWeight="800" letterSpacing="0.1em">LEVEL</text>
      <text x={width * 0.27} y={height * 0.29} textAnchor="middle" fill={statusColor} 
            fontFamily="'Share Tech Mono'" fontSize={10} fontWeight="bold"
            style={{ filter: `drop-shadow(0 0 2px ${statusColor})` }}>
        {reservoirLvl.toFixed(1)} m {levelTrend > 0.01 ? '▲' : levelTrend < -0.01 ? '▼' : ''}
      </text>
    </svg>
  )
}
