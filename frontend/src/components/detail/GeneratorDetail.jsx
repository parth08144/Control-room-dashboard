/**
 * GeneratorDetail — Detailed generator view with EM field animation and gauges.
 */
import React from 'react'
import usePlantStore from '../../hooks/usePlantStore'
import Gauge from '../ui/Gauge'
import GeneratorSVG from '../overview/GeneratorSVG'

export default function GeneratorDetail() {
  const state = usePlantStore(s => s.plantState)
  const sendControl = usePlantStore(s => s.sendControl)
  const generator = state?.generator ?? {}
  const turbine   = state?.turbine   ?? {}

  const freqAlarm = generator.running && ((generator.frequency ?? 50) < 48.5 || (generator.frequency ?? 50) > 51.5)
  const tempAlarm = (generator.stator_temp ?? 0) > 100

  return (
    <div style={{ width: '100%', height: '100%', padding: 20, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: '#00e5ff', letterSpacing: '0.1em' }}>
          ⚡ GENERATOR DETAIL — G-01
        </h1>
        <span className={`badge ${generator.running ? 'badge-green' : generator.tripped ? 'badge-red' : 'badge-grey'}`}>
          {generator.tripped ? `TRIPPED: ${generator.trip_reason}` : generator.running ? 'SYNCHRONISED' : 'OFFLINE'}
        </span>
        {generator.breaker_closed && <span className="badge badge-green">ON GRID</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, flex: 1 }}>
        {/* Animated generator */}
        <div className="glass-panel" style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div className="section-header">ROTOR/STATOR VIEW</div>
          <GeneratorSVG generator={generator} turbine={turbine} width={180} height={200} />

          {/* Breaker control */}
          <div style={{ width: '100%', display: 'flex', gap: 6 }}>
            <button
              onClick={() => sendControl({ gen_breaker_close: true })}
              disabled={generator.breaker_closed || !generator.running}
              className="btn btn-green"
              style={{ flex: 1, fontSize: 10, padding: '6px 8px' }}
            >CLOSE BKR</button>
            <button
              onClick={() => sendControl({ gen_breaker_open: true })}
              disabled={!generator.breaker_closed}
              className="btn btn-red"
              style={{ flex: 1, fontSize: 10, padding: '6px 8px' }}
            >OPEN BKR</button>
          </div>

          {/* Power factor */}
          <div style={{ width: '100%', background: 'rgba(0,0,0,0.3)', borderRadius: 6, padding: '8px 12px' }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: '#3a6a85', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
              Power Factor
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: '#00e5ff', fontWeight: 700 }}>
              {generator.mw_output > 0
                ? (generator.mw_output / Math.sqrt(generator.mw_output ** 2 + (generator.mvar_output ?? 0) ** 2)).toFixed(3)
                : '---'}
            </div>
          </div>
        </div>

        {/* Gauges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="glass-panel" style={{ padding: 16 }}>
            <div className="section-header">ELECTRICAL MEASUREMENTS</div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Gauge value={generator.mw_output ?? 0} min={0} max={700} label="MW OUTPUT" unit="MW"
                size={130} color="#00e676" decimals={1} />
              <Gauge value={generator.mvar_output ?? 0} min={-100} max={300} label="MVAR" unit="MVAr"
                size={130} color="#7c4dff" decimals={1} />
              <Gauge value={generator.frequency ?? 50} min={47} max={53} label="FREQUENCY" unit="Hz"
                size={130} color="#ffb300" alarmHigh={51.5} alarmLow={48.5} decimals={2} />
              <Gauge value={generator.voltage ?? 0} min={0} max={15} label="VOLTAGE" unit="kV"
                size={130} color="#00e5ff" decimals={2} />
              <Gauge value={generator.stator_temp ?? 0} min={0} max={130} label="STATOR TEMP" unit="°C"
                size={130} color="#ff5722" alarmHigh={100} />
              <Gauge value={generator.excitation ?? 0} min={0} max={120} label="EXCITATION" unit="%"
                size={130} color="#e040fb" />
            </div>
          </div>

          <div className="glass-panel" style={{ padding: 16 }}>
            <div className="section-header">DIGITAL READOUTS</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[
                { label: 'MW Output', value: (generator.mw_output ?? 0).toFixed(2), unit: 'MW' },
                { label: 'MVAr Output', value: (generator.mvar_output ?? 0).toFixed(2), unit: 'MVAr' },
                { label: 'Frequency', value: (generator.frequency ?? 50).toFixed(3), unit: 'Hz', alarm: freqAlarm },
                { label: 'Terminal Voltage', value: (generator.voltage ?? 0).toFixed(3), unit: 'kV' },
                { label: 'Stator Temp', value: (generator.stator_temp ?? 0).toFixed(1), unit: '°C', alarm: tempAlarm },
                { label: 'Excitation', value: (generator.excitation ?? 0).toFixed(1), unit: '%' },
              ].map(row => (
                <div key={row.label} style={{
                  background: 'rgba(0,0,0,0.3)', borderRadius: 6, padding: '10px 14px',
                  border: `1px solid ${row.alarm ? 'rgba(255,23,68,0.35)' : 'rgba(0,150,200,0.15)'}`,
                  animation: row.alarm ? 'warnPulse 1.5s infinite' : 'none',
                }}>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: '#3a6a85', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                    {row.label}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: row.alarm ? '#ff5252' : '#00e5ff' }}>
                    {row.value}
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
