import React, { useId } from 'react';

export default function HeaterSVG({ width = 60, height = 80, label = "Htr", running = true }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`h-bg-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="50%" stopColor="#334155" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <style>{`
          @keyframes htrFlow${id} {
            from { stroke-dashoffset: 0; }
            to { stroke-dashoffset: -16; }
          }
          @keyframes htrBubble${id} {
            0% { transform: translateY(0) scale(1); opacity: 0.6; }
            100% { transform: translateY(-12px) scale(1.3); opacity: 0; }
          }
        `}</style>
      </defs>
      
      {/* Outer shell */}
      <rect x={0} y={0} width={width} height={height} rx={4} fill={`url(#h-bg-${id})`} stroke={running ? '#0ea5e9' : '#475569'} strokeWidth={2} filter="url(#drop-shadow)" />
      
      {/* Water level at bottom */}
      <rect x={2} y={height * 0.7} width={width - 4} height={height * 0.3 - 2} rx={2} fill="rgba(56, 189, 248, 0.4)" />
      
      {/* Internal heating coil - glowing when running */}
      <path d={`M ${width*0.2} ${height} L ${width*0.2} ${height*0.2} Q ${width*0.5} ${height*0.1} ${width*0.8} ${height*0.3} Q ${width*0.5} ${height*0.5} ${width*0.8} ${height*0.7} L ${width*0.8} 0`} fill="none" stroke={running ? '#f97316' : '#e2e8f0'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Animated flow through coil */}
      {running && (
        <path d={`M ${width*0.2} ${height} L ${width*0.2} ${height*0.2} Q ${width*0.5} ${height*0.1} ${width*0.8} ${height*0.3} Q ${width*0.5} ${height*0.5} ${width*0.8} ${height*0.7} L ${width*0.8} 0`} fill="none" stroke="#fbbf24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 4" style={{ animation: `htrFlow${id} 0.6s linear infinite` }} opacity={0.7} />
      )}
      
      {/* Rising bubbles in water when running */}
      {running && (
        <g>
          {[0,1,2].map(i => (
            <circle key={i} cx={width*0.3 + i*width*0.2} cy={height*0.8} r={1.5 + i*0.5} fill="#bae6fd" style={{ animation: `htrBubble${id} ${0.6 + i*0.15}s infinite ease-in ${i*0.2}s`, opacity: 0 }} />
          ))}
        </g>
      )}
      
      {/* Active indicator dot */}
      {running && (
        <circle cx={width - 6} cy={6} r={3} fill="#10b981">
          <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
        </circle>
      )}
      
      {/* Label */}
      <text x={width / 2} y={height + 14} textAnchor="middle" fontSize={10} fontFamily="'Exo 2'" fontWeight="600" fill={running ? '#38bdf8' : '#7db8d4'}>{label}</text>
    </svg>
  );
}
