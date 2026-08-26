/**
 * CoolingTowerSVG — Animated rising steam/vapor from cooling tower.
 * Vapor intensity tied to heat rejection load.
 */
import React, { useRef, useEffect, useId, useState } from 'react'

function SteamParticle({ cx, cy, intensity, delay = 0, id }) {
  const dur = 2.5 - intensity * 1.2
  return (
    <ellipse cx={cx} cy={cy} rx={6 + intensity * 8} ry={3 + intensity * 4}
      fill="rgba(180,220,255,0.18)"
      filter={`url(#cf-${id})`}
    >
      <animateTransform attributeName="transform" type="translate"
        from={`0,0`} to={`${(Math.random() - 0.5) * 20}, ${-(40 + intensity * 50)}`}
        dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite" additive="sum"
      />
      <animate attributeName="opacity"
        values="0;0.7;0.4;0"
        keyTimes="0;0.2;0.7;1"
        dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite"
      />
      <animate attributeName="rx"
        from={6 + intensity * 4} to={18 + intensity * 14}
        dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite"
      />
    </ellipse>
  )
}

export default function CoolingTowerSVG({ condenser = {}, width = 100, height = 130 }) {
  const { heat_rejection = 0, cooling_tower_fans = 0 } = condenser
  const id = useId().replace(/:/g, '')
  const intensity = Math.min(1, heat_rejection / 400)

  const cx = width / 2
  const towerTop = height * 0.22
  const towerBase = height * 0.82
  const towerTopW = width * 0.28
  const towerBaseW = width * 0.55
  const towerH = towerBase - towerTop

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      <defs>
        <filter id={`cf-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={4} />
        </filter>
      </defs>

      {/* Steam particles */}
      {cooling_tower_fans > 0 && intensity > 0.05 && (
        <>
          {[0, 1, 2, 3, 4].map((i) => (
            <SteamParticle key={i}
              cx={cx + (i - 2) * 8} cy={towerTop}
              intensity={intensity}
              delay={i * 0.5}
              id={id}
            />
          ))}
        </>
      )}

      {/* Tower hyperboloid shape (trapezoid approximation) with drop shadow */}
      <g filter="url(#drop-shadow)">
        <path
          d={`M ${cx - towerBaseW / 2} ${towerBase}
              L ${cx - towerTopW / 2} ${towerTop}
              L ${cx + towerTopW / 2} ${towerTop}
              L ${cx + towerBaseW / 2} ${towerBase} Z`}
          fill="url(#metal-base)"
          stroke="#475569"
          strokeWidth={2}
        />
        {/* Horizontal Concrete/Steel Ribs */}
        <line x1={cx - towerBaseW * 0.4} y1={towerBase - towerH * 0.3} x2={cx + towerBaseW * 0.4} y2={towerBase - towerH * 0.3} stroke="#020617" strokeWidth={3} />
        <line x1={cx - towerBaseW * 0.4} y1={towerBase - towerH * 0.3} x2={cx + towerBaseW * 0.4} y2={towerBase - towerH * 0.3} stroke="#64748b" strokeWidth={1} />
        
        <line x1={cx - towerBaseW * 0.35} y1={towerBase - towerH * 0.6} x2={cx + towerBaseW * 0.35} y2={towerBase - towerH * 0.6} stroke="#020617" strokeWidth={3} />
        <line x1={cx - towerBaseW * 0.35} y1={towerBase - towerH * 0.6} x2={cx + towerBaseW * 0.35} y2={towerBase - towerH * 0.6} stroke="#64748b" strokeWidth={1} />
      </g>

      {/* Interior opening */}
      <ellipse cx={cx} cy={towerTop} rx={towerTopW / 2 - 2} ry={4} fill="#020617" />
      <path
        d={`M ${cx - towerBaseW / 2 + 6} ${towerBase - 4}
            L ${cx - towerTopW / 2 + 4} ${towerTop + 4}
            L ${cx + towerTopW / 2 - 4} ${towerTop + 4}
            L ${cx + towerBaseW / 2 - 6} ${towerBase - 4} Z`}
        fill="rgba(0,0,0,0.4)"
      />

      {/* Fan indicators */}
      <ellipse cx={cx} cy={towerTop} rx={towerTopW * 0.8} ry={6}
        fill="url(#metal-dark)" stroke="url(#metal-chrome)" strokeWidth={2}
        filter="url(#drop-shadow)"
      />
      <ellipse cx={cx} cy={towerTop} rx={towerTopW * 0.8 - 3} ry={4}
        fill={cooling_tower_fans > 0 ? '#00e5ff' : '#020617'}
        opacity={cooling_tower_fans > 0 ? 0.3 : 1}
      />
      {cooling_tower_fans > 0 && (
        <text x={cx} y={towerTop + 3} textAnchor="middle"
          fontSize={7} fontFamily="'Share Tech Mono'" fontWeight="bold"
          fill="#10b981"
        >{cooling_tower_fans} FAN</text>
      )}

      {/* Foundation Base */}
      <rect x={cx - towerBaseW / 2 - 5} y={towerBase} width={towerBaseW + 10} height={10}
        rx={2} fill="url(#metal-dark)" stroke="#334155" strokeWidth={2} filter="url(#drop-shadow)"
      />

      {/* Heat rejection readout */}
      <g filter="url(#drop-shadow)">
        <rect x={cx - 30} y={height - 18} width={60} height={18} rx={3} fill="#020617" stroke="#475569" strokeWidth={1.5} />
        <text x={cx} y={height - 6} textAnchor="middle"
          fontSize={9} fontFamily="'Share Tech Mono'" fontWeight="bold"
          fill={intensity > 0.7 ? '#f59e0b' : '#38bdf8'}
        >{heat_rejection.toFixed(0)} <tspan fontSize={6} fill="#64748b">MW</tspan></text>
      </g>

      <text x={cx} y={towerTop - 12} textAnchor="middle"
        fontSize={8} fontFamily="'Exo 2'" fontWeight="600"
        letterSpacing="0.1em" fill="#7db8d4"
      >COOL. TOWER</text>
    </svg>
  )
}
