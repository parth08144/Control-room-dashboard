import React from 'react';
import usePlantStore from '../../hooks/usePlantStore';

const AnimatedPipe = ({ d, color, dashColor, width = 6, speed = 1, reverse = false }) => {
  const dashLen = 15;
  const gapLen = 15;
  const dir = reverse ? 'reverse' : 'normal';
  return (
    <g>
      {/* Shadow */}
      <path d={d} stroke="rgba(0,0,0,0.6)" strokeWidth={width + 6} strokeLinecap="round" strokeLinejoin="round" fill="none" filter="url(#drop-shadow)" />
      {/* Base metal */}
      <path d={d} stroke="#0f172a" strokeWidth={width + 2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Highlight edge */}
      <path d={d} stroke="#475569" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Core fluid glow tint */}
      <path d={d} stroke={color} strokeWidth={width * 0.8} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.3} />
      {/* Animated pulses */}
      <path d={d} stroke={dashColor} strokeWidth={width * 0.5} strokeLinecap="round" strokeLinejoin="round" fill="none" strokeDasharray={`${dashLen} ${gapLen}`} filter="url(#pipe-glow)" style={{ animation: `pipeFlow ${speed}s linear infinite ${dir}` }} opacity={0.9} />
    </g>
  );
};

export default function PlantDiagram() {
  const state = usePlantStore(s => s.plantState);
  const setActiveView = usePlantStore(s => s.setActiveView);

  // SVG dimensions
  const W = 1300;
  const H = 900;

  // Component coordinates
  const BOILER = { x: 50, y: 150, w: 140, h: 220 };
  const HPT = { x: 300, y: 140, w: 80, h: 100 };
  const RHT = { x: 420, y: 120, w: 120, h: 140 };
  const LPT1 = { x: 580, y: 100, w: 160, h: 180 };
  const LPT2 = { x: 780, y: 100, w: 160, h: 180 };
  const SHAFT_Y = 190;
  const GEN = { x: 1000, y: 160, w: 160, h: 60 };
  
  const COND = { x: 650, y: 380, w: 260, h: 140 };
  const CPUMP = { x: 780, y: 580, r: 25 };
  
  const HTR1 = { x: 1100, y: 500, w: 60, h: 80 };
  const HTR2 = { x: 920, y: 720, w: 80, h: 60 };
  const HTR3 = { x: 760, y: 720, w: 80, h: 60 };
  const HTR4 = { x: 600, y: 720, w: 80, h: 60 };
  const DEAERATOR = { x: 350, y: 700, w: 160, h: 100 };
  
  const FPUMP = { x: 150, y: 750, r: 35 };
  const FPT = { x: 300, y: 550, w: 60, h: 60 };
  
  const HTR6 = { x: 60, y: 600, w: 60, h: 80 };
  const HTR7 = { x: 60, y: 480, w: 60, h: 80 };
  const HTR8 = { x: 60, y: 360, w: 60, h: 80 };

  const running = state?.turbine?.running || true;
  const firing_rate = state?.boiler?.firing_rate ?? 80;

  // Fluid colours
  const C_STEAM = { c: '#0ea5e9', d: '#bae6fd' };
  const C_REHEAT = { c: '#ef4444', d: '#fca5a5' };
  const C_EXTRACT = { c: '#f43f5e', d: '#fda4af' };
  const C_WATER = { c: '#0284c7', d: '#38bdf8' };
  const C_COND = { c: '#64748b', d: '#94a3b8' };
  const C_COLD = { c: '#334155', d: '#475569' };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', background: '#020617' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100%', maxHeight: 'calc(100vh - 120px)' }} preserveAspectRatio="xMidYMid meet">
        <defs>
          <style>{`
            @keyframes pipeFlow {
              from { stroke-dashoffset: 0; }
              to { stroke-dashoffset: 30; }
            }
            @keyframes turbineSpin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
          
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={1} />
          </pattern>
          
          <linearGradient id="metal-base" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="15%" stopColor="#475569" />
            <stop offset="50%" stopColor="#334155" />
            <stop offset="85%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          
          <linearGradient id="heater-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          
          <radialGradient id="boiler-fire" cx="50%" cy="80%" r="60%">
            <stop offset="0%" stopColor="#ffea00" />
            <stop offset="30%" stopColor="#ff5500" />
            <stop offset="70%" stopColor="#aa0000" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          
          <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="5" dy="15" stdDeviation="12" floodColor="#000000" floodOpacity="0.8" />
          </filter>
          
          <filter id="pipe-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>

          <filter id="fire-warp">
            <feTurbulence type="turbulence" baseFrequency="0.02 0.05" numOctaves="3" seed="2">
              <animate attributeName="baseFrequency" values="0.02 0.05; 0.03 0.07; 0.02 0.05" dur="3s" repeatCount="indefinite"/>
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" scale="15" xChannelSelector="R" yChannelSelector="G" />
            <feGaussianBlur stdDeviation="1" />
          </filter>
        </defs>

        <rect width={W} height={H} fill="url(#grid)" />

        {/* --- ANIMATED PIPES --- */}
        <AnimatedPipe d={`M ${BOILER.x + BOILER.w/2} ${BOILER.y} L ${BOILER.x + BOILER.w/2} 80 L 260 80 L 260 140 L ${HPT.x} 140`} color={C_STEAM.c} dashColor={C_STEAM.d} width={6} speed={0.5} />
        <AnimatedPipe d={`M ${HPT.x + HPT.w/2} ${HPT.y + HPT.h} L ${HPT.x + HPT.w/2} 280 L ${BOILER.x + BOILER.w} 280`} color={C_REHEAT.c} dashColor={C_REHEAT.d} width={5} speed={0.6} />
        <AnimatedPipe d={`M ${BOILER.x + BOILER.w} 230 L ${RHT.x} 230 L ${RHT.x} 140`} color={C_REHEAT.c} dashColor={C_REHEAT.d} width={6} speed={0.5} />
        <AnimatedPipe d={`M ${RHT.x + RHT.w} 190 L ${LPT1.x} 190`} color={C_STEAM.c} dashColor={C_STEAM.d} width={8} speed={0.4} />
        <AnimatedPipe d={`M ${LPT1.x + LPT1.w} 190 L ${LPT2.x} 190`} color={C_STEAM.c} dashColor={C_STEAM.d} width={8} speed={0.4} />
        <AnimatedPipe d={`M ${LPT1.x + LPT1.w/2} ${LPT1.y + LPT1.h} L ${LPT1.x + LPT1.w/2} ${COND.y}`} color={C_COLD.c} dashColor={C_COLD.d} width={15} speed={1.2} />
        <AnimatedPipe d={`M ${LPT2.x + LPT2.w/2} ${LPT2.y + LPT2.h} L ${LPT2.x + LPT2.w/2} ${COND.y}`} color={C_COLD.c} dashColor={C_COLD.d} width={15} speed={1.2} />
        <AnimatedPipe d={`M ${COND.x + 100} ${COND.y + COND.h} L ${CPUMP.x} ${CPUMP.y - CPUMP.r}`} color={C_WATER.c} dashColor={C_WATER.d} width={5} speed={0.8} />
        <AnimatedPipe d={`M ${CPUMP.x} ${CPUMP.y + CPUMP.r} L ${CPUMP.x} 650 L 1130 650 L 1130 ${HTR1.y + HTR1.h}`} color={C_WATER.c} dashColor={C_WATER.d} width={5} speed={0.8} reverse />
        <AnimatedPipe d={`M 1100 540 L 960 540 L 960 ${HTR2.y}`} color={C_WATER.c} dashColor={C_WATER.d} width={5} speed={0.8} reverse />
        <AnimatedPipe d={`M 920 750 L 840 750`} color={C_WATER.c} dashColor={C_WATER.d} width={5} speed={0.8} reverse />
        <AnimatedPipe d={`M 760 750 L 680 750`} color={C_WATER.c} dashColor={C_WATER.d} width={5} speed={0.8} reverse />
        <AnimatedPipe d={`M 600 750 L 510 750`} color={C_WATER.c} dashColor={C_WATER.d} width={5} speed={0.8} reverse />
        <AnimatedPipe d={`M ${DEAERATOR.x + 50} ${DEAERATOR.y + DEAERATOR.h} L ${DEAERATOR.x + 50} 850 L ${FPUMP.x} 850 L ${FPUMP.x} ${FPUMP.y + FPUMP.r}`} color={C_WATER.c} dashColor={C_WATER.d} width={6} speed={0.6} reverse />
        <AnimatedPipe d={`M ${FPUMP.x} ${FPUMP.y - FPUMP.r} L ${FPUMP.x} 640 L ${HTR6.x + HTR6.w} 640`} color={C_WATER.c} dashColor={C_WATER.d} width={6} speed={0.5} reverse />
        <AnimatedPipe d={`M ${HTR6.x + HTR6.w/2} ${HTR6.y} L ${HTR7.x + HTR7.w/2} ${HTR7.y + HTR7.h}`} color={C_WATER.c} dashColor={C_WATER.d} width={6} speed={0.5} reverse />
        <AnimatedPipe d={`M ${HTR7.x + HTR7.w/2} ${HTR7.y} L ${HTR8.x + HTR8.w/2} ${HTR8.y + HTR8.h}`} color={C_WATER.c} dashColor={C_WATER.d} width={6} speed={0.5} reverse />
        <AnimatedPipe d={`M ${HTR8.x + HTR8.w/2} ${HTR8.y} L ${BOILER.x + BOILER.w/2} ${BOILER.y + BOILER.h}`} color={C_WATER.c} dashColor={C_WATER.d} width={6} speed={0.5} reverse />
        <AnimatedPipe d={`M ${HPT.x + HPT.w/2} 280 L 150 280 L 150 400 L ${HTR8.x + HTR8.w} 400`} color={C_EXTRACT.c} dashColor={C_EXTRACT.d} width={4} speed={0.5} reverse />
        <AnimatedPipe d={`M ${RHT.x + 30} ${RHT.y + RHT.h} L ${RHT.x + 30} 520 L ${HTR7.x + HTR7.w} 520`} color={C_EXTRACT.c} dashColor={C_EXTRACT.d} width={4} speed={0.6} reverse />
        <AnimatedPipe d={`M ${RHT.x + 80} ${RHT.y + RHT.h} L ${RHT.x + 80} 640 L ${HTR6.x + HTR6.w} 640`} color={C_EXTRACT.c} dashColor={C_EXTRACT.d} width={4} speed={0.6} reverse />
        <AnimatedPipe d={`M ${RHT.x + 110} ${RHT.y + RHT.h} L ${RHT.x + 110} 580 L ${FPT.x + FPT.w} 580`} color={C_EXTRACT.c} dashColor={C_EXTRACT.d} width={4} speed={0.6} reverse />
        <AnimatedPipe d={`M ${LPT1.x + 30} ${LPT1.y + LPT1.h} L ${LPT1.x + 30} 680 L ${DEAERATOR.x + 100} 680 L ${DEAERATOR.x + 100} ${DEAERATOR.y}`} color={C_EXTRACT.c} dashColor={C_EXTRACT.d} width={4} speed={0.7} reverse />
        <AnimatedPipe d={`M ${LPT1.x + 100} ${LPT1.y + LPT1.h} L ${LPT1.x + 100} 720 L ${HTR4.x + HTR4.w/2} 720`} color={C_EXTRACT.c} dashColor={C_EXTRACT.d} width={4} speed={0.7} reverse />
        <AnimatedPipe d={`M ${LPT2.x + 30} ${LPT2.y + LPT2.h} L ${LPT2.x + 30} 700 L ${HTR3.x + 40} 700 L ${HTR3.x + 40} 720`} color={C_EXTRACT.c} dashColor={C_EXTRACT.d} width={4} speed={0.7} reverse />
        <AnimatedPipe d={`M ${LPT2.x + 80} ${LPT2.y + LPT2.h} L ${LPT2.x + 80} 680 L ${HTR2.x + 40} 680 L ${HTR2.x + 40} 720`} color={C_EXTRACT.c} dashColor={C_EXTRACT.d} width={4} speed={0.7} reverse />
        <AnimatedPipe d={`M ${LPT2.x + 130} ${LPT2.y + LPT2.h} L ${LPT2.x + 130} 540 L ${HTR1.x} 540`} color={C_EXTRACT.c} dashColor={C_EXTRACT.d} width={4} speed={0.7} reverse />
        <AnimatedPipe d={`M ${HTR8.x} 420 L 30 420 L 30 520 L ${HTR7.x} 520`} color={C_COND.c} dashColor={C_COND.d} width={4} speed={0.9} />
        <AnimatedPipe d={`M ${HTR7.x} 540 L 20 540 L 20 640 L ${HTR6.x} 640`} color={C_COND.c} dashColor={C_COND.d} width={4} speed={0.9} />
        <AnimatedPipe d={`M ${HTR6.x} 660 L 20 660 L 20 710 L ${DEAERATOR.x} 710`} color={C_COND.c} dashColor={C_COND.d} width={4} speed={0.9} />
        <AnimatedPipe d={`M ${HTR1.x + HTR1.w/2} 580 L 1130 580 L 1130 780 L 980 780 L 980 750`} color={C_COND.c} dashColor={C_COND.d} width={4} speed={0.9} reverse />
        <AnimatedPipe d={`M ${HTR2.x + 20} 780 L 820 780 L 820 750`} color={C_COND.c} dashColor={C_COND.d} width={4} speed={0.9} reverse />
        <AnimatedPipe d={`M ${HTR3.x + 20} 780 L 660 780 L 660 750`} color={C_COND.c} dashColor={C_COND.d} width={4} speed={0.9} reverse />
        <AnimatedPipe d={`M ${HTR4.x + 20} 780 L 580 780 L 580 450 L ${COND.x + 260} 450`} color={C_COND.c} dashColor={C_COND.d} width={4} speed={0.9} reverse />
        <AnimatedPipe d={`M ${FPT.x + FPT.w/2} ${FPT.y + FPT.h} L ${FPT.x + FPT.w/2} 650 L ${COND.x} 650`} color={C_COND.c} dashColor={C_COND.d} width={4} speed={0.9} reverse />

        {/* --- EQUIPMENT --- */}

        {/* SHAFT */}
        <line x1={HPT.x} y1={SHAFT_Y} x2={GEN.x + GEN.w} y2={SHAFT_Y} stroke="#cbd5e1" strokeWidth={6} strokeDasharray={running ? "0" : "10 5"} filter="url(#drop-shadow)" />

        {/* BOILER */}
        <g filter="url(#drop-shadow)" style={{ cursor: 'pointer' }} onClick={() => setActiveView('boiler')}>
          <rect x={BOILER.x} y={BOILER.y} width={BOILER.w} height={BOILER.h} rx={16} fill="url(#metal-base)" stroke="#64748b" strokeWidth={3} />
          {/* Furnace Window & Animated Fire */}
          <rect x={BOILER.x + 20} y={BOILER.y + 100} width={BOILER.w - 40} height={100} rx={8} fill="#020617" />
          <g clipPath="url(#boiler-clip)">
            <clipPath id="boiler-clip">
              <rect x={BOILER.x + 20} y={BOILER.y + 100} width={BOILER.w - 40} height={100} rx={8} />
            </clipPath>
            <circle cx={BOILER.x + BOILER.w/2} cy={BOILER.y + 200} r={65} fill="url(#boiler-fire)" filter="url(#fire-warp)" style={{ opacity: firing_rate / 100 }} />
          </g>
          {/* Glowing Reheat Coil */}
          <path d={`M ${BOILER.x + BOILER.w} 280 L ${BOILER.x + 60} 280 Q ${BOILER.x + 40} 280 ${BOILER.x + 40} 260 Q ${BOILER.x + 40} 240 ${BOILER.x + 80} 240 Q ${BOILER.x + 100} 240 ${BOILER.x + 100} 220 Q ${BOILER.x + 100} 200 ${BOILER.x + 60} 200 L ${BOILER.x + BOILER.w} 200`} fill="none" stroke="#f43f5e" strokeWidth={6} strokeLinecap="round" filter="url(#pipe-glow)" />
          <path d={`M ${BOILER.x + BOILER.w} 280 L ${BOILER.x + 60} 280 Q ${BOILER.x + 40} 280 ${BOILER.x + 40} 260 Q ${BOILER.x + 40} 240 ${BOILER.x + 80} 240 Q ${BOILER.x + 100} 240 ${BOILER.x + 100} 220 Q ${BOILER.x + 100} 200 ${BOILER.x + 60} 200 L ${BOILER.x + BOILER.w} 200`} fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" opacity={0.6} />
          <text x={BOILER.x + BOILER.w/2} y={BOILER.y - 15} textAnchor="middle" fontSize={14} fontFamily="'Exo 2'" fill="#7db8d4" fontWeight="bold">Steam Generator</text>
        </g>

        {/* TURBINES */}
        <g filter="url(#drop-shadow)" style={{ cursor: 'pointer' }} onClick={() => setActiveView('turbine')}>
          {/* Inner Blade Function */}
          {(() => {
            const Rotor = ({ tx, ty, r }) => (
              <g style={{ transformOrigin: `${tx}px ${ty}px`, animation: running ? `turbineSpin 0.3s linear infinite` : 'none' }}>
                {[0, 60, 120, 180, 240, 300].map(angle => (
                  <path key={angle} d={`M ${tx} ${ty} L ${tx + r} ${ty - r*0.3} Q ${tx + r*1.2} ${ty} ${tx + r} ${ty + r*0.3} Z`} fill="#94a3b8" opacity={0.8} transform={`rotate(${angle} ${tx} ${ty})`} />
                ))}
                <circle cx={tx} cy={ty} r={r*0.3} fill="#1e293b" />
              </g>
            );
            return (
              <>
                <polygon points={`${HPT.x},${HPT.y + HPT.h*0.2} ${HPT.x + HPT.w},${HPT.y} ${HPT.x + HPT.w},${HPT.y + HPT.h} ${HPT.x},${HPT.y + HPT.h*0.8}`} fill="url(#metal-base)" stroke="#94a3b8" strokeWidth={2} />
                <circle cx={HPT.x + HPT.w/2} cy={HPT.y + HPT.h/2} r={HPT.h*0.35} fill="#020617" />
                <Rotor tx={HPT.x + HPT.w/2} ty={HPT.y + HPT.h/2} r={HPT.h*0.3} />
                <text x={HPT.x + HPT.w/2} y={HPT.y + HPT.h/2 + 55} textAnchor="middle" fontSize={14} fontFamily="'Exo 2'" fill="#e2e8f0" fontWeight="bold">HP</text>

                <polygon points={`${RHT.x},${RHT.y + RHT.h*0.2} ${RHT.x + RHT.w},${RHT.y} ${RHT.x + RHT.w},${RHT.y + RHT.h} ${RHT.x},${RHT.y + RHT.h*0.8}`} fill="url(#metal-base)" stroke="#94a3b8" strokeWidth={2} />
                <circle cx={RHT.x + RHT.w/2} cy={RHT.y + RHT.h/2} r={RHT.h*0.35} fill="#020617" />
                <Rotor tx={RHT.x + RHT.w/2} ty={RHT.y + RHT.h/2} r={RHT.h*0.3} />
                <text x={RHT.x + RHT.w/2} y={RHT.y + RHT.h/2 + 75} textAnchor="middle" fontSize={12} fontFamily="'Exo 2'" fill="#e2e8f0" fontWeight="bold">Reheat</text>
                
                <polygon points={`${LPT1.x},${LPT1.y + LPT1.h/2} ${LPT1.x + LPT1.w/2},${LPT1.y} ${LPT1.x + LPT1.w},${LPT1.y + LPT1.h/2} ${LPT1.x + LPT1.w},${LPT1.y + LPT1.h} ${LPT1.x},${LPT1.y + LPT1.h}`} fill="url(#metal-base)" stroke="#94a3b8" strokeWidth={2} />
                <circle cx={LPT1.x + LPT1.w/2} cy={LPT1.y + LPT1.h/2} r={LPT1.h*0.35} fill="#020617" />
                <Rotor tx={LPT1.x + LPT1.w/2} ty={LPT1.y + LPT1.h/2} r={LPT1.h*0.3} />
                <text x={LPT1.x + LPT1.w/2} y={LPT1.y + LPT1.h/2 + 95} textAnchor="middle" fontSize={14} fontFamily="'Exo 2'" fill="#e2e8f0" fontWeight="bold">LP Turbines</text>

                <polygon points={`${LPT2.x},${LPT2.y + LPT2.h/2} ${LPT2.x + LPT2.w/2},${LPT2.y} ${LPT2.x + LPT2.w},${LPT2.y + LPT2.h/2} ${LPT2.x + LPT2.w},${LPT2.y + LPT2.h} ${LPT2.x},${LPT2.y + LPT2.h}`} fill="url(#metal-base)" stroke="#94a3b8" strokeWidth={2} />
                <circle cx={LPT2.x + LPT2.w/2} cy={LPT2.y + LPT2.h/2} r={LPT2.h*0.35} fill="#020617" />
                <Rotor tx={LPT2.x + LPT2.w/2} ty={LPT2.y + LPT2.h/2} r={LPT2.h*0.3} />
                <text x={LPT2.x + LPT2.w/2} y={LPT2.y + LPT2.h/2 + 95} textAnchor="middle" fontSize={14} fontFamily="'Exo 2'" fill="#e2e8f0" fontWeight="bold">LP Turbines</text>
              </>
            );
          })()}
        </g>

        {/* GENERATOR */}
        <g filter="url(#drop-shadow)" style={{ cursor: 'pointer' }} onClick={() => setActiveView('generator')}>
          <rect x={GEN.x} y={GEN.y} width={GEN.w} height={GEN.h} rx={8} fill="url(#metal-base)" stroke={running ? "#38bdf8" : "#475569"} strokeWidth={3} />
          {running && <rect x={GEN.x} y={GEN.y} width={GEN.w} height={GEN.h} rx={8} fill="none" stroke="#38bdf8" strokeWidth={6} filter="url(#pipe-glow)" opacity={0.6} />}
          <text x={GEN.x + GEN.w/2} y={GEN.y + GEN.h/2 + 5} textAnchor="middle" fontSize={14} fontFamily="'Exo 2'" fill={running ? "#38bdf8" : "#94a3b8"} fontWeight="bold">Shaft Work Output</text>
        </g>

        {/* CONDENSER */}
        <g filter="url(#drop-shadow)">
          <rect x={COND.x} y={COND.y} width={COND.w} height={COND.h} rx={16} fill="url(#metal-base)" stroke="#64748b" strokeWidth={3} />
          {/* Glowing Cooling water coil */}
          <path d={`M ${COND.x + COND.w} ${COND.y + 40} L ${COND.x + 40} ${COND.y + 40} Q ${COND.x + 20} ${COND.y + 40} ${COND.x + 20} ${COND.y + 60} Q ${COND.x + 20} ${COND.y + 80} ${COND.x + 40} ${COND.y + 80} L ${COND.x + 220} ${COND.y + 80} Q ${COND.x + 240} ${COND.y + 80} ${COND.x + 240} ${COND.y + 100} Q ${COND.x + 240} ${COND.y + 120} ${COND.x + 220} ${COND.y + 120} L ${COND.x + COND.w} ${COND.y + 120}`} fill="none" stroke="#38bdf8" strokeWidth={6} filter="url(#pipe-glow)" opacity={0.8} />
          <path d={`M ${COND.x + COND.w} ${COND.y + 40} L ${COND.x + 40} ${COND.y + 40} Q ${COND.x + 20} ${COND.y + 40} ${COND.x + 20} ${COND.y + 60} Q ${COND.x + 20} ${COND.y + 80} ${COND.x + 40} ${COND.y + 80} L ${COND.x + 220} ${COND.y + 80} Q ${COND.x + 240} ${COND.y + 80} ${COND.x + 240} ${COND.y + 100} Q ${COND.x + 240} ${COND.y + 120} ${COND.x + 220} ${COND.y + 120} L ${COND.x + COND.w} ${COND.y + 120}`} fill="none" stroke="#bae6fd" strokeWidth={2} />
          {/* Hotwell water */}
          <rect x={COND.x + 2} y={COND.y + COND.h - 30} width={COND.w - 4} height={28} rx={14} fill="rgba(56, 189, 248, 0.4)" />
          <text x={COND.x + COND.w/2} y={COND.y + 20} textAnchor="middle" fontSize={14} fontFamily="'Exo 2'" fill="#7db8d4" fontWeight="bold">Condenser</text>
        </g>

        {/* PUMPS */}
        <g filter="url(#drop-shadow)">
          {/* Condensate Pump */}
          <circle cx={CPUMP.x} cy={CPUMP.y} r={CPUMP.r} fill="url(#metal-base)" stroke="#94a3b8" strokeWidth={2} />
          <g style={{ transformOrigin: `${CPUMP.x}px ${CPUMP.y}px`, animation: running ? `turbineSpin 1s linear infinite` : 'none' }}>
            <polygon points={`${CPUMP.x - 10},${CPUMP.y - 10} ${CPUMP.x + 10},${CPUMP.y} ${CPUMP.x - 10},${CPUMP.y + 10}`} fill="#cbd5e1" />
          </g>
          <text x={CPUMP.x} y={CPUMP.y + CPUMP.r + 15} textAnchor="middle" fontSize={11} fontFamily="'Exo 2'" fill="#94a3b8">Condensate Pump</text>
          
          {/* Feedwater Pump */}
          <circle cx={FPUMP.x} cy={FPUMP.y} r={FPUMP.r} fill="url(#metal-base)" stroke="#94a3b8" strokeWidth={2} />
          <g style={{ transformOrigin: `${FPUMP.x}px ${FPUMP.y}px`, animation: running ? `turbineSpin 0.6s linear infinite` : 'none' }}>
            <polygon points={`${FPUMP.x - 15},${FPUMP.y - 15} ${FPUMP.x + 15},${FPUMP.y} ${FPUMP.x - 15},${FPUMP.y + 15}`} fill="#cbd5e1" />
          </g>
          <text x={FPUMP.x} y={FPUMP.y + FPUMP.r + 15} textAnchor="middle" fontSize={12} fontFamily="'Exo 2'" fill="#94a3b8">Feedwater Pump</text>
          
          {/* FPT */}
          <polygon points={`${FPT.x},${FPT.y + FPT.h*0.2} ${FPT.x + FPT.w},${FPT.y} ${FPT.x + FPT.w},${FPT.y + FPT.h} ${FPT.x},${FPT.y + FPT.h*0.8}`} fill="url(#metal-base)" stroke="#94a3b8" strokeWidth={2} />
          <text x={FPT.x + FPT.w/2} y={FPT.y + FPT.h/2 + 5} textAnchor="middle" fontSize={12} fontFamily="'Exo 2'" fill="#e2e8f0" fontWeight="bold">FPT</text>
          <line x1={FPT.x} y1={FPT.y + FPT.h/2} x2={FPUMP.x} y2={FPUMP.y} stroke="#cbd5e1" strokeWidth={4} strokeDasharray="5 3" />
        </g>

        {/* HEATERS */}
        <g filter="url(#drop-shadow)">
          {[ {h: HTR1, l: 'Htr 1'}, {h: HTR2, l: 'Htr 2'}, {h: HTR3, l: 'Htr 3'}, {h: HTR4, l: 'Htr 4'} ].map((htr, i) => (
            <g key={i}>
              <rect x={htr.h.x} y={htr.h.y} width={htr.h.w} height={htr.h.h} rx={6} fill="url(#heater-bg)" stroke="#64748b" strokeWidth={2} />
              <rect x={htr.h.x+2} y={htr.h.y+htr.h.h*0.6} width={htr.h.w-4} height={htr.h.h*0.4-2} rx={4} fill="rgba(56, 189, 248, 0.3)" />
              {/* Internal glowing coils */}
              <path d={`M ${htr.h.x + 10} ${htr.h.y + htr.h.h} L ${htr.h.x + 10} ${htr.h.y + 20} Q ${htr.h.x + htr.h.w/2} ${htr.h.y + 10} ${htr.h.x + htr.h.w - 10} ${htr.h.y + 30} Q ${htr.h.x + htr.h.w/2} ${htr.h.y + htr.h.h/2} ${htr.h.x + htr.h.w - 10} ${htr.h.y + htr.h.h - 10}`} fill="none" stroke="#bae6fd" strokeWidth={2} opacity={0.5} />
              <text x={htr.h.x + htr.h.w/2} y={htr.h.y + htr.h.h + 15} textAnchor="middle" fontSize={11} fill="#7db8d4" fontWeight="600">{htr.l}</text>
            </g>
          ))}

          {[ {h: HTR6, l: 'Htr 6'}, {h: HTR7, l: 'Htr 7'}, {h: HTR8, l: 'Htr 8'} ].map((htr, i) => (
            <g key={i}>
              <rect x={htr.h.x} y={htr.h.y} width={htr.h.w} height={htr.h.h} rx={6} fill="url(#heater-bg)" stroke="#64748b" strokeWidth={2} />
              <rect x={htr.h.x+2} y={htr.h.y+htr.h.h*0.7} width={htr.h.w-4} height={htr.h.h*0.3-2} rx={4} fill="rgba(56, 189, 248, 0.3)" />
              <path d={`M ${htr.h.x + 10} ${htr.h.y + htr.h.h} L ${htr.h.x + 10} ${htr.h.y + 20} Q ${htr.h.x + htr.h.w/2} ${htr.h.y + 10} ${htr.h.x + htr.h.w - 10} ${htr.h.y + 30} Q ${htr.h.x + htr.h.w/2} ${htr.h.y + htr.h.h/2} ${htr.h.x + htr.h.w - 10} ${htr.h.y + htr.h.h - 10}`} fill="none" stroke="#bae6fd" strokeWidth={2} opacity={0.5} />
              <text x={htr.h.x + htr.h.w/2} y={htr.h.y + htr.h.h + 15} textAnchor="middle" fontSize={11} fill="#7db8d4" fontWeight="600">{htr.l}</text>
            </g>
          ))}
          
          {/* Deaerator */}
          <path d={`M ${DEAERATOR.x + 20} ${DEAERATOR.y + 40} Q ${DEAERATOR.x + 20} ${DEAERATOR.y} ${DEAERATOR.x + DEAERATOR.w/2} ${DEAERATOR.y} Q ${DEAERATOR.x + DEAERATOR.w - 20} ${DEAERATOR.y} ${DEAERATOR.x + DEAERATOR.w - 20} ${DEAERATOR.y + 40} Z`} fill="url(#heater-bg)" stroke="#64748b" strokeWidth={2} />
          <rect x={DEAERATOR.x} y={DEAERATOR.y + 40} width={DEAERATOR.w} height={DEAERATOR.h - 40} rx={8} fill="url(#heater-bg)" stroke="#64748b" strokeWidth={2} />
          <rect x={DEAERATOR.x + 2} y={DEAERATOR.y + 60} width={DEAERATOR.w - 4} height={DEAERATOR.h - 62} rx={6} fill="rgba(56, 189, 248, 0.4)" />
          {/* Water mist / bubbles animation in De-aerator */}
          <circle cx={DEAERATOR.x + 40} cy={DEAERATOR.y + 30} r={4} fill="#bae6fd" opacity={0.6} />
          <circle cx={DEAERATOR.x + 80} cy={DEAERATOR.y + 20} r={3} fill="#bae6fd" opacity={0.4} />
          <circle cx={DEAERATOR.x + 120} cy={DEAERATOR.y + 35} r={5} fill="#bae6fd" opacity={0.7} />
          <text x={DEAERATOR.x + DEAERATOR.w/2} y={DEAERATOR.y + 30} textAnchor="middle" fontSize={12} fill="#7db8d4" fontWeight="bold">De-aerator</text>
        </g>

        {/* --- TEXT LABELS (Thermodynamic States) --- */}
        <g fontSize={11} fontFamily="'Share Tech Mono'" fill="#e2e8f0" style={{ textShadow: '0 0 5px rgba(0,0,0,0.8)' }}>
          <text x={260} y={60}>m = 1234kg/s</text>
          <text x={260} y={75}>25MPa, 550°C</text>
          <circle cx={245} cy={67} r={8} fill="#fff" fillOpacity={0.2} stroke="#fff" />
          <text x={245} y={71} textAnchor="middle" fontSize={10}>1</text>
          
          <text x={310} y={265}>5MPa</text>
          <text x={310} y={280}>300°C</text>
          <circle cx={345} cy={272} r={8} fill="#fff" fillOpacity={0.2} stroke="#fff" />
          <text x={345} y={276} textAnchor="middle" fontSize={10}>2</text>

          <text x={390} y={220}>4.5MPa</text>
          <text x={390} y={235}>550°C</text>
          <circle cx={370} cy={227} r={8} fill="#fff" fillOpacity={0.2} stroke="#fff" />
          <text x={370} y={231} textAnchor="middle" fontSize={10}>3</text>

          <text x={420} y={100}>800kPa, 350°C</text>
          <circle cx={400} cy={95} r={8} fill="#fff" fillOpacity={0.2} stroke="#fff" />
          <text x={400} y={99} textAnchor="middle" fontSize={10}>4</text>

          <text x={1100} y={130}>40 kPa</text>
          <text x={1100} y={145}>x = 0.98</text>

          <text x={650} y={270}>10kPa</text>
          <text x={650} y={285}>x = 0.93</text>
          <circle cx={635} cy={277} r={8} fill="#fff" fillOpacity={0.2} stroke="#fff" />
          <text x={635} y={281} textAnchor="middle" fontSize={10}>5</text>

          <text x={840} y={280}>250kPa</text>

          <text x={680} y={510}>40°C</text>
          <circle cx={710} cy={505} r={8} fill="#fff" fillOpacity={0.2} stroke="#fff" />
          <text x={710} y={509} textAnchor="middle" fontSize={10}>6</text>

          <text x={840} y={590}>800kPa</text>
          <circle cx={820} cy={585} r={8} fill="#fff" fillOpacity={0.2} stroke="#fff" />
          <text x={820} y={589} textAnchor="middle" fontSize={10}>7</text>

          <text x={530} y={690}>800kPa</text>
          <circle cx={510} cy={685} r={8} fill="#fff" fillOpacity={0.2} stroke="#fff" />
          <text x={510} y={689} textAnchor="middle" fontSize={10}>8</text>
          
          <text x={150} y={880}>h9 = hf @ 800kPa</text>
          <circle cx={130} cy={875} r={8} fill="#fff" fillOpacity={0.2} stroke="#fff" />
          <text x={130} y={879} textAnchor="middle" fontSize={10}>9</text>

          <text x={130} y={730}>30MPa</text>
          <circle cx={130} cy={710} r={8} fill="#fff" fillOpacity={0.2} stroke="#fff" />
          <text x={130} y={714} textAnchor="middle" fontSize={10}>10</text>
          
          <text x={140} y={340}>11</text>
          <circle cx={140} cy={336} r={8} fill="#fff" fillOpacity={0.2} stroke="#fff" />

          {/* Extraction labels */}
          <text x={135} y={390} fill="#fda4af">y8</text>
          <text x={200} y={510} fill="#fda4af">y7</text>
          <text x={260} y={630} fill="#fda4af">y6</text>
          <text x={530} y={570} fill="#fda4af">yFPT</text>
          <text x={450} y={670} fill="#fda4af">y5</text>
          <text x={600} y={680} fill="#fda4af">y4</text>
          <text x={750} y={650} fill="#fda4af">y3</text>
          <text x={870} y={600} fill="#fda4af">y2</text>
          <text x={1080} y={530} fill="#fda4af">y1</text>
        </g>
      </svg>
    </div>
  );
}
