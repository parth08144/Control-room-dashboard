import React, { useId } from 'react';

export default function HeaterSVG({ width = 60, height = 80, label = "Htr" }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`h-bg-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="50%" stopColor="#334155" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>
      
      {/* Outer shell */}
      <rect x={0} y={0} width={width} height={height} rx={4} fill={`url(#h-bg-${id})`} stroke="#475569" strokeWidth={2} filter="url(#drop-shadow)" />
      
      {/* Water level at bottom */}
      <rect x={2} y={height * 0.7} width={width - 4} height={height * 0.3 - 2} rx={2} fill="rgba(56, 189, 248, 0.4)" />
      
      {/* Internal heating coil */}
      <path d={`M ${width*0.2} ${height} L ${width*0.2} ${height*0.2} Q ${width*0.5} ${height*0.1} ${width*0.8} ${height*0.3} Q ${width*0.5} ${height*0.5} ${width*0.8} ${height*0.7} L ${width*0.8} 0`} fill="none" stroke="#e2e8f0" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Label */}
      <text x={width / 2} y={height + 14} textAnchor="middle" fontSize={10} fontFamily="'Exo 2'" fontWeight="600" fill="#7db8d4">{label}</text>
    </svg>
  );
}
