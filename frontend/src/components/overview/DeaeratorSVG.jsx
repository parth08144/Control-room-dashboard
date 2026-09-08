import React, { useId } from 'react';

export default function DeaeratorSVG({ width = 120, height = 80 }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`da-bg-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>
      
      {/* Deaerator dome (cloud-like or rounded top) */}
      <path d={`M 20 ${height*0.4} Q 20 0 ${width/2} 0 Q ${width-20} 0 ${width-20} ${height*0.4} Z`} fill={`url(#da-bg-${id})`} stroke="#475569" strokeWidth={2} filter="url(#drop-shadow)" />
      
      {/* Storage Tank */}
      <rect x={0} y={height * 0.4} width={width} height={height * 0.6} rx={8} fill={`url(#da-bg-${id})`} stroke="#475569" strokeWidth={2} filter="url(#drop-shadow)" />
      
      {/* Water level in storage tank */}
      <rect x={2} y={height * 0.6} width={width - 4} height={height * 0.4 - 2} rx={6} fill="rgba(56, 189, 248, 0.4)" />
      
      {/* Labels */}
      <text x={width / 2} y={height * 0.3} textAnchor="middle" fontSize={10} fontFamily="'Exo 2'" fontWeight="600" fill="#7db8d4">De-aerator</text>
      <text x={width / 2} y={height * 0.8} textAnchor="middle" fontSize={9} fontFamily="'Exo 2'" fill="#94a3b8">Storage tank</text>
    </svg>
  );
}
