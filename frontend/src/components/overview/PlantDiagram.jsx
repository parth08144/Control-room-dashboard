import React from 'react';
import usePlantStore from '../../hooks/usePlantStore';

export default function PlantDiagram() {
  const state = usePlantStore(s => s.plantState);

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
  
  // Heaters
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

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', background: '#020617' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100%' }}>
        <defs>
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
          <linearGradient id="heater-bg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <radialGradient id="boiler-fire" cx="50%" cy="80%" r="50%">
            <stop offset="0%" stopColor="#ffcc00" />
            <stop offset="60%" stopColor="#ff1100" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="5" dy="15" stdDeviation="12" floodColor="#000000" floodOpacity="0.8" />
          </filter>
        </defs>

        <rect width={W} height={H} fill="url(#grid)" />

        {/* --- PIPES --- */}
        <g strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round">
          
          {/* Main Steam (1) - Red */}
          <path d={`M ${BOILER.x + BOILER.w/2} ${BOILER.y} L ${BOILER.x + BOILER.w/2} 80 L 260 80 L 260 140 L ${HPT.x} 140`} stroke="#ef4444" strokeWidth={6} />
          
          {/* HP Exhaust to Reheat (2) - Light Red */}
          <path d={`M ${HPT.x + HPT.w/2} ${HPT.y + HPT.h} L ${HPT.x + HPT.w/2} 280 L ${BOILER.x + BOILER.w} 280`} stroke="#f87171" strokeWidth={4} />
          
          {/* Reheat to Reheat Turbine (3) - Red */}
          <path d={`M ${BOILER.x + BOILER.w} 230 L ${RHT.x} 230 L ${RHT.x} 140`} stroke="#ef4444" strokeWidth={5} />
          
          {/* Turbine connections (Shaft area steam) */}
          <path d={`M ${RHT.x + RHT.w} 190 L ${LPT1.x} 190`} stroke="#ef4444" strokeWidth={8} />
          <path d={`M ${LPT1.x + LPT1.w} 190 L ${LPT2.x} 190`} stroke="#ef4444" strokeWidth={8} />

          {/* LP Exhaust to Condenser (5) - Dark Blue/Grey */}
          <path d={`M ${LPT1.x + LPT1.w/2} ${LPT1.y + LPT1.h} L ${LPT1.x + LPT1.w/2} ${COND.y}`} stroke="#334155" strokeWidth={15} />
          <path d={`M ${LPT2.x + LPT2.w/2} ${LPT2.y + LPT2.h} L ${LPT2.x + LPT2.w/2} ${COND.y}`} stroke="#334155" strokeWidth={15} />

          {/* Condensate Line - Blue */}
          <path d={`M ${COND.x + 100} ${COND.y + COND.h} L ${CPUMP.x} ${CPUMP.y - CPUMP.r}`} stroke="#3b82f6" strokeWidth={5} />
          <path d={`M ${CPUMP.x} ${CPUMP.y + CPUMP.r} L ${CPUMP.x} 650 L 1130 650 L 1130 ${HTR1.y + HTR1.h}`} stroke="#3b82f6" strokeWidth={5} />
          
          {/* Feedwater through LP heaters */}
          <path d={`M 1100 540 L 960 540 L 960 ${HTR2.y}`} stroke="#3b82f6" strokeWidth={5} />
          <path d={`M 920 750 L 840 750`} stroke="#3b82f6" strokeWidth={5} />
          <path d={`M 760 750 L 680 750`} stroke="#3b82f6" strokeWidth={5} />
          <path d={`M 600 750 L 510 750`} stroke="#3b82f6" strokeWidth={5} />

          {/* Feedwater from Deaerator to FW Pump */}
          <path d={`M ${DEAERATOR.x + 50} ${DEAERATOR.y + DEAERATOR.h} L ${DEAERATOR.x + 50} 850 L ${FPUMP.x} 850 L ${FPUMP.x} ${FPUMP.y + FPUMP.r}`} stroke="#3b82f6" strokeWidth={6} />
          
          {/* Feedwater through HP heaters to Boiler */}
          <path d={`M ${FPUMP.x} ${FPUMP.y - FPUMP.r} L ${FPUMP.x} 640 L ${HTR6.x + HTR6.w} 640`} stroke="#3b82f6" strokeWidth={6} />
          <path d={`M ${HTR6.x + HTR6.w/2} ${HTR6.y} L ${HTR7.x + HTR7.w/2} ${HTR7.y + HTR7.h}`} stroke="#3b82f6" strokeWidth={6} />
          <path d={`M ${HTR7.x + HTR7.w/2} ${HTR7.y} L ${HTR8.x + HTR8.w/2} ${HTR8.y + HTR8.h}`} stroke="#3b82f6" strokeWidth={6} />
          <path d={`M ${HTR8.x + HTR8.w/2} ${HTR8.y} L ${BOILER.x + BOILER.w/2} ${BOILER.y + BOILER.h}`} stroke="#3b82f6" strokeWidth={6} />

          {/* Extraction Lines (Reddish) */}
          {/* y8 to Htr 8 */}
          <path d={`M ${HPT.x + HPT.w/2} 280 L 150 280 L 150 400 L ${HTR8.x + HTR8.w} 400`} stroke="#f43f5e" />
          {/* y7 from RHT to Htr 7 */}
          <path d={`M ${RHT.x + 30} ${RHT.y + RHT.h} L ${RHT.x + 30} 520 L ${HTR7.x + HTR7.w} 520`} stroke="#f43f5e" />
          {/* y6 from RHT to Htr 6 */}
          <path d={`M ${RHT.x + 80} ${RHT.y + RHT.h} L ${RHT.x + 80} 640 L ${HTR6.x + HTR6.w} 640`} stroke="#f43f5e" />
          {/* yFPT from RHT exhaust to FPT */}
          <path d={`M ${RHT.x + 110} ${RHT.y + RHT.h} L ${RHT.x + 110} 580 L ${FPT.x + FPT.w} 580`} stroke="#f43f5e" />
          {/* y5 from LPT A&C to Deaerator */}
          <path d={`M ${LPT1.x + 30} ${LPT1.y + LPT1.h} L ${LPT1.x + 30} 680 L ${DEAERATOR.x + 100} 680 L ${DEAERATOR.x + 100} ${DEAERATOR.y}`} stroke="#f43f5e" />
          {/* y4 from LPT A&C to Htr 4 */}
          <path d={`M ${LPT1.x + 100} ${LPT1.y + LPT1.h} L ${LPT1.x + 100} 720 L ${HTR4.x + HTR4.w/2} 720`} stroke="#f43f5e" />
          {/* y3 from LPT B&D to Htr 3 */}
          <path d={`M ${LPT2.x + 30} ${LPT2.y + LPT2.h} L ${LPT2.x + 30} 700 L ${HTR3.x + 40} 700 L ${HTR3.x + 40} 720`} stroke="#f43f5e" />
          {/* y2 from LPT B&D to Htr 2 */}
          <path d={`M ${LPT2.x + 80} ${LPT2.y + LPT2.h} L ${LPT2.x + 80} 680 L ${HTR2.x + 40} 680 L ${HTR2.x + 40} 720`} stroke="#f43f5e" />
          {/* y1 from LPT B&D to Htr 1 */}
          <path d={`M ${LPT2.x + 130} ${LPT2.y + LPT2.h} L ${LPT2.x + 130} 540 L ${HTR1.x} 540`} stroke="#f43f5e" />

          {/* Heater drains */}
          <path d={`M ${HTR8.x} 420 L 30 420 L 30 520 L ${HTR7.x} 520`} stroke="#94a3b8" />
          <path d={`M ${HTR7.x} 540 L 20 540 L 20 640 L ${HTR6.x} 640`} stroke="#94a3b8" />
          <path d={`M ${HTR6.x} 660 L 20 660 L 20 710 L ${DEAERATOR.x} 710`} stroke="#94a3b8" />
          
          <path d={`M ${HTR1.x + HTR1.w/2} 580 L 1130 580 L 1130 780 L 980 780 L 980 750`} stroke="#94a3b8" />
          <path d={`M ${HTR2.x + 20} 780 L 820 780 L 820 750`} stroke="#94a3b8" />
          <path d={`M ${HTR3.x + 20} 780 L 660 780 L 660 750`} stroke="#94a3b8" />
          <path d={`M ${HTR4.x + 20} 780 L 580 780 L 580 450 L ${COND.x + 260} 450`} stroke="#94a3b8" />

          {/* FPT exhaust to condenser */}
          <path d={`M ${FPT.x + FPT.w/2} ${FPT.y + FPT.h} L ${FPT.x + FPT.w/2} 650 L ${COND.x} 650`} stroke="#94a3b8" />

        </g>

        {/* --- EQUIPMENT --- */}

        {/* SHAFT */}
        <line x1={HPT.x} y1={SHAFT_Y} x2={GEN.x + GEN.w} y2={SHAFT_Y} stroke="#cbd5e1" strokeWidth={6} strokeDasharray={running ? "0" : "10 5"} filter="url(#drop-shadow)" />

        {/* BOILER */}
        <g filter="url(#drop-shadow)">
          <rect x={BOILER.x} y={BOILER.y} width={BOILER.w} height={BOILER.h} rx={16} fill="url(#metal-base)" stroke="#64748b" strokeWidth={3} />
          {/* Furnace Window */}
          <rect x={BOILER.x + 20} y={BOILER.y + 100} width={BOILER.w - 40} height={100} rx={8} fill="#020617" />
          <circle cx={BOILER.x + BOILER.w/2} cy={BOILER.y + 150} r={40} fill="url(#boiler-fire)" />
          {/* Reheat Coil Visual */}
          <path d={`M ${BOILER.x + BOILER.w} 280 L ${BOILER.x + 60} 280 Q ${BOILER.x + 40} 280 ${BOILER.x + 40} 260 Q ${BOILER.x + 40} 240 ${BOILER.x + 80} 240 Q ${BOILER.x + 100} 240 ${BOILER.x + 100} 220 Q ${BOILER.x + 100} 200 ${BOILER.x + 60} 200 L ${BOILER.x + BOILER.w} 200`} fill="none" stroke="#f43f5e" strokeWidth={6} strokeLinecap="round" />
          <text x={BOILER.x + BOILER.w/2} y={BOILER.y - 15} textAnchor="middle" fontSize={14} fontFamily="'Exo 2'" fill="#7db8d4" fontWeight="bold">Steam Generator</text>
          <text x={BOILER.x + 50} y={BOILER.y + 70} fontSize={10} fontFamily="'Exo 2'" fill="#f43f5e">Reheat</text>
        </g>

        {/* TURBINES */}
        <g filter="url(#drop-shadow)">
          {/* HP Turbine */}
          <polygon points={`${HPT.x},${HPT.y + HPT.h*0.2} ${HPT.x + HPT.w},${HPT.y} ${HPT.x + HPT.w},${HPT.y + HPT.h} ${HPT.x},${HPT.y + HPT.h*0.8}`} fill="url(#metal-base)" stroke="#94a3b8" strokeWidth={2} />
          <text x={HPT.x + HPT.w/2} y={HPT.y + HPT.h/2 + 5} textAnchor="middle" fontSize={14} fontFamily="'Exo 2'" fill="#e2e8f0" fontWeight="bold">HP</text>
          
          {/* Reheat Turbine */}
          <polygon points={`${RHT.x},${RHT.y + RHT.h*0.2} ${RHT.x + RHT.w},${RHT.y} ${RHT.x + RHT.w},${RHT.y + RHT.h} ${RHT.x},${RHT.y + RHT.h*0.8}`} fill="url(#metal-base)" stroke="#94a3b8" strokeWidth={2} />
          <text x={RHT.x + RHT.w/2} y={RHT.y + RHT.h/2 + 5} textAnchor="middle" fontSize={12} fontFamily="'Exo 2'" fill="#e2e8f0" fontWeight="bold">Reheat</text>
          
          {/* LP Turbines A&C */}
          <polygon points={`${LPT1.x},${LPT1.y + LPT1.h/2} ${LPT1.x + LPT1.w/2},${LPT1.y} ${LPT1.x + LPT1.w},${LPT1.y + LPT1.h/2} ${LPT1.x + LPT1.w},${LPT1.y + LPT1.h} ${LPT1.x},${LPT1.y + LPT1.h}`} fill="url(#metal-base)" stroke="#94a3b8" strokeWidth={2} />
          <text x={LPT1.x + LPT1.w/2} y={LPT1.y + LPT1.h/2 + 20} textAnchor="middle" fontSize={14} fontFamily="'Exo 2'" fill="#e2e8f0" fontWeight="bold">LP Turbines</text>
          <text x={LPT1.x + LPT1.w/2} y={LPT1.y + LPT1.h/2 + 40} textAnchor="middle" fontSize={12} fontFamily="'Exo 2'" fill="#94a3b8">A & C</text>

          {/* LP Turbines B&D */}
          <polygon points={`${LPT2.x},${LPT2.y + LPT2.h/2} ${LPT2.x + LPT2.w/2},${LPT2.y} ${LPT2.x + LPT2.w},${LPT2.y + LPT2.h/2} ${LPT2.x + LPT2.w},${LPT2.y + LPT2.h} ${LPT2.x},${LPT2.y + LPT2.h}`} fill="url(#metal-base)" stroke="#94a3b8" strokeWidth={2} />
          <text x={LPT2.x + LPT2.w/2} y={LPT2.y + LPT2.h/2 + 20} textAnchor="middle" fontSize={14} fontFamily="'Exo 2'" fill="#e2e8f0" fontWeight="bold">LP Turbines</text>
          <text x={LPT2.x + LPT2.w/2} y={LPT2.y + LPT2.h/2 + 40} textAnchor="middle" fontSize={12} fontFamily="'Exo 2'" fill="#94a3b8">B & D</text>
        </g>

        {/* GENERATOR */}
        <g filter="url(#drop-shadow)">
          <rect x={GEN.x} y={GEN.y} width={GEN.w} height={GEN.h} rx={8} fill="url(#metal-base)" stroke="#38bdf8" strokeWidth={3} />
          <text x={GEN.x + GEN.w/2} y={GEN.y + GEN.h/2 + 5} textAnchor="middle" fontSize={14} fontFamily="'Exo 2'" fill="#38bdf8" fontWeight="bold">Shaft Work Output</text>
        </g>

        {/* CONDENSER */}
        <g filter="url(#drop-shadow)">
          <rect x={COND.x} y={COND.y} width={COND.w} height={COND.h} rx={16} fill="url(#metal-base)" stroke="#64748b" strokeWidth={3} />
          {/* Cooling water coil */}
          <path d={`M ${COND.x + COND.w} ${COND.y + 40} L ${COND.x + 40} ${COND.y + 40} Q ${COND.x + 20} ${COND.y + 40} ${COND.x + 20} ${COND.y + 60} Q ${COND.x + 20} ${COND.y + 80} ${COND.x + 40} ${COND.y + 80} L ${COND.x + 220} ${COND.y + 80} Q ${COND.x + 240} ${COND.y + 80} ${COND.x + 240} ${COND.y + 100} Q ${COND.x + 240} ${COND.y + 120} ${COND.x + 220} ${COND.y + 120} L ${COND.x + COND.w} ${COND.y + 120}`} fill="none" stroke="#38bdf8" strokeWidth={6} />
          <rect x={COND.x + 2} y={COND.y + COND.h - 30} width={COND.w - 4} height={28} rx={14} fill="rgba(56, 189, 248, 0.4)" />
          <text x={COND.x + COND.w/2} y={COND.y + 20} textAnchor="middle" fontSize={14} fontFamily="'Exo 2'" fill="#7db8d4" fontWeight="bold">Condenser</text>
          <text x={COND.x + 60} y={COND.y + COND.h - 10} fontSize={12} fontFamily="'Exo 2'" fill="#bae6fd">Hotwell</text>
        </g>

        {/* PUMPS */}
        <g filter="url(#drop-shadow)">
          {/* Condensate Pump */}
          <circle cx={CPUMP.x} cy={CPUMP.y} r={CPUMP.r} fill="url(#metal-base)" stroke="#94a3b8" strokeWidth={2} />
          <polygon points={`${CPUMP.x - 10},${CPUMP.y - 10} ${CPUMP.x + 10},${CPUMP.y} ${CPUMP.x - 10},${CPUMP.y + 10}`} fill="#cbd5e1" />
          <text x={CPUMP.x} y={CPUMP.y + CPUMP.r + 15} textAnchor="middle" fontSize={11} fontFamily="'Exo 2'" fill="#94a3b8">Condensate Pump</text>
          
          {/* Feedwater Pump */}
          <circle cx={FPUMP.x} cy={FPUMP.y} r={FPUMP.r} fill="url(#metal-base)" stroke="#94a3b8" strokeWidth={2} />
          <polygon points={`${FPUMP.x - 15},${FPUMP.y - 15} ${FPUMP.x + 15},${FPUMP.y} ${FPUMP.x - 15},${FPUMP.y + 15}`} fill="#cbd5e1" />
          <text x={FPUMP.x} y={FPUMP.y + FPUMP.r + 15} textAnchor="middle" fontSize={12} fontFamily="'Exo 2'" fill="#94a3b8">Feedwater Pump</text>
          
          {/* FPT */}
          <polygon points={`${FPT.x},${FPT.y + FPT.h*0.2} ${FPT.x + FPT.w},${FPT.y} ${FPT.x + FPT.w},${FPT.y + FPT.h} ${FPT.x},${FPT.y + FPT.h*0.8}`} fill="url(#metal-base)" stroke="#94a3b8" strokeWidth={2} />
          <text x={FPT.x + FPT.w/2} y={FPT.y + FPT.h/2 + 5} textAnchor="middle" fontSize={12} fontFamily="'Exo 2'" fill="#e2e8f0" fontWeight="bold">FPT</text>
          {/* FPT to FW Pump Shaft */}
          <line x1={FPT.x} y1={FPT.y + FPT.h/2} x2={FPUMP.x} y2={FPUMP.y} stroke="#cbd5e1" strokeWidth={4} strokeDasharray="5 3" />
        </g>

        {/* HEATERS */}
        <g filter="url(#drop-shadow)">
          {/* Htr 1 */}
          <rect x={HTR1.x} y={HTR1.y} width={HTR1.w} height={HTR1.h} rx={4} fill="url(#heater-bg)" stroke="#64748b" strokeWidth={2} />
          <rect x={HTR1.x+2} y={HTR1.y+HTR1.h*0.7} width={HTR1.w-4} height={HTR1.h*0.3-2} fill="rgba(56, 189, 248, 0.4)" />
          <text x={HTR1.x + HTR1.w/2} y={HTR1.y + HTR1.h + 15} textAnchor="middle" fontSize={11} fill="#7db8d4">Htr 1</text>
          
          {/* Htr 2, 3, 4 */}
          {[ {h: HTR2, l: 'Htr 2'}, {h: HTR3, l: 'Htr 3'}, {h: HTR4, l: 'Htr 4'} ].map((htr, i) => (
            <g key={i}>
              <rect x={htr.h.x} y={htr.h.y} width={htr.h.w} height={htr.h.h} rx={4} fill="url(#heater-bg)" stroke="#64748b" strokeWidth={2} />
              <rect x={htr.h.x+2} y={htr.h.y+htr.h.h*0.6} width={htr.h.w-4} height={htr.h.h*0.4-2} fill="rgba(56, 189, 248, 0.4)" />
              <text x={htr.h.x + htr.h.w/2} y={htr.h.y + htr.h.h + 15} textAnchor="middle" fontSize={11} fill="#7db8d4">{htr.l}</text>
            </g>
          ))}

          {/* Htr 6, 7, 8 */}
          {[ {h: HTR6, l: 'Htr 6'}, {h: HTR7, l: 'Htr 7'}, {h: HTR8, l: 'Htr 8'} ].map((htr, i) => (
            <g key={i}>
              <rect x={htr.h.x} y={htr.h.y} width={htr.h.w} height={htr.h.h} rx={4} fill="url(#heater-bg)" stroke="#64748b" strokeWidth={2} />
              <rect x={htr.h.x+2} y={htr.h.y+htr.h.h*0.7} width={htr.h.w-4} height={htr.h.h*0.3-2} fill="rgba(56, 189, 248, 0.4)" />
              <text x={htr.h.x + htr.h.w/2} y={htr.h.y + htr.h.h + 15} textAnchor="middle" fontSize={11} fill="#7db8d4">{htr.l}</text>
            </g>
          ))}
          <text x={HTR7.x + HTR7.w + 10} y={HTR7.y + HTR7.h/2} fontSize={12} fill="#94a3b8" dominantBaseline="middle">High Pressure Feedwater Heaters</text>
          <text x={HTR3.x + HTR3.w/2} y={HTR3.y - 15} textAnchor="middle" fontSize={12} fill="#94a3b8">Low Pressure Feedwater Heaters</text>

          {/* Deaerator */}
          <path d={`M ${DEAERATOR.x + 20} ${DEAERATOR.y + 40} Q ${DEAERATOR.x + 20} ${DEAERATOR.y} ${DEAERATOR.x + DEAERATOR.w/2} ${DEAERATOR.y} Q ${DEAERATOR.x + DEAERATOR.w - 20} ${DEAERATOR.y} ${DEAERATOR.x + DEAERATOR.w - 20} ${DEAERATOR.y + 40} Z`} fill="url(#heater-bg)" stroke="#64748b" strokeWidth={2} />
          <rect x={DEAERATOR.x} y={DEAERATOR.y + 40} width={DEAERATOR.w} height={DEAERATOR.h - 40} rx={8} fill="url(#heater-bg)" stroke="#64748b" strokeWidth={2} />
          <rect x={DEAERATOR.x + 2} y={DEAERATOR.y + 60} width={DEAERATOR.w - 4} height={DEAERATOR.h - 62} rx={6} fill="rgba(56, 189, 248, 0.4)" />
          <text x={DEAERATOR.x + DEAERATOR.w/2} y={DEAERATOR.y + 30} textAnchor="middle" fontSize={12} fill="#7db8d4" fontWeight="bold">De-aerator</text>
          <text x={DEAERATOR.x + DEAERATOR.w/2} y={DEAERATOR.y + 80} textAnchor="middle" fontSize={10} fill="#bae6fd">Open Feedwater Heater</text>
          <text x={DEAERATOR.x + DEAERATOR.w/2} y={DEAERATOR.y + 95} textAnchor="middle" fontSize={10} fill="#bae6fd">Storage tank (Htr 5)</text>
        </g>

        {/* --- TEXT LABELS (Thermodynamic States) --- */}
        <g fontSize={11} fontFamily="'Share Tech Mono'" fill="#e2e8f0">
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

          {/* Heater pressures */}
          <text x={HTR8.x + 70} y={HTR8.y + 30}>8MPa</text>
          <text x={HTR8.x + 70} y={HTR8.y + 45}>350°C</text>
          <text x={HTR7.x + 70} y={HTR7.y + 30}>5MPa</text>
          <text x={HTR6.x + 70} y={HTR6.y + 30}>2MPa</text>

          <text x={HTR4.x + 20} y={HTR4.y - 10}>450kPa</text>
          <text x={HTR3.x + 20} y={HTR3.y - 10}>250kPa</text>
          <text x={HTR2.x + 20} y={HTR2.y - 10}>100kPa</text>
          <text x={HTR1.x - 40} y={HTR1.y + 30}>40kPa</text>
          
          {/* Extraction labels */}
          <text x={135} y={390} fill="#f43f5e">y8</text>
          <text x={200} y={510} fill="#f43f5e">y7</text>
          <text x={260} y={630} fill="#f43f5e">y6</text>
          <text x={530} y={570} fill="#f43f5e">yFPT</text>
          <text x={450} y={670} fill="#f43f5e">y5</text>
          <text x={600} y={680} fill="#f43f5e">y4</text>
          <text x={750} y={650} fill="#f43f5e">y3</text>
          <text x={870} y={600} fill="#f43f5e">y2</text>
          <text x={1080} y={530} fill="#f43f5e">y1</text>

        </g>
      </svg>
    </div>
  );
}
