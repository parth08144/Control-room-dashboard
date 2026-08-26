/**
 * BoilerDetail — Detailed boiler view with large gauges and animated flame.
 */
import React from 'react'
import usePlantStore from '../../hooks/usePlantStore'
import Gauge from '../ui/Gauge'
import BoilerSVG from '../overview/BoilerSVG'

export default function BoilerDetail() {
  const state = usePlantStore(s => s.plantState)
  const sendControl = usePlantStore(s => s.sendControl)
  const boiler = state?.boiler ?? {}

  return (
    <div style={{ width: '100%', height: '100%', padding: 20, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: '#00e5ff', letterSpacing: '0.1em' }}>
          🔥 BOILER DETAIL — B-01
        </h1>
        <span className={`badge ${boiler.running ? 'badge-green' : boiler.tripped ? 'badge-red' : 'badge-grey'}`}>
          {boiler.tripped ? `TRIPPED: ${boiler.trip_reason}` : boiler.running ? 'RUNNING' : 'OFFLINE'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, flex: 1 }}>
        {/* Animated boiler diagram */}
        <div className="glass-panel" style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div className="section-header">FURNACE VIEW</div>
          <BoilerSVG boiler={boiler} width={160} height={240} />
          <div style={{ width: '100%' }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: '#3a6a85', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
              Firing Rate
            </div>
            <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
              <div style={{
                width: `${boiler.firing_rate ?? 0}%`, height: '100%',
                background: `linear-gradient(90deg, #ff6d00, ${(boiler.firing_rate ?? 0) > 80 ? '#ffcc00' : '#ff9800'})`,
                borderRadius: 4,
                boxShadow: '0 0 8px rgba(255,120,0,0.6)',
                transition: 'width 0.8s ease',
              }} />
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#ff9800', marginTop: 4 }}>
              {(boiler.firing_rate ?? 0).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Gauges grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="glass-panel" style={{ padding: 16 }}>
            <div className="section-header">PROCESS MEASUREMENTS</div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Gauge value={boiler.steam_pressure ?? 0} min={0} max={200} label="STEAM PRESS" unit="bar"
                size={130} color="#00e5ff" alarmHigh={170} />
              <Gauge value={boiler.steam_temp ?? 20} min={0} max={600} label="STEAM TEMP" unit="°C"
                size={130} color="#ff6d00" alarmHigh={545} />
              <Gauge value={boiler.drum_level ?? 50} min={0} max={100} label="DRUM LEVEL" unit="%"
                size={130} color="#0077cc" alarmHigh={85} alarmLow={15} />
              <Gauge value={boiler.steam_flow ?? 0} min={0} max={420} label="STEAM FLOW" unit="t/h"
                size={130} color="#9c27b0" />
              <Gauge value={boiler.flue_gas_temp ?? 20} min={0} max={400} label="FLUE GAS" unit="°C"
                size={130} color="#ff5722" alarmHigh={340} />
              <Gauge value={boiler.fuel_demand ?? 0} min={0} max={100} label="FUEL DEMAND" unit="%"
                size={130} color="#ffb300" />
            </div>
          </div>

          {/* Digital readouts */}
          <div className="glass-panel" style={{ padding: 16 }}>
            <div className="section-header">DIGITAL READOUTS</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { label: 'Steam Pressure', value: boiler.steam_pressure?.toFixed(2), unit: 'bar', alarm: (boiler.steam_pressure ?? 0) > 155 },
                { label: 'Steam Temperature', value: boiler.steam_temp?.toFixed(1), unit: '°C', alarm: (boiler.steam_temp ?? 0) > 530 },
                { label: 'Drum Level', value: boiler.drum_level?.toFixed(1), unit: '%', alarm: (boiler.drum_level ?? 50) < 25 || (boiler.drum_level ?? 50) > 85 },
                { label: 'Steam Flow', value: boiler.steam_flow?.toFixed(1), unit: 't/h' },
                { label: 'Firing Rate', value: boiler.firing_rate?.toFixed(1), unit: '%' },
                { label: 'Flue Gas Temp', value: boiler.flue_gas_temp?.toFixed(1), unit: '°C' },
              ].map(row => (
                <div key={row.label} style={{
                  background: 'rgba(0,0,0,0.3)', borderRadius: 6, padding: '10px 14px',
                  border: `1px solid ${row.alarm ? 'rgba(255,23,68,0.35)' : 'rgba(0,150,200,0.15)'}`,
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
