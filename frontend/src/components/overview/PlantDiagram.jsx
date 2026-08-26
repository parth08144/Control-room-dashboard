/**
 * PlantDiagram — Full P&ID overview SVG with all animated components.
 * Layout: [BOILER] → steam → [TURBINE] → [GENERATOR] → [GRID]
 *                                ↓
 *         [COOL TOWER] ← [CONDENSER] ← [FEEDWATER PUMPS] ← condensate return
 */
import React from 'react'
import BoilerSVG from './BoilerSVG'
import TurbineSVG from './TurbineSVG'
import GeneratorSVG from './GeneratorSVG'
import CoolingTowerSVG from './CoolingTowerSVG'
import FeedwaterSVG from './FeedwaterSVG'
import PipeSVG from './PipeSVG'
import usePlantStore from '../../hooks/usePlantStore'

// SVG canvas dimensions
const W = 960
const H = 510

// Equipment positions (center-x, top-y)
const BOILER_X = 80,   BOILER_Y = 80
const TURB_X   = 340,  TURB_Y  = 95
const GEN_X    = 570,  GEN_Y   = 95
const COOL_X   = 100,  COOL_Y  = 350
const FW_X     = 600,  FW_Y    = 370
const GRID_X   = 820,  GRID_Y  = 120

// Pipe connection helpers
const BW = 140, BH = 200, TW = 140, TH = 180, GW = 140, GH = 180
const COOL_W = 110, COOL_H = 140, FW_W = 240, FW_H = 100

export default function PlantDiagram() {
  const setActiveView = usePlantStore(s => s.setActiveView)
  const state = usePlantStore(s => s.plantState)

  if (!state) {
    return (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#3a6a85', fontFamily: 'var(--font-mono)', fontSize: 14,
      }}>
        ⚡ Connecting to simulation engine...
      </div>
    )
  }

  const { boiler, turbine, generator, condenser, feedwater } = state
  const steamFlow = Math.min(1, (boiler?.steam_flow ?? 0) / 400)
  const fwFlow    = Math.min(1, (feedwater?.feedwater_flow ?? 0) / 400)
  const condFlow  = Math.min(1, (condenser?.condensate_flow ?? 0) / 400)
  const cwFlow    = Math.min(1, (condenser?.cooling_water_flow ?? 0) / 8000)

  // Steam pipe: boiler → turbine
  const steamPipe = {
    x1: BOILER_X + BW, y1: BOILER_Y + BH * 0.2,
    x2: TURB_X,        y2: TURB_Y + TH * 0.42,
  }
  // Steam pipe: turbine → condenser
  const exhaustPipe = {
    x1: TURB_X + TW * 0.5, y1: TURB_Y + TH,
    x2: TURB_X + TW * 0.5, y2: FW_Y,
  }
  // Shaft: turbine → generator
  const shaftY = TURB_Y + TH * 0.42
  // Feedwater: pumps → boiler
  const fwPipe = {
    x1: FW_X,        y1: FW_Y + FW_H * 0.5,
    x2: BOILER_X + BW * 0.5, y2: TURB_Y + TH + 40,
  }
  // Grid connection
  const gridPipe = {
    x1: GEN_X + GW, y1: GEN_Y + GH * 0.42,
    x2: GRID_X,     y2: GRID_Y + 30,
  }

  const hasAlarm = (state.alarm_count_critical ?? 0) > 0 || (state.alarm_count_warning ?? 0) > 0

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '12px',
    }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: '100%', maxHeight: 'calc(100vh - 120px)' }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* ── Background defs ── */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={1} />
          </pattern>
          <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#00e5ff" stopOpacity="0.7" />
            <stop offset="40%"  stopColor="#b040ff" stopOpacity="0.8" />
            <stop offset="75%"  stopColor="#00ff88" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#ffb300" stopOpacity="0.7" />
          </linearGradient>
          <filter id="titleGlow">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          
          {/* 3D Skeuomorphic Gradients */}
          <linearGradient id="metal-base" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="15%" stopColor="#475569" />
            <stop offset="50%" stopColor="#334155" />
            <stop offset="85%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          
          <linearGradient id="metal-dark" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="20%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="80%" stopColor="#020617" />
            <stop offset="100%" stopColor="#000000" />
          </linearGradient>
          
          <linearGradient id="metal-copper" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#78350f" />
            <stop offset="25%" stopColor="#b45309" />
            <stop offset="50%" stopColor="#92400e" />
            <stop offset="85%" stopColor="#451a03" />
            <stop offset="100%" stopColor="#2e1002" />
          </linearGradient>

          <linearGradient id="metal-chrome" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="30%" stopColor="#e2e8f0" />
            <stop offset="50%" stopColor="#cbd5e1" />
            <stop offset="70%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>

          <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="5" dy="15" stdDeviation="12" floodColor="#000000" floodOpacity="0.8" />
          </filter>
          
          <filter id="inner-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feComponentTransfer in="SourceAlpha"><feFuncA type="linear" slope="0.5"/></feComponentTransfer>
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feOffset dx="0" dy="5"/>
            <feComposite operator="out" in2="SourceAlpha"/>
            <feComposite operator="in" in2="SourceGraphic"/>
            <feBlend mode="multiply" in2="SourceGraphic"/>
          </filter>
        </defs>
        <rect width={W} height={H} fill="url(#grid)" />

        {/* Coloured corner accents */}
        <circle cx={0}  cy={0}   r={80} fill="rgba(0,180,255,0.04)" />
        <circle cx={W}  cy={0}   r={70} fill="rgba(160,0,255,0.04)" />
        <circle cx={0}  cy={H}   r={70} fill="rgba(0,255,180,0.04)" />
        <circle cx={W}  cy={H}   r={70} fill="rgba(255,60,120,0.04)" />

        {/* ── Title bar ── */}
        <text x={W / 2} y={24} textAnchor="middle"
          fontSize={13} fontFamily="'Exo 2'" fontWeight="800"
          letterSpacing="0.22em" fill="url(#titleGrad)"
          filter="url(#titleGlow)"
        >660 MW THERMAL POWER PLANT — UNIT 1 OVERVIEW</text>

        {/* ── Steam pipe: Boiler → Turbine ── */}
        <PipeSVG
          x1={steamPipe.x1} y1={steamPipe.y1}
          x2={steamPipe.x2} y2={steamPipe.y2}
          flowRate={steamFlow} media="steam" strokeWidth={6}
        />

        {/* ── Exhaust: Turbine → Condenser area ── */}
        <PipeSVG
          x1={exhaustPipe.x1} y1={exhaustPipe.y1}
          x2={exhaustPipe.x2} y2={exhaustPipe.y2 - 10}
          flowRate={condFlow} media="steam" strokeWidth={5}
        />

        {/* ── Condensate return: condenser → FW pumps ── */}
        <PipeSVG
          x1={TURB_X + TW * 0.5} y1={FW_Y}
          x2={FW_X + FW_W * 0.5} y2={FW_Y + FW_H * 0.5}
          flowRate={condFlow} media="condensate" strokeWidth={4}
        />

        {/* ── Feedwater: pumps → boiler drum ── */}
        <PipeSVG
          x1={FW_X + FW_W * 0.5} y1={FW_Y + FW_H * 0.5}
          x2={BOILER_X + BW * 0.3} y2={BOILER_Y + BH * 0.6}
          flowRate={fwFlow} media="water" strokeWidth={5}
        />

        {/* ── Fuel line → boiler ── */}
        <PipeSVG
          x1={0} y1={BOILER_Y + BH * 0.8}
          x2={BOILER_X} y2={BOILER_Y + BH * 0.8}
          flowRate={Math.min(1, (boiler?.firing_rate ?? 0) / 100)}
          media="fuel" strokeWidth={4}
        />
        <text x={10} y={BOILER_Y + BH * 0.8 - 8} fontSize={9} fontFamily="'Share Tech Mono'"
          fill="rgba(255,110,0,0.6)" letterSpacing="0.05em">FUEL</text>

        {/* ── Cooling water pipes ── */}
        <PipeSVG
          x1={COOL_X + COOL_W} y1={COOL_Y + COOL_H * 0.6}
          x2={TURB_X + TW * 0.5 - 20} y2={FW_Y + 15}
          flowRate={cwFlow} media="cooling" strokeWidth={4} reversed
        />

        {/* ── Turbine → Generator shaft (dashed) ── */}
        <line
          x1={TURB_X + TW} y1={shaftY}
          x2={GEN_X} y2={shaftY}
          stroke="rgba(0,180,220,0.35)" strokeWidth={4}
          strokeDasharray={turbine?.running ? '0' : '6 4'}
          strokeLinecap="round"
        />
        {turbine?.running && (
          <line
            x1={TURB_X + TW} y1={shaftY}
            x2={GEN_X} y2={shaftY}
            stroke="rgba(0,229,255,0.6)" strokeWidth={2}
          />
        )}
        <text x={(TURB_X + TW + GEN_X) / 2} y={shaftY - 6}
          textAnchor="middle" fontSize={8} fontFamily="'Share Tech Mono'"
          fill="rgba(0,180,220,0.5)"
        >COUPLING</text>

        {/* ── Grid connection ── */}
        <PipeSVG
          x1={gridPipe.x1} y1={gridPipe.y1}
          x2={gridPipe.x2} y2={gridPipe.y2}
          flowRate={generator?.mw_output > 5 ? 0.8 : 0}
          media="water" strokeWidth={4}
        />

        {/* ── GRID symbol ── */}
        <g filter="url(#drop-shadow)">
          <rect x={GRID_X} y={GRID_Y} width={80} height={60}
            rx={4} fill="url(#metal-dark)"
            stroke={generator?.breaker_closed ? '#10b981' : '#475569'}
            strokeWidth={2}
          />
          {/* Inner panel cutout */}
          <rect x={GRID_X + 6} y={GRID_Y + 6} width={68} height={48} rx={2}
            fill="#020617" filter="url(#inner-shadow)"
          />
          {/* Grid symbol: three-phase lines */}
          {[15, 27, 39].map((y, i) => (
            <g key={i}>
              <line x1={GRID_X + 12} y1={GRID_Y + y} x2={GRID_X + 38} y2={GRID_Y + y}
                stroke={generator?.breaker_closed ? '#10b981' : '#64748b'} strokeWidth={3}
              />
              <line x1={GRID_X + 42} y1={GRID_Y + y} x2={GRID_X + 68} y2={GRID_Y + y}
                stroke={generator?.breaker_closed ? '#10b981' : '#64748b'} strokeWidth={3}
              />
            </g>
          ))}
          <text x={GRID_X + 40} y={GRID_Y + 74} textAnchor="middle"
            fontSize={9} fontFamily="'Exo 2'" fontWeight="600"
            letterSpacing="0.1em" fill="#7db8d4"
          >GRID</text>
          <text x={GRID_X + 40} y={GRID_Y + 84} textAnchor="middle"
            fontSize={8} fontFamily="'Share Tech Mono'" fontWeight="bold"
            fill={generator?.breaker_closed ? '#10b981' : '#64748b'}
          >{generator?.mw_output.toFixed(1)} MW</text>
        </g>

        {/* ── BOILER (clickable) ── */}
        <g style={{ filter: boiler?.tripped ? 'drop-shadow(0 0 8px rgba(255,23,68,0.7))' : 'none' }}>
          <foreignObject x={BOILER_X} y={BOILER_Y} width={BW + 30} height={BH + 40}>
            <div xmlns="http://www.w3.org/1999/xhtml">
              <BoilerSVG boiler={boiler} width={BW} height={BH}
                onClick={() => setActiveView('boiler')} />
            </div>
          </foreignObject>
        </g>

        {/* ── TURBINE (clickable) ── */}
        <g style={{ filter: turbine?.tripped ? 'drop-shadow(0 0 8px rgba(255,23,68,0.7))' : 'none' }}>
          <foreignObject x={TURB_X} y={TURB_Y} width={TW} height={TH + 50}>
            <div xmlns="http://www.w3.org/1999/xhtml">
              <TurbineSVG turbine={turbine} width={TW} height={TH}
                onClick={() => setActiveView('turbine')} />
            </div>
          </foreignObject>
        </g>

        {/* ── GENERATOR (clickable) ── */}
        <g style={{ filter: generator?.tripped ? 'drop-shadow(0 0 8px rgba(255,23,68,0.7))' : 'none' }}>
          <foreignObject x={GEN_X} y={GEN_Y} width={GW} height={GH + 50}>
            <div xmlns="http://www.w3.org/1999/xhtml">
              <GeneratorSVG generator={generator} turbine={turbine} width={GW} height={GH}
                onClick={() => setActiveView('generator')} />
            </div>
          </foreignObject>
        </g>

        {/* ── COOLING TOWER ── */}
        <foreignObject x={COOL_X} y={COOL_Y} width={COOL_W + 20} height={COOL_H + 30}>
          <div xmlns="http://www.w3.org/1999/xhtml">
            <CoolingTowerSVG condenser={condenser} width={COOL_W} height={COOL_H} />
          </div>
        </foreignObject>

        {/* ── CONDENSER box ── */}
        <g filter="url(#drop-shadow)">
          <rect x={TURB_X} y={FW_Y} width={TW} height={50}
            rx={4} fill="url(#metal-base)"
            stroke="#475569" strokeWidth={2}
          />
          {/* Cutout screen */}
          <rect x={TURB_X + 6} y={FW_Y + 20} width={TW - 12} height={24} rx={2} fill="#020617" filter="url(#inner-shadow)" />
          
          <text x={TURB_X + TW / 2} y={FW_Y + 14} textAnchor="middle"
            fontSize={9} fontFamily="'Exo 2'" fontWeight="600" fill="#7db8d4"
            letterSpacing="0.08em"
          >CONDENSER</text>
          
          <text x={TURB_X + TW / 2} y={FW_Y + 30} textAnchor="middle"
            fontSize={8} fontFamily="'Share Tech Mono'" fontWeight="bold"
            fill={condenser?.vacuum < -0.7 ? '#10b981' : '#f59e0b'}
          >{(condenser?.vacuum ?? 0).toFixed(3)} bar</text>
          
          <text x={TURB_X + TW / 2} y={FW_Y + 40} textAnchor="middle"
            fontSize={8} fontFamily="'Share Tech Mono'" fill="#64748b"
          >{(condenser?.condensate_temp ?? 0).toFixed(1)} °C</text>
        </g>

        {/* ── FEEDWATER PUMPS ── */}
        <foreignObject x={FW_X} y={FW_Y} width={FW_W} height={FW_H + 30}>
          <div xmlns="http://www.w3.org/1999/xhtml">
            <FeedwaterSVG feedwater={feedwater} width={FW_W} height={FW_H} />
          </div>
        </foreignObject>

        {/* ── Alarm count badge ── */}
        {hasAlarm && (
          <g>
            <rect x={W - 120} y={H - 40} width={110} height={28} rx={6}
              fill="rgba(255,23,68,0.15)" stroke="rgba(255,23,68,0.5)" strokeWidth={1.5}
            >
              <animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="1s" repeatCount="indefinite" />
            </rect>
            <text x={W - 65} y={H - 22} textAnchor="middle"
              fontSize={11} fontFamily="'Rajdhani'" fontWeight="700"
              fill="#ff5252" letterSpacing="0.05em"
            >⚠ {state.alarm_count_critical} CRIT · {state.alarm_count_warning} WARN</text>
          </g>
        )}

        {/* ── Tick counter ── */}
        <text x={8} y={H - 6} fontSize={9} fontFamily="'Share Tech Mono'"
          fill="rgba(0,150,200,0.3)"
        >TICK #{state.tick ?? 0}</text>
      </svg>
    </div>
  )
}
