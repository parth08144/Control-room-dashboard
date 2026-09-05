import React from 'react'
import usePlantStore from '../../hooks/usePlantStore'
import Gauge from '../ui/Gauge'
import ReactorSVG from '../overview/ReactorSVG'

export default function ReactorDetail() {
  const state = usePlantStore(s => s.plantState)
  const reactor = state?.reactor ?? {}

  return (
    <div style={{ width: '100%', height: '100%', padding: 20, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: '#00ffaa', letterSpacing: '0.1em' }}>
          ☢ REACTOR DETAIL — R-01
        </h1>
        <span className={`badge ${reactor.running ? 'badge-green' : reactor.tripped ? 'badge-red' : 'badge-grey'}`}>
          {reactor.tripped ? `TRIPPED: ${reactor.trip_reason}` : reactor.running ? 'RUNNING' : 'OFFLINE'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, flex: 1 }}>
        {/* Animated reactor diagram */}
        <div className="glass-panel" style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div className="section-header">CORE VIEW</div>
          <ReactorSVG reactor={reactor} width={160} height={240} />
          <div style={{ width: '100%' }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: '#3a6a85', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
              Control Rods
            </div>
            <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
              <div style={{
                width: `${reactor.control_rods ?? 0}%`, height: '100%',
                background: `linear-gradient(90deg, #00ffaa, ${(reactor.control_rods ?? 0) > 80 ? '#ffcc00' : '#00e5ff'})`,
                borderRadius: 4,
                boxShadow: '0 0 8px rgba(0,255,170,0.6)',
                transition: 'width 0.8s ease',
              }} />
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#00ffaa', marginTop: 4 }}>
              {(reactor.control_rods ?? 0).toFixed(1)}% OUT
            </div>
          </div>
        </div>

        {/* Gauges grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="glass-panel" style={{ padding: 16 }}>
            <div className="section-header">PROCESS MEASUREMENTS</div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Gauge value={reactor.neutron_flux ?? 0} min={0} max={120} label="NEUTRON FLUX" unit="%"
                size={130} color="#00ffaa" alarmHigh={105} />
              <Gauge value={reactor.core_temp ?? 40} min={0} max={400} label="CORE TEMP" unit="°C"
                size={130} color="#ff6d00" alarmHigh={340} />
              <Gauge value={reactor.steam_pressure ?? 0} min={0} max={200} label="SG PRESS" unit="bar"
                size={130} color="#00e5ff" alarmHigh={170} />
              <Gauge value={reactor.steam_flow ?? 0} min={0} max={420} label="STEAM FLOW" unit="t/h"
                size={130} color="#9c27b0" />
              <Gauge value={reactor.coolant_flow ?? 0} min={0} max={120} label="COOLANT FLOW" unit="%"
                size={130} color="#0077cc" />
            </div>
          </div>

          {/* Digital readouts */}
          <div className="glass-panel" style={{ padding: 16 }}>
            <div className="section-header">DIGITAL READOUTS</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { label: 'Neutron Flux', value: reactor.neutron_flux?.toFixed(2), unit: '%', alarm: (reactor.neutron_flux ?? 0) > 105 },
                { label: 'Core Temp', value: reactor.core_temp?.toFixed(1), unit: '°C', alarm: (reactor.core_temp ?? 0) > 340 },
                { label: 'SG Pressure', value: reactor.steam_pressure?.toFixed(1), unit: 'bar', alarm: (reactor.steam_pressure ?? 0) > 170 },
                { label: 'Steam Flow', value: reactor.steam_flow?.toFixed(1), unit: 't/h' },
                { label: 'Control Rods', value: reactor.control_rods?.toFixed(1), unit: '%' },
                { label: 'Coolant Flow', value: reactor.coolant_flow?.toFixed(1), unit: '%' },
              ].map(row => (
                <div key={row.label} style={{
                  background: 'rgba(0,0,0,0.3)', borderRadius: 6, padding: '10px 14px',
                  border: `1px solid ${row.alarm ? 'rgba(255,23,68,0.35)' : 'rgba(0,255,170,0.15)'}`,
                }}>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: '#3a6a85', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                    {row.label}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700,
                    color: row.alarm ? '#ff5252' : '#00ffaa' }}>
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
