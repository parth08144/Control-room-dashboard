/**
 * TurbineDetail — Detailed turbine view with rotating blades and instrument gauges.
 */
import React from 'react'
import usePlantStore from '../../hooks/usePlantStore'
import Gauge from '../ui/Gauge'
import TurbineSVG from '../overview/TurbineSVG'

export default function TurbineDetail() {
  const state = usePlantStore(s => s.plantState)
  const turbine = state?.turbine ?? {}

  const vibAlarm = (turbine.vibration ?? 0) > 4
  const rpmAlarm = (turbine.rpm_actual ?? 0) > 3100

  return (
    <div style={{ width: '100%', height: '100%', padding: 20, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: '#00e5ff', letterSpacing: '0.1em' }}>
          ⚙ TURBINE DETAIL — T-01
        </h1>
        <span className={`badge ${turbine.running ? 'badge-green' : turbine.tripped ? 'badge-red' : 'badge-grey'}`}>
          {turbine.tripped ? `TRIPPED: ${turbine.trip_reason}` : turbine.running ? 'RUNNING' : 'OFFLINE'}
        </span>
        {turbine.fault_vibration && <span className="badge badge-amber">VIBRATION FAULT</span>}
        {turbine.fault_overspeed && <span className="badge badge-red">OVERSPEED FAULT</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, flex: 1 }}>
        {/* Animated turbine */}
        <div className="glass-panel" style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div className="section-header">ROTOR VIEW</div>
          <TurbineSVG turbine={turbine} width={180} height={200} />

          {/* RPM bar */}
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: '#3a6a85', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Speed
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: rpmAlarm ? '#ff5252' : '#00e5ff' }}>
                {(turbine.rpm_actual ?? 0).toFixed(0)} / 3000 rpm
              </span>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min(100, (turbine.rpm_actual ?? 0) / 3300 * 100)}%`,
                height: '100%',
                background: rpmAlarm
                  ? 'linear-gradient(90deg, #ff9800, #ff1744)'
                  : 'linear-gradient(90deg, #004080, #00e5ff)',
                borderRadius: 4, transition: 'width 0.5s ease',
                boxShadow: rpmAlarm ? '0 0 8px rgba(255,23,68,0.6)' : '0 0 6px rgba(0,229,255,0.4)',
              }} />
            </div>
          </div>

          {/* Vibration bar */}
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: '#3a6a85', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Vibration
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: vibAlarm ? '#ff9800' : '#00e5ff' }}>
                {(turbine.vibration ?? 0).toFixed(2)} mm/s
              </span>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min(100, (turbine.vibration ?? 0) / 10 * 100)}%`,
                height: '100%',
                background: (turbine.vibration ?? 0) > 6
                  ? 'linear-gradient(90deg, #ff9800, #ff1744)'
                  : (turbine.vibration ?? 0) > 4
                    ? 'linear-gradient(90deg, #ff6d00, #ffb300)'
                    : 'linear-gradient(90deg, #004040, #00e5ff)',
                borderRadius: 4, transition: 'width 0.5s ease',
              }} />
            </div>
          </div>
        </div>

        {/* Gauges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="glass-panel" style={{ padding: 16 }}>
            <div className="section-header">PROCESS MEASUREMENTS</div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Gauge value={turbine.rpm_actual ?? 0} min={0} max={3300} label="SPEED" unit="rpm"
                size={130} color="#9c27b0" alarmHigh={3100} decimals={0} />
              <Gauge value={turbine.mechanical_power ?? 0} min={0} max={700} label="MECH PWR" unit="MW"
                size={130} color="#00e676" />
              <Gauge value={turbine.vibration ?? 0} min={0} max={10} label="VIBRATION" unit="mm/s"
                size={130} color="#ffb300" alarmHigh={4} decimals={2} />
              <Gauge value={turbine.bearing_temp ?? 0} min={0} max={100} label="BEARING T" unit="°C"
                size={130} color="#ff5722" alarmHigh={80} />
              <Gauge value={turbine.steam_flow_in ?? 0} min={0} max={420} label="STEAM IN" unit="t/h"
                size={130} color="#00e5ff" />
            </div>
          </div>

          <div className="glass-panel" style={{ padding: 16 }}>
            <div className="section-header">DIGITAL READOUTS</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[
                { label: 'Actual Speed', value: (turbine.rpm_actual ?? 0).toFixed(0), unit: 'rpm', alarm: rpmAlarm },
                { label: 'Speed Setpoint', value: (turbine.rpm_setpoint ?? 0).toFixed(0), unit: 'rpm' },
                { label: 'Mechanical Power', value: (turbine.mechanical_power ?? 0).toFixed(2), unit: 'MW' },
                { label: 'Vibration', value: (turbine.vibration ?? 0).toFixed(3), unit: 'mm/s', alarm: vibAlarm },
                { label: 'Bearing Temp', value: (turbine.bearing_temp ?? 0).toFixed(1), unit: '°C', alarm: (turbine.bearing_temp ?? 0) > 80 },
                { label: 'Steam Flow In', value: (turbine.steam_flow_in ?? 0).toFixed(1), unit: 't/h' },
              ].map(row => (
                <div key={row.label} style={{
                  background: 'rgba(0,0,0,0.3)', borderRadius: 6, padding: '10px 14px',
                  border: `1px solid ${row.alarm ? 'rgba(255,23,68,0.35)' : 'rgba(0,150,200,0.15)'}`,
                }}>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: '#3a6a85', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                    {row.label}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: row.alarm ? '#ff5252' : '#00e5ff' }}>
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
