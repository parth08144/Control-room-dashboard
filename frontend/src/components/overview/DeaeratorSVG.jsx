import React, { useId } from 'react';

export default function DeaeratorSVG({ width = 120, height = 80, running = true }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`da-bg-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <filter id={`da-glow-${id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id={`da-steam-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <style>{`
          @keyframes daBubble${id} {
            0% { transform: translateY(0) scale(1); opacity: 0.7; }
            100% { transform: translateY(-18px) scale(1.4); opacity: 0; }
          }
          @keyframes daSpray${id} {
            0% { transform: translateY(0) scaleX(1); opacity: 0.6; }
            50% { transform: translateY(6px) scaleX(1.2); opacity: 0.25; }
            100% { transform: translateY(12px) scaleX(0.5); opacity: 0; }
          }
          @keyframes daWisp${id} {
            0% { transform: translateY(0) scale(1); opacity: 0.6; }
            50% { transform: translateY(-10px) scale(1.3); opacity: 0.3; }
            100% { transform: translateY(-20px) scale(1.6); opacity: 0; }
          }
          @keyframes daPulse${id} {
            0%, 100% { opacity: 0.25; }
            50% { opacity: 0.6; }
          }
        `}</style>
      </defs>

      {/* Active glow rim */}
      {running && (
        <path d={`M 18 ${height*0.4} Q 18 -2 ${width/2} -2 Q ${width-18} -2 ${width-18} ${height*0.4} L ${width+2} ${height*0.4} L ${width+2} ${height+2} L -2 ${height+2} L -2 ${height*0.4} Z`} fill="none" stroke="#38bdf8" strokeWidth={2} filter={`url(#da-glow-${id})`} style={{ animation: `daPulse${id} 2.5s ease-in-out infinite` }} />
      )}

      {/* Deaerator dome (cloud-like or rounded top) */}
      <path d={`M 20 ${height*0.4} Q 20 0 ${width/2} 0 Q ${width-20} 0 ${width-20} ${height*0.4} Z`} fill={`url(#da-bg-${id})`} stroke={running ? '#0ea5e9' : '#475569'} strokeWidth={2} filter="url(#drop-shadow)" />
      
      {/* Storage Tank */}
      <rect x={0} y={height * 0.4} width={width} height={height * 0.6} rx={8} fill={`url(#da-bg-${id})`} stroke={running ? '#0ea5e9' : '#475569'} strokeWidth={2} filter="url(#drop-shadow)" />
      
      {/* Spray nozzle jets when running */}
      {running && (
        <g>
          {[0,1,2,3].map(i => (
            <line key={`spray-${i}`} x1={25 + i*22} y1={height*0.25} x2={25 + i*22} y2={height*0.45} stroke="#bae6fd" strokeWidth={1.5} strokeLinecap="round" strokeDasharray="2 2" style={{ animation: `daSpray${id} ${0.4 + i*0.08}s ease-in infinite ${i*0.12}s` }} />
          ))}
        </g>
      )}
      
      {/* Water level in storage tank */}
      <rect x={2} y={height * 0.6} width={width - 4} height={height * 0.4 - 2} rx={6} fill="rgba(56, 189, 248, 0.4)" />
      
      {/* Water surface wave */}
      {running && (
        <path d={`M 2 ${height*0.6} Q ${width*0.25} ${height*0.57} ${width/2} ${height*0.6} Q ${width*0.75} ${height*0.63} ${width-2} ${height*0.6}`} fill="none" stroke="#7dd3fc" strokeWidth={1} opacity={0.7}>
          <animate attributeName="d" values={`M 2 ${height*0.6} Q ${width*0.25} ${height*0.57} ${width/2} ${height*0.6} Q ${width*0.75} ${height*0.63} ${width-2} ${height*0.6};M 2 ${height*0.6} Q ${width*0.25} ${height*0.63} ${width/2} ${height*0.6} Q ${width*0.75} ${height*0.57} ${width-2} ${height*0.6};M 2 ${height*0.6} Q ${width*0.25} ${height*0.57} ${width/2} ${height*0.6} Q ${width*0.75} ${height*0.63} ${width-2} ${height*0.6}`} dur="2s" repeatCount="indefinite" />
        </path>
      )}
      
      {/* Rising bubbles */}
      {running && (
        <g>
          {[0,1,2,3,4,5].map(i => (
            <circle key={`bub-${i}`} cx={15 + i*18} cy={height*0.75} r={1.5 + (i%3)} fill="#bae6fd" style={{ animation: `daBubble${id} ${0.6 + (i%3)*0.2}s infinite ease-in ${(i%4)*0.12}s`, opacity: 0 }} />
          ))}
        </g>
      )}
      
      {/* Steam vent from dome top */}
      {running && (
        <g>
          {[0,1].map(i => (
            <ellipse key={`vent-${i}`} cx={width/2 - 10 + i*20} cy={-5} rx={5 + i*2} ry={3} fill="#bae6fd" filter={`url(#da-steam-${id})`} style={{ animation: `daWisp${id} ${0.9 + i*0.3}s ease-in-out infinite ${i*0.3}s`, opacity: 0 }} />
          ))}
        </g>
      )}
      
      {/* Labels */}
      <text x={width / 2} y={height * 0.3} textAnchor="middle" fontSize={10} fontFamily="'Exo 2'" fontWeight="600" fill={running ? '#38bdf8' : '#7db8d4'}>De-aerator</text>
      <text x={width / 2} y={height * 0.8} textAnchor="middle" fontSize={9} fontFamily="'Exo 2'" fill="#94a3b8">Storage tank</text>
    </svg>
  );
}
