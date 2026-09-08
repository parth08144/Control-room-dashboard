import React from 'react';
import usePlantStore from '../../hooks/usePlantStore';

const AnimatedPipe = ({ d, color, dashColor, width = 6, speed = 1, reverse = false }) => {
  const dashLen = 15;
  const gapLen = 15;
  const dir = reverse ? 'reverse' : 'normal';
  return (
    <g>
      {/* 3D Pipe Layers - from shadow/base to specular highlight */}
      <path d={d} stroke="rgba(0,0,0,0.8)" strokeWidth={width + 8} strokeLinecap="round" strokeLinejoin="round" fill="none" filter="url(#drop-shadow)" />
      <path d={d} stroke="#020617" strokeWidth={width + 4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={d} stroke="#1e293b" strokeWidth={width + 2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={d} stroke="#475569" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={d} stroke="#94a3b8" strokeWidth={Math.max(1, width - 3)} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.7} />
      <path d={d} stroke="#f8fafc" strokeWidth={Math.max(1, width - 5)} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.9} />
      
      {/* Core fluid glow tint */}
      <path d={d} stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.4} style={{ mixBlendMode: 'screen' }} />
      {/* Animated fluid pulse */}
      <path d={d} stroke={dashColor} strokeWidth={width * 0.6} strokeLinecap="round" strokeLinejoin="round" fill="none" strokeDasharray={`${dashLen} ${gapLen}`} filter="url(#pipe-glow)" style={{ animation: `pipeFlow ${speed}s linear infinite ${dir}` }} opacity={0.9} />
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
  const BOILER = { x: 50, y: 150, w: 160, h: 260 };
  const HPT = { x: 300, y: 140, w: 80, h: 120 };
  const RHT = { x: 420, y: 110, w: 120, h: 160 };
  const LPT1 = { x: 580, y: 90, w: 160, h: 200 };
  const LPT2 = { x: 780, y: 90, w: 160, h: 200 };
  const SHAFT_Y = 190;
  const GEN = { x: 1000, y: 150, w: 180, h: 80 };
  
  const COND = { x: 650, y: 400, w: 280, h: 140 };
  const CPUMP = { x: 760, y: 610, r: 25 };
  
  const HTR1 = { x: 1100, y: 500, w: 60, h: 100 };
  const HTR2 = { x: 920, y: 720, w: 80, h: 80 };
  const HTR3 = { x: 760, y: 720, w: 80, h: 80 };
  const HTR4 = { x: 600, y: 720, w: 80, h: 80 };
  const DEAERATOR = { x: 350, y: 700, w: 180, h: 100 };
  
  const FPUMP = { x: 140, y: 780, r: 35 };
  const FPT = { x: 300, y: 550, w: 70, h: 80 };
  
  const HTR6 = { x: 60, y: 620, w: 60, h: 100 };
  const HTR7 = { x: 60, y: 500, w: 60, h: 100 };
  const HTR8 = { x: 60, y: 380, w: 60, h: 100 };

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
          <pattern id="ribs" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(90)">
            <line x1="0" y1="0" x2="0" y2="12" stroke="#000" opacity="0.4" strokeWidth="2" />
            <line x1="2" y1="0" x2="2" y2="12" stroke="#fff" opacity="0.1" strokeWidth="1" />
          </pattern>
          <pattern id="heatex-tubes" width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="4" cy="4" r="3" fill="#0f172a" stroke="#b45309" strokeWidth="1" />
          </pattern>

          <linearGradient id="v-cylinder" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="15%" stopColor="#475569" />
            <stop offset="30%" stopColor="#94a3b8" />
            <stop offset="70%" stopColor="#475569" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          <linearGradient id="h-cylinder" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="15%" stopColor="#475569" />
            <stop offset="30%" stopColor="#94a3b8" />
            <stop offset="70%" stopColor="#475569" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          
          <radialGradient id="boiler-fire" cx="50%" cy="80%" r="60%">
            <stop offset="0%" stopColor="#ffea00" />
            <stop offset="30%" stopColor="#ff5500" />
            <stop offset="70%" stopColor="#aa0000" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <radialGradient id="burner-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="40%" stopColor="#facc15" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          
          <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="10" dy="15" stdDeviation="10" floodColor="#000" floodOpacity="0.8" />
          </filter>
          
          <filter id="pipe-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>

          <filter id="fire-warp">
            <feTurbulence type="turbulence" baseFrequency="0.015 0.04" numOctaves="3" seed="5">
              <animate attributeName="baseFrequency" values="0.015 0.04; 0.025 0.06; 0.015 0.04" dur="2s" repeatCount="indefinite"/>
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" scale="25" xChannelSelector="R" yChannelSelector="G" />
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
        </defs>

        <rect width={W} height={H} fill="url(#grid)" />

        {/* --- ANIMATED PIPES --- */}
        {/* Main Steam (1) - From Superheater (Top) to HPT */}
        <AnimatedPipe d={`M ${BOILER.x + BOILER.w/2} ${BOILER.y} L ${BOILER.x + BOILER.w/2} 80 L 260 80 L 260 140 L ${HPT.x} 140`} color={C_STEAM.c} dashColor={C_STEAM.d} width={8} speed={0.4} />
        {/* Cold Reheat (2) - HPT to Boiler (Mid) */}
        <AnimatedPipe d={`M ${HPT.x + HPT.w/2} ${HPT.y + HPT.h} L ${HPT.x + HPT.w/2} 290 L ${BOILER.x + BOILER.w} 290`} color={C_REHEAT.c} dashColor={C_REHEAT.d} width={6} speed={0.5} />
        {/* Hot Reheat (3) - Boiler (High) to RHT */}
        <AnimatedPipe d={`M ${BOILER.x + BOILER.w} 240 L ${RHT.x} 240 L ${RHT.x} 140`} color={C_REHEAT.c} dashColor={C_REHEAT.d} width={8} speed={0.4} />
        
        {/* IP/LP Crossovers */}
        <AnimatedPipe d={`M ${RHT.x + RHT.w} 190 L ${LPT1.x} 190`} color={C_STEAM.c} dashColor={C_STEAM.d} width={10} speed={0.4} />
        <AnimatedPipe d={`M ${LPT1.x + LPT1.w} 190 L ${LPT2.x} 190`} color={C_STEAM.c} dashColor={C_STEAM.d} width={10} speed={0.4} />
        
        {/* LP Exhaust to Condenser */}
        <AnimatedPipe d={`M ${LPT1.x + LPT1.w/2} ${LPT1.y + LPT1.h} L ${LPT1.x + LPT1.w/2} ${COND.y}`} color={C_COLD.c} dashColor={C_COLD.d} width={20} speed={1.2} />
        <AnimatedPipe d={`M ${LPT2.x + LPT2.w/2} ${LPT2.y + LPT2.h} L ${LPT2.x + LPT2.w/2} ${COND.y}`} color={C_COLD.c} dashColor={C_COLD.d} width={20} speed={1.2} />
        
        {/* Condensate to CPUMP */}
        <AnimatedPipe d={`M ${COND.x + 100} ${COND.y + COND.h} L ${COND.x + 100} 610 L ${CPUMP.x - CPUMP.r} 610`} color={C_WATER.c} dashColor={C_WATER.d} width={6} speed={0.8} />
        {/* CPUMP to LP Heaters */}
        <AnimatedPipe d={`M ${CPUMP.x} ${CPUMP.y + CPUMP.r} L ${CPUMP.x} 660 L 1130 660 L 1130 ${HTR1.y + HTR1.h}`} color={C_WATER.c} dashColor={C_WATER.d} width={6} speed={0.8} reverse />
        <AnimatedPipe d={`M 1100 550 L 960 550 L 960 ${HTR2.y}`} color={C_WATER.c} dashColor={C_WATER.d} width={6} speed={0.8} reverse />
        <AnimatedPipe d={`M 920 760 L 840 760`} color={C_WATER.c} dashColor={C_WATER.d} width={6} speed={0.8} reverse />
        <AnimatedPipe d={`M 760 760 L 680 760`} color={C_WATER.c} dashColor={C_WATER.d} width={6} speed={0.8} reverse />
        <AnimatedPipe d={`M 600 760 L 530 760`} color={C_WATER.c} dashColor={C_WATER.d} width={6} speed={0.8} reverse />
        
        {/* Deaerator to FPUMP to HP Heaters to Boiler */}
        <AnimatedPipe d={`M ${DEAERATOR.x + 90} ${DEAERATOR.y + DEAERATOR.h} L ${DEAERATOR.x + 90} 860 L ${FPUMP.x} 860 L ${FPUMP.x} ${FPUMP.y + FPUMP.r}`} color={C_WATER.c} dashColor={C_WATER.d} width={8} speed={0.6} reverse />
        <AnimatedPipe d={`M ${FPUMP.x} ${FPUMP.y - FPUMP.r} L ${FPUMP.x} 670 L ${HTR6.x + HTR6.w} 670`} color={C_WATER.c} dashColor={C_WATER.d} width={8} speed={0.5} reverse />
        <AnimatedPipe d={`M ${HTR6.x + HTR6.w/2} ${HTR6.y} L ${HTR7.x + HTR7.w/2} ${HTR7.y + HTR7.h}`} color={C_WATER.c} dashColor={C_WATER.d} width={8} speed={0.5} reverse />
        <AnimatedPipe d={`M ${HTR7.x + HTR7.w/2} ${HTR7.y} L ${HTR8.x + HTR8.w/2} ${HTR8.y + HTR8.h}`} color={C_WATER.c} dashColor={C_WATER.d} width={8} speed={0.5} reverse />
        <AnimatedPipe d={`M ${HTR8.x + HTR8.w/2} ${HTR8.y} L ${BOILER.x + BOILER.w/2} ${BOILER.y + BOILER.h}`} color={C_WATER.c} dashColor={C_WATER.d} width={8} speed={0.5} reverse />
        
        {/* Extractions */}
        <AnimatedPipe d={`M ${HPT.x + HPT.w/2} 290 L 150 290 L 150 430 L ${HTR8.x + HTR8.w} 430`} color={C_EXTRACT.c} dashColor={C_EXTRACT.d} width={4} speed={0.5} reverse />
        <AnimatedPipe d={`M ${RHT.x + 30} ${RHT.y + RHT.h} L ${RHT.x + 30} 550 L ${HTR7.x + HTR7.w} 550`} color={C_EXTRACT.c} dashColor={C_EXTRACT.d} width={4} speed={0.6} reverse />
        <AnimatedPipe d={`M ${RHT.x + 80} ${RHT.y + RHT.h} L ${RHT.x + 80} 670 L ${HTR6.x + HTR6.w} 670`} color={C_EXTRACT.c} dashColor={C_EXTRACT.d} width={4} speed={0.6} reverse />
        <AnimatedPipe d={`M ${RHT.x + 110} ${RHT.y + RHT.h} L ${RHT.x + 110} 590 L ${FPT.x + FPT.w} 590`} color={C_EXTRACT.c} dashColor={C_EXTRACT.d} width={4} speed={0.6} reverse />
        <AnimatedPipe d={`M ${LPT1.x + 30} ${LPT1.y + LPT1.h} L ${LPT1.x + 30} 680 L ${DEAERATOR.x + 120} 680 L ${DEAERATOR.x + 120} ${DEAERATOR.y}`} color={C_EXTRACT.c} dashColor={C_EXTRACT.d} width={4} speed={0.7} reverse />
        <AnimatedPipe d={`M ${LPT1.x + 100} ${LPT1.y + LPT1.h} L ${LPT1.x + 100} 730 L ${HTR4.x + HTR4.w/2} 730`} color={C_EXTRACT.c} dashColor={C_EXTRACT.d} width={4} speed={0.7} reverse />
        <AnimatedPipe d={`M ${LPT2.x + 30} ${LPT2.y + LPT2.h} L ${LPT2.x + 30} 700 L ${HTR3.x + 40} 700 L ${HTR3.x + 40} 720`} color={C_EXTRACT.c} dashColor={C_EXTRACT.d} width={4} speed={0.7} reverse />
        <AnimatedPipe d={`M ${LPT2.x + 80} ${LPT2.y + LPT2.h} L ${LPT2.x + 80} 680 L ${HTR2.x + 40} 680 L ${HTR2.x + 40} 720`} color={C_EXTRACT.c} dashColor={C_EXTRACT.d} width={4} speed={0.7} reverse />
        <AnimatedPipe d={`M ${LPT2.x + 130} ${LPT2.y + LPT2.h} L ${LPT2.x + 130} 550 L ${HTR1.x} 550`} color={C_EXTRACT.c} dashColor={C_EXTRACT.d} width={4} speed={0.7} reverse />
        
        {/* Heater Drains */}
        <AnimatedPipe d={`M ${HTR8.x} 450 L 30 450 L 30 550 L ${HTR7.x} 550`} color={C_COND.c} dashColor={C_COND.d} width={4} speed={0.9} />
        <AnimatedPipe d={`M ${HTR7.x} 570 L 20 570 L 20 670 L ${HTR6.x} 670`} color={C_COND.c} dashColor={C_COND.d} width={4} speed={0.9} />
        <AnimatedPipe d={`M ${HTR6.x} 690 L 20 690 L 20 740 L ${DEAERATOR.x} 740`} color={C_COND.c} dashColor={C_COND.d} width={4} speed={0.9} />
        <AnimatedPipe d={`M ${HTR1.x + HTR1.w/2} 600 L 1150 600 L 1150 820 L 960 820 L 960 800`} color={C_COND.c} dashColor={C_COND.d} width={4} speed={0.9} reverse />
        <AnimatedPipe d={`M ${HTR2.x + 40} 800 L 800 800 L 800 770`} color={C_COND.c} dashColor={C_COND.d} width={4} speed={0.9} reverse />
        <AnimatedPipe d={`M ${HTR3.x + 40} 800 L 640 800 L 640 770`} color={C_COND.c} dashColor={C_COND.d} width={4} speed={0.9} reverse />
        <AnimatedPipe d={`M ${HTR4.x + 40} 800 L 580 800 L 580 470 L ${COND.x + 280} 470`} color={C_COND.c} dashColor={C_COND.d} width={4} speed={0.9} reverse />
        
        {/* FPT Exhaust to Condenser */}
        <AnimatedPipe d={`M ${FPT.x + FPT.w/2} ${FPT.y + FPT.h} L ${FPT.x + FPT.w/2} 660 L ${COND.x} 660`} color={C_COND.c} dashColor={C_COND.d} width={6} speed={0.9} reverse />

        {/* --- EQUIPMENT --- */}

        {/* SHAFT */}
        <line x1={HPT.x} y1={SHAFT_Y} x2={GEN.x + GEN.w} y2={SHAFT_Y} stroke="#94a3b8" strokeWidth={12} filter="url(#drop-shadow)" />
        <line x1={HPT.x} y1={SHAFT_Y} x2={GEN.x + GEN.w} y2={SHAFT_Y} stroke="#e2e8f0" strokeWidth={4} strokeDasharray={running ? "0" : "20 10"} />

        {/* BOILER */}
        <g filter="url(#drop-shadow)" style={{ cursor: 'pointer' }} onClick={() => setActiveView('boiler')}>
          {/* Main Boiler Tower */}
          <rect x={BOILER.x} y={BOILER.y} width={BOILER.w} height={BOILER.h} rx={6} fill="url(#v-cylinder)" stroke="#020617" strokeWidth={4} />
          {/* Water wall Ribs */}
          <rect x={BOILER.x} y={BOILER.y} width={BOILER.w} height={BOILER.h} rx={6} fill="url(#ribs)" />
          
          {/* Top Steam Drum */}
          <rect x={BOILER.x - 15} y={BOILER.y - 25} width={BOILER.w + 30} height={50} rx={25} fill="url(#h-cylinder)" stroke="#020617" strokeWidth={3} />
          <rect x={BOILER.x - 15} y={BOILER.y - 25} width={BOILER.w + 30} height={50} rx={25} fill="url(#ribs)" />
          
          {/* Structural Beams */}
          <line x1={BOILER.x - 10} y1={BOILER.y + 50} x2={BOILER.x + BOILER.w + 10} y2={BOILER.y + 50} stroke="#0f172a" strokeWidth={6} />
          <line x1={BOILER.x - 10} y1={BOILER.y + 150} x2={BOILER.x + BOILER.w + 10} y2={BOILER.y + 150} stroke="#0f172a" strokeWidth={6} />

          {/* Furnace Window & Animated Fire */}
          <rect x={BOILER.x + 20} y={BOILER.y + 120} width={BOILER.w - 40} height={120} rx={8} fill="#020617" stroke="#1e293b" strokeWidth={4} />
          <g clipPath="url(#boiler-clip)">
            <clipPath id="boiler-clip">
              <rect x={BOILER.x + 20} y={BOILER.y + 120} width={BOILER.w - 40} height={120} rx={8} />
            </clipPath>
            {/* Base Fire */}
            <circle cx={BOILER.x + BOILER.w/2} cy={BOILER.y + 240} r={85} fill="url(#boiler-fire)" filter="url(#fire-warp)" style={{ opacity: firing_rate / 100 }} />
            {/* Core Bright Fire */}
            <circle cx={BOILER.x + BOILER.w/2} cy={BOILER.y + 240} r={50} fill="url(#burner-glow)" filter="url(#fire-warp)" style={{ opacity: firing_rate / 100 }} />
            {/* Burner Nozzles */}
            <ellipse cx={BOILER.x + 40} cy={BOILER.y + 230} rx={8} ry={15} fill="#020617" />
            <ellipse cx={BOILER.x + BOILER.w - 40} cy={BOILER.y + 230} rx={8} ry={15} fill="#020617" />
          </g>

          {/* Detailed Reheat Coil inside */}
          <path d={`M ${BOILER.x + BOILER.w} 290 L ${BOILER.x + 70} 290 Q ${BOILER.x + 50} 290 ${BOILER.x + 50} 275 Q ${BOILER.x + 50} 260 ${BOILER.x + 90} 260 Q ${BOILER.x + 110} 260 ${BOILER.x + 110} 245 Q ${BOILER.x + 110} 230 ${BOILER.x + 70} 230 L ${BOILER.x + BOILER.w} 230`} fill="none" stroke="#f43f5e" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" filter="url(#pipe-glow)" />
          <path d={`M ${BOILER.x + BOILER.w} 290 L ${BOILER.x + 70} 290 Q ${BOILER.x + 50} 290 ${BOILER.x + 50} 275 Q ${BOILER.x + 50} 260 ${BOILER.x + 90} 260 Q ${BOILER.x + 110} 260 ${BOILER.x + 110} 245 Q ${BOILER.x + 110} 230 ${BOILER.x + 70} 230 L ${BOILER.x + BOILER.w} 230`} fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" opacity={0.6} />
          
          <text x={BOILER.x + BOILER.w/2} y={BOILER.y - 45} textAnchor="middle" fontSize={16} fontFamily="'Exo 2'" fill="#bae6fd" fontWeight="bold">Steam Generator</text>
        </g>

        {/* TURBINES */}
        <g filter="url(#drop-shadow)" style={{ cursor: 'pointer' }} onClick={() => setActiveView('turbine')}>
          {(() => {
            const TurbineShape = ({ x, y, w, h, label, sub }) => (
              <g>
                {/* Main trapezoidal 3D casing */}
                <path d={`M ${x},${y+h*0.2} L ${x+w},${y} L ${x+w},${y+h} L ${x},${y+h*0.8} Z`} fill="url(#v-cylinder)" stroke="#020617" strokeWidth={3} />
                {/* Horizontal Casing Seam */}
                <line x1={x} y1={y+h*0.5} x2={x+w} y2={y+h*0.5} stroke="#020617" strokeWidth={3} />
                <line x1={x} y1={y+h*0.5+3} x2={x+w} y2={y+h*0.5+3} stroke="#94a3b8" strokeWidth={1} />
                {/* Vertical Ribs */}
                <line x1={x+w*0.25} y1={y+h*0.15} x2={x+w*0.25} y2={y+h*0.85} stroke="#020617" strokeWidth={2} />
                <line x1={x+w*0.5} y1={y+h*0.10} x2={x+w*0.5} y2={y+h*0.90} stroke="#020617" strokeWidth={2} />
                <line x1={x+w*0.75} y1={y+h*0.05} x2={x+w*0.75} y2={y+h*0.95} stroke="#020617" strokeWidth={2} />
                
                {/* Cutaway Window */}
                <ellipse cx={x+w/2} cy={y+h/2} rx={w*0.25} ry={h*0.35} fill="#020617" stroke="#334155" strokeWidth={3} />
                {/* Spinning Rotor inside cutaway */}
                <g style={{ transformOrigin: `${x+w/2}px ${y+h/2}px`, animation: running ? `turbineSpin 0.3s linear infinite` : 'none' }}>
                  {[0, 60, 120, 180, 240, 300].map(angle => (
                    <path key={angle} d={`M ${x+w/2} ${y+h/2} L ${x+w/2 + h*0.3} ${y+h/2 - h*0.1} Q ${x+w/2 + h*0.35} ${y+h/2} ${x+w/2 + h*0.3} ${y+h/2 + h*0.1} Z`} fill="url(#h-cylinder)" stroke="#64748b" transform={`rotate(${angle} ${x+w/2} ${y+h/2})`} />
                  ))}
                  <circle cx={x+w/2} cy={y+h/2} r={h*0.1} fill="url(#h-cylinder)" stroke="#020617" strokeWidth={2} />
                </g>
                
                {/* Labels */}
                <text x={x + w/2} y={y - 15} textAnchor="middle" fontSize={16} fontFamily="'Exo 2'" fill="#bae6fd" fontWeight="bold">{label}</text>
                {sub && <text x={x + w/2} y={y - 30} textAnchor="middle" fontSize={12} fontFamily="'Exo 2'" fill="#94a3b8" fontWeight="bold">{sub}</text>}
              </g>
            );
            return (
              <>
                <TurbineShape x={HPT.x} y={HPT.y} w={HPT.w} h={HPT.h} label="HP" />
                <TurbineShape x={RHT.x} y={RHT.y} w={RHT.w} h={RHT.h} label="Reheat" />
                <TurbineShape x={LPT1.x} y={LPT1.y} w={LPT1.w} h={LPT1.h} label="LP Turbine" sub="A & C" />
                <TurbineShape x={LPT2.x} y={LPT2.y} w={LPT2.w} h={LPT2.h} label="LP Turbine" sub="B & D" />
              </>
            );
          })()}
        </g>

        {/* GENERATOR */}
        <g filter="url(#drop-shadow)" style={{ cursor: 'pointer' }} onClick={() => setActiveView('generator')}>
          <rect x={GEN.x} y={GEN.y} width={GEN.w} height={GEN.h} rx={40} fill="url(#h-cylinder)" stroke="#020617" strokeWidth={4} />
          {/* Cooling Fins (Vertical lines on horizontal cylinder) */}
          {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
            <line key={i} x1={GEN.x + i*(GEN.w/13)} y1={GEN.y+2} x2={GEN.x + i*(GEN.w/13)} y2={GEN.y+GEN.h-2} stroke="#020617" strokeWidth={3} />
          ))}
          {/* Active Glow */}
          {running && <rect x={GEN.x} y={GEN.y} width={GEN.w} height={GEN.h} rx={40} fill="none" stroke="#38bdf8" strokeWidth={6} filter="url(#pipe-glow)" opacity={0.6} />}
          <text x={GEN.x + GEN.w/2} y={GEN.y - 15} textAnchor="middle" fontSize={16} fontFamily="'Exo 2'" fill={running ? "#38bdf8" : "#94a3b8"} fontWeight="bold">Generator</text>
        </g>

        {/* CONDENSER */}
        <g filter="url(#drop-shadow)">
          {/* Main Vessel */}
          <rect x={COND.x} y={COND.y} width={COND.w} height={COND.h} rx={COND.h/2} fill="url(#h-cylinder)" stroke="#020617" strokeWidth={4} />
          {/* Water box end caps */}
          <ellipse cx={COND.x} cy={COND.y+COND.h/2} rx={15} ry={COND.h/2} fill="url(#v-cylinder)" stroke="#020617" strokeWidth={3} />
          <ellipse cx={COND.x+COND.w} cy={COND.y+COND.h/2} rx={15} ry={COND.h/2} fill="url(#v-cylinder)" stroke="#020617" strokeWidth={3} />
          
          {/* Cutaway revealing cooling tubes */}
          <rect x={COND.x + 40} y={COND.y + 20} width={COND.w - 80} height={COND.h - 60} rx={10} fill="#020617" stroke="#1e293b" strokeWidth={4} />
          <rect x={COND.x + 40} y={COND.y + 20} width={COND.w - 80} height={COND.h - 60} rx={10} fill="url(#heatex-tubes)" />
          
          {/* Hotwell Level */}
          <path d={`M ${COND.x + 42} ${COND.y + COND.h - 40} L ${COND.x + COND.w - 42} ${COND.y + COND.h - 40} A 10 10 0 0 1 ${COND.x + COND.w - 42} ${COND.y + COND.h - 22} L ${COND.x + 42} ${COND.y + COND.h - 22} A 10 10 0 0 1 ${COND.x + 42} ${COND.y + COND.h - 40}`} fill="rgba(56, 189, 248, 0.5)" />
          
          <text x={COND.x + COND.w/2} y={COND.y - 15} textAnchor="middle" fontSize={16} fontFamily="'Exo 2'" fill="#bae6fd" fontWeight="bold">Condenser</text>
        </g>

        {/* PUMPS */}
        <g filter="url(#drop-shadow)">
          {/* Condensate Pump */}
          <rect x={CPUMP.x + 10} y={CPUMP.y - 15} width={40} height={30} rx={4} fill="url(#h-cylinder)" stroke="#020617" strokeWidth={2} />
          <line x1={CPUMP.x + 15} y1={CPUMP.y - 15} x2={CPUMP.x + 15} y2={CPUMP.y + 15} stroke="#020617" strokeWidth={2} />
          <line x1={CPUMP.x + 25} y1={CPUMP.y - 15} x2={CPUMP.x + 25} y2={CPUMP.y + 15} stroke="#020617" strokeWidth={2} />
          <line x1={CPUMP.x + 35} y1={CPUMP.y - 15} x2={CPUMP.x + 35} y2={CPUMP.y + 15} stroke="#020617" strokeWidth={2} />
          <circle cx={CPUMP.x} cy={CPUMP.y} r={CPUMP.r} fill="url(#v-cylinder)" stroke="#020617" strokeWidth={3} />
          <circle cx={CPUMP.x} cy={CPUMP.y} r={CPUMP.r*0.4} fill="#020617" />
          <path d={`M ${CPUMP.x} ${CPUMP.y - CPUMP.r} L ${CPUMP.x} ${CPUMP.y - CPUMP.r - 15} L ${CPUMP.x + 15} ${CPUMP.y - CPUMP.r - 15} L ${CPUMP.x + 15} ${CPUMP.y - CPUMP.r} Z`} fill="url(#h-cylinder)" stroke="#020617" strokeWidth={2} />
          <text x={CPUMP.x + 20} y={CPUMP.y + CPUMP.r + 20} textAnchor="middle" fontSize={12} fontFamily="'Exo 2'" fill="#94a3b8" fontWeight="bold">Condensate Pump</text>
          
          {/* Feedwater Pump */}
          <rect x={FPUMP.x + 15} y={FPUMP.y - 20} width={60} height={40} rx={6} fill="url(#h-cylinder)" stroke="#020617" strokeWidth={3} />
          <line x1={FPUMP.x + 25} y1={FPUMP.y - 20} x2={FPUMP.x + 25} y2={FPUMP.y + 20} stroke="#020617" strokeWidth={3} />
          <line x1={FPUMP.x + 40} y1={FPUMP.y - 20} x2={FPUMP.x + 40} y2={FPUMP.y + 20} stroke="#020617" strokeWidth={3} />
          <line x1={FPUMP.x + 55} y1={FPUMP.y - 20} x2={FPUMP.x + 55} y2={FPUMP.y + 20} stroke="#020617" strokeWidth={3} />
          <circle cx={FPUMP.x} cy={FPUMP.y} r={FPUMP.r} fill="url(#v-cylinder)" stroke="#020617" strokeWidth={4} />
          <circle cx={FPUMP.x} cy={FPUMP.y} r={FPUMP.r*0.4} fill="#020617" />
          <path d={`M ${FPUMP.x} ${FPUMP.y - FPUMP.r} L ${FPUMP.x} ${FPUMP.y - FPUMP.r - 20} L ${FPUMP.x + 20} ${FPUMP.y - FPUMP.r - 20} L ${FPUMP.x + 20} ${FPUMP.y - FPUMP.r} Z`} fill="url(#h-cylinder)" stroke="#020617" strokeWidth={3} />
          <text x={FPUMP.x + 30} y={FPUMP.y + FPUMP.r + 25} textAnchor="middle" fontSize={14} fontFamily="'Exo 2'" fill="#94a3b8" fontWeight="bold">Feedwater Pump</text>
          
          {/* FPT */}
          <path d={`M ${FPT.x},${FPT.y+FPT.h*0.2} L ${FPT.x+FPT.w},${FPT.y} L ${FPT.x+FPT.w},${FPT.y+FPT.h} L ${FPT.x},${FPT.y+FPT.h*0.8} Z`} fill="url(#v-cylinder)" stroke="#020617" strokeWidth={3} />
          <text x={FPT.x + FPT.w/2} y={FPT.y - 15} textAnchor="middle" fontSize={14} fontFamily="'Exo 2'" fill="#bae6fd" fontWeight="bold">FPT</text>
          <line x1={FPT.x + FPT.w/2} y1={FPT.y + FPT.h/2} x2={FPUMP.x} y2={FPUMP.y} stroke="#94a3b8" strokeWidth={6} strokeDasharray="10 5" />
        </g>

        {/* HEATERS */}
        <g filter="url(#drop-shadow)">
          {[ {h: HTR1, l: 'Htr 1'}, {h: HTR2, l: 'Htr 2'}, {h: HTR3, l: 'Htr 3'}, {h: HTR4, l: 'Htr 4'} ].map((htr, i) => (
            <g key={i}>
              <rect x={htr.h.x} y={htr.h.y} width={htr.h.w} height={htr.h.h} rx={htr.h.w/2} fill="url(#v-cylinder)" stroke="#020617" strokeWidth={3} />
              <rect x={htr.h.x-4} y={htr.h.y + htr.h.h*0.2} width={htr.h.w+8} height={6} rx={2} fill="#334155" stroke="#020617" strokeWidth={2} />
              <rect x={htr.h.x-4} y={htr.h.y + htr.h.h*0.8} width={htr.h.w+8} height={6} rx={2} fill="#334155" stroke="#020617" strokeWidth={2} />
              <rect x={htr.h.x+8} y={htr.h.y+htr.h.h*0.4} width={htr.h.w-16} height={htr.h.h*0.5} rx={htr.h.w/4} fill="#020617" />
              <rect x={htr.h.x+8} y={htr.h.y+htr.h.h*0.6} width={htr.h.w-16} height={htr.h.h*0.3} rx={htr.h.w/4} fill="rgba(56, 189, 248, 0.6)" />
              <text x={htr.h.x + htr.h.w/2} y={htr.h.y + htr.h.h + 20} textAnchor="middle" fontSize={14} fill="#bae6fd" fontWeight="bold">{htr.l}</text>
            </g>
          ))}

          {[ {h: HTR6, l: 'Htr 6'}, {h: HTR7, l: 'Htr 7'}, {h: HTR8, l: 'Htr 8'} ].map((htr, i) => (
            <g key={i}>
              <rect x={htr.h.x} y={htr.h.y} width={htr.h.w} height={htr.h.h} rx={htr.h.w/2} fill="url(#v-cylinder)" stroke="#020617" strokeWidth={3} />
              <rect x={htr.h.x-4} y={htr.h.y + htr.h.h*0.2} width={htr.h.w+8} height={6} rx={2} fill="#334155" stroke="#020617" strokeWidth={2} />
              <rect x={htr.h.x-4} y={htr.h.y + htr.h.h*0.8} width={htr.h.w+8} height={6} rx={2} fill="#334155" stroke="#020617" strokeWidth={2} />
              <rect x={htr.h.x+8} y={htr.h.y+htr.h.h*0.4} width={htr.h.w-16} height={htr.h.h*0.5} rx={htr.h.w/4} fill="#020617" />
              <rect x={htr.h.x+8} y={htr.h.y+htr.h.h*0.6} width={htr.h.w-16} height={htr.h.h*0.3} rx={htr.h.w/4} fill="rgba(56, 189, 248, 0.6)" />
              <text x={htr.h.x + htr.h.w/2} y={htr.h.y + htr.h.h + 20} textAnchor="middle" fontSize={14} fill="#bae6fd" fontWeight="bold">{htr.l}</text>
            </g>
          ))}
          
          {/* Deaerator */}
          <rect x={DEAERATOR.x} y={DEAERATOR.y} width={DEAERATOR.w} height={DEAERATOR.h} rx={DEAERATOR.h/2} fill="url(#h-cylinder)" stroke="#020617" strokeWidth={4} />
          <rect x={DEAERATOR.x + 20} y={DEAERATOR.y - 30} width={DEAERATOR.w - 40} height={40} rx={10} fill="url(#v-cylinder)" stroke="#020617" strokeWidth={3} />
          {/* Internal level */}
          <rect x={DEAERATOR.x + 30} y={DEAERATOR.y + 20} width={DEAERATOR.w - 60} height={DEAERATOR.h - 40} rx={20} fill="#020617" />
          <rect x={DEAERATOR.x + 30} y={DEAERATOR.y + 50} width={DEAERATOR.w - 60} height={DEAERATOR.h - 70} rx={15} fill="rgba(56, 189, 248, 0.6)" />
          {/* Water mist / bubbles animation in De-aerator */}
          <circle cx={DEAERATOR.x + 60} cy={DEAERATOR.y + 40} r={4} fill="#bae6fd" opacity={0.6} />
          <circle cx={DEAERATOR.x + 100} cy={DEAERATOR.y + 30} r={3} fill="#bae6fd" opacity={0.4} />
          <circle cx={DEAERATOR.x + 140} cy={DEAERATOR.y + 45} r={5} fill="#bae6fd" opacity={0.7} />
          <text x={DEAERATOR.x + DEAERATOR.w/2} y={DEAERATOR.y + 15} textAnchor="middle" fontSize={14} fill="#7db8d4" fontWeight="bold">De-aerator</text>
        </g>

        {/* --- TEXT LABELS (Thermodynamic States) --- */}
        {/* Adjusted placements to prevent overlap with the new thicker pipes */}
        <g fontSize={12} fontFamily="'Share Tech Mono'" fill="#e2e8f0" style={{ textShadow: '0 0 5px rgba(0,0,0,0.9)' }}>
          <text x={275} y={50}>m = 1234kg/s</text>
          <text x={275} y={65}>25MPa, 550°C</text>
          <circle cx={255} cy={57} r={10} fill="#020617" stroke="#38bdf8" strokeWidth={2} />
          <text x={255} y={61} textAnchor="middle" fontSize={11} fill="#38bdf8">1</text>
          
          <text x={270} y={235}>5MPa</text>
          <text x={270} y={250}>300°C</text>
          <circle cx={250} cy={242} r={10} fill="#020617" stroke="#38bdf8" strokeWidth={2} />
          <text x={250} y={246} textAnchor="middle" fontSize={11} fill="#38bdf8">2</text>

          <text x={410} y={265}>4.5MPa</text>
          <text x={410} y={280}>550°C</text>
          <circle cx={390} cy={272} r={10} fill="#020617" stroke="#38bdf8" strokeWidth={2} />
          <text x={390} y={276} textAnchor="middle" fontSize={11} fill="#38bdf8">3</text>

          <text x={420} y={80}>800kPa, 350°C</text>
          <circle cx={400} cy={75} r={10} fill="#020617" stroke="#38bdf8" strokeWidth={2} />
          <text x={400} y={79} textAnchor="middle" fontSize={11} fill="#38bdf8">4</text>

          <text x={1130} y={110}>40 kPa</text>
          <text x={1130} y={125}>x = 0.98</text>

          <text x={580} y={270}>10kPa</text>
          <text x={580} y={285}>x = 0.93</text>
          <circle cx={560} cy={277} r={10} fill="#020617" stroke="#38bdf8" strokeWidth={2} />
          <text x={560} y={281} textAnchor="middle" fontSize={11} fill="#38bdf8">5</text>

          <text x={840} y={280}>250kPa</text>

          <text x={680} y={560}>40°C</text>
          <circle cx={660} cy={555} r={10} fill="#020617" stroke="#38bdf8" strokeWidth={2} />
          <text x={660} y={559} textAnchor="middle" fontSize={11} fill="#38bdf8">6</text>

          <text x={840} y={630}>800kPa</text>
          <circle cx={820} cy={625} r={10} fill="#020617" stroke="#38bdf8" strokeWidth={2} />
          <text x={820} y={629} textAnchor="middle" fontSize={11} fill="#38bdf8">7</text>

          <text x={530} y={640}>800kPa</text>
          <circle cx={510} cy={635} r={10} fill="#020617" stroke="#38bdf8" strokeWidth={2} />
          <text x={510} y={639} textAnchor="middle" fontSize={11} fill="#38bdf8">8</text>
          
          <text x={180} y={880}>h9 = hf @ 800kPa</text>
          <circle cx={160} cy={875} r={10} fill="#020617" stroke="#38bdf8" strokeWidth={2} />
          <text x={160} y={879} textAnchor="middle" fontSize={11} fill="#38bdf8">9</text>

          <text x={210} y={710}>30MPa</text>
          <circle cx={190} cy={705} r={10} fill="#020617" stroke="#38bdf8" strokeWidth={2} />
          <text x={190} y={709} textAnchor="middle" fontSize={11} fill="#38bdf8">10</text>
          
          <text x={220} y={350}>11</text>
          <circle cx={200} cy={345} r={10} fill="#020617" stroke="#38bdf8" strokeWidth={2} />

          {/* Extraction labels (Moved away from pipes) */}
          <text x={160} y={400} fill="#fda4af">y8</text>
          <text x={180} y={520} fill="#fda4af">y7</text>
          <text x={220} y={630} fill="#fda4af">y6</text>
          <text x={510} y={550} fill="#fda4af">yFPT</text>
          <text x={490} y={680} fill="#fda4af">y5</text>
          <text x={610} y={680} fill="#fda4af">y4</text>
          <text x={760} y={660} fill="#fda4af">y3</text>
          <text x={870} y={640} fill="#fda4af">y2</text>
          <text x={1080} y={540} fill="#fda4af">y1</text>
        </g>
      </svg>
    </div>
  );
}
