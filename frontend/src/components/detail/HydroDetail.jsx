import React from 'react'
import usePlantStore from '../../hooks/usePlantStore'
import Gauge from '../ui/Gauge'
import HydroSVG from '../overview/HydroSVG'

export default function HydroDetail() {
  const state = usePlantStore(s => s.plantState)
  const hydro = state?.hydro ?? {}

  return (
    <div style={{ width: '100%', height: '100%', padding: 20, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: '#00e5ff', letterSpacing: '0.1em' }}>
          🌊 HYDRO PLANT DETAIL — H-01
        </h1>
        <span className={`badge ${hydro.running ? 'badge-green' : hydro.tripped ? 'badge-red' : 'badge-grey'}`}>
          {hydro.tripped ? `TRIPPED: ${hydro.trip_reason}` : hydro.running ? 'RUNNING' : 'OFFLINE'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, flex: 1 }}>
        {/* Animated hydro diagram */}
        <div className="glass-panel" style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div className="section-header">DAM VIEW</div>
          <HydroSVG hydro={hydro} width={160} height={240} />
          <div style={{ width: '100%' }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: '#3a6a85', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
              Gate Opening
            </div>
            <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
              <div style={{
                width: `${hydro.gate_opening ?? 0}%`, height: '100%',
                background: `linear-gradient(90deg, #00e5ff, ${(hydro.gate_opening ?? 0) > 80 ? '#ffcc00' : '#00ffd5'})`,
                borderRadius: 4,
                boxShadow: '0 0 8px rgba(0,229,255,0.6)',
                transition: 'width 0.8s ease',
              }} />
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#00e5ff', marginTop: 4 }}>
              {(hydro.gate_opening ?? 0).toFixed(1)}% OPEN
            </div>
          </div>
        </div>

        {/* Gauges grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="glass-panel" style={{ padding: 16 }}>
            <div className="section-header">PROCESS MEASUREMENTS</div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Gauge value={hydro.reservoir_level ?? 0} min={0} max={120} label="RESERVOIR LVL" unit="m"
                size={130} color="#00e5ff" alarmLow={10} />
              <Gauge value={hydro.head_pressure ?? 0} min={0} max={120} label="HEAD PRESS" unit="bar"
                size={130} color="#00ffd5" />
              <Gauge value={hydro.water_flow ?? 0} min={0} max={1500} label="WATER FLOW" unit="m³/s"
                size={130} color="#0077cc" />
            </div>
          </div>

          {/* Digital readouts */}
          <div className="glass-panel" style={{ padding: 16 }}>
            <div className="section-header">DIGITAL READOUTS</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { label: 'Reservoir Level', value: `${hydro.reservoir_level?.toFixed(1)} ${(hydro.level_trend ?? 0) > 0.01 ? '▲' : (hydro.level_trend ?? 0) < -0.01 ? '▼' : ''}`, unit: 'm', alarm: (hydro.reservoir_level ?? 0) < 10 },
                { label: 'Head Pressure', value: hydro.head_pressure?.toFixed(1), unit: 'bar' },
                { label: 'Gate Opening', value: hydro.gate_opening?.toFixed(1), unit: '%' },
                { label: 'Water Flow', value: hydro.water_flow?.toFixed(0), unit: 'm³/s' },
              ].map(row => (
                <div key={row.label} style={{
                  background: 'rgba(0,0,0,0.3)', borderRadius: 6, padding: '10px 14px',
                  border: `1px solid ${row.alarm ? 'rgba(255,23,68,0.35)' : 'rgba(0,229,255,0.15)'}`,
                }}>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: '#3a6a85', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                    {row.label}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700,
                    color: row.alarm ? '#ff5252' : '#00e5ff' }}>
                    {row.value ?? '---'}
                    <span style={{ fontSize: 11, color: '#7db8d4', marginLeft: 4 }}>{row.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
