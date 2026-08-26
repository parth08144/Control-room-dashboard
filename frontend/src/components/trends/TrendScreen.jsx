/**
 * TrendScreen — Real-time trend charts for all key plant variables.
 */
import React, { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts'
import usePlantStore from '../../hooks/usePlantStore'

const TRENDS = [
  {
    id: 'pressure_temp',
    title: 'Steam Conditions',
    lines: [
      { key: 'steam_pressure', name: 'Pressure (bar)',  color: '#00e5ff', domain: [0, 180], ref: 160 },
      { key: 'steam_temp',     name: 'Temperature (°C)', color: '#ff6d00', domain: [0, 560], yAxisId: 'right' },
    ],
    leftLabel: 'bar', rightLabel: '°C',
  },
  {
    id: 'rpm_mw',
    title: 'Turbine RPM & Generator MW',
    lines: [
      { key: 'rpm', name: 'RPM',      color: '#9c27b0', domain: [0, 3300] },
      { key: 'mw',  name: 'MW Output', color: '#00e676', domain: [0, 700], yAxisId: 'right' },
    ],
    leftLabel: 'rpm', rightLabel: 'MW',
  },
  {
    id: 'drum_fw',
    title: 'Drum Level & Feedwater Flow',
    lines: [
      { key: 'drum_level', name: 'Drum Level (%)', color: '#0077cc', domain: [0, 100], ref: 50 },
      { key: 'fw_flow',    name: 'FW Flow (t/h)',  color: '#44aaff', domain: [0, 500], yAxisId: 'right' },
    ],
    leftLabel: '%', rightLabel: 't/h',
  },
  {
    id: 'frequency_vib',
    title: 'Grid Frequency & Vibration',
    lines: [
      { key: 'frequency',  name: 'Frequency (Hz)',  color: '#ffb300', domain: [47, 53], ref: 50 },
      { key: 'vibration',  name: 'Vibration (mm/s)', color: '#ff5252', domain: [0, 10], yAxisId: 'right' },
    ],
    leftLabel: 'Hz', rightLabel: 'mm/s',
  },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'rgba(4,14,32,0.97)', border: '1px solid rgba(0,200,255,0.3)',
      borderRadius: 6, padding: '8px 12px',
      fontFamily: 'var(--font-mono)', fontSize: 11,
    }}>
      <div style={{ color: '#3a6a85', marginBottom: 4 }}>
        {new Date(label).toLocaleTimeString()}
      </div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.color, lineHeight: 1.8 }}>
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</strong>
        </div>
      ))}
    </div>
  )
}

export default function TrendScreen() {
  const history = usePlantStore(s => s.history)
  const [active, setActive] = useState('pressure_temp')

  const trend = TRENDS.find(t => t.id === active) || TRENDS[0]

  // Downsample for performance if too many points
  const data = history.length > 100
    ? history.filter((_, i) => i % Math.ceil(history.length / 100) === 0)
    : history

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: 20, gap: 12 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: '#00e5ff', letterSpacing: '0.1em' }}>
        📈 TREND VIEWER
      </h1>

      {/* Trend selector */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {TRENDS.map(t => (
          <button key={t.id} onClick={() => setActive(t.id)}
            className={`btn ${active === t.id ? 'btn-cyan' : ''}`}
            style={{
              background: active === t.id ? undefined : 'rgba(255,255,255,0.04)',
              border: active === t.id ? undefined : '1px solid rgba(255,255,255,0.1)',
              color: active === t.id ? undefined : '#7db8d4',
              fontSize: 12, padding: '6px 14px',
            }}
          >
            {t.title}
          </button>
        ))}
      </div>

      {/* Main chart */}
      <div style={{
        flex: 1,
        background: 'rgba(2,8,18,0.7)',
        border: '1px solid rgba(0,200,255,0.1)',
        borderRadius: 10, padding: '20px 10px 10px',
      }}>
        <div className="section-header" style={{ paddingLeft: 10 }}>
          {trend.title}
        </div>
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={data} margin={{ top: 8, right: 50, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,150,200,0.08)" />
            <XAxis
              dataKey="t"
              type="number" domain={['auto', 'auto']}
              tickFormatter={v => new Date(v).toLocaleTimeString()}
              tick={{ fontSize: 9, fontFamily: 'Share Tech Mono', fill: '#3a6a85' }}
              stroke="rgba(0,150,200,0.2)"
            />
            <YAxis
              yAxisId="left"
              domain={trend.lines.find(l => !l.yAxisId)?.domain ?? ['auto', 'auto']}
              tick={{ fontSize: 9, fontFamily: 'Share Tech Mono', fill: '#3a6a85' }}
              stroke="rgba(0,150,200,0.2)"
              label={{ value: trend.leftLabel, angle: -90, position: 'insideLeft', fill: '#3a6a85', fontSize: 10 }}
            />
            <YAxis
              yAxisId="right" orientation="right"
              domain={trend.lines.find(l => l.yAxisId === 'right')?.domain ?? ['auto', 'auto']}
              tick={{ fontSize: 9, fontFamily: 'Share Tech Mono', fill: '#3a6a85' }}
              stroke="rgba(0,150,200,0.2)"
              label={{ value: trend.rightLabel, angle: 90, position: 'insideRight', fill: '#3a6a85', fontSize: 10 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: 11, paddingTop: 8 }}
            />
            {trend.lines.map(line => (
              <Line key={line.key}
                yAxisId={line.yAxisId || 'left'}
                type="monotone"
                dataKey={line.key}
                name={line.name}
                stroke={line.color}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            ))}
            {trend.lines.filter(l => l.ref).map(l => (
              <ReferenceLine key={l.key + '_ref'}
                yAxisId={l.yAxisId || 'left'}
                y={l.ref}
                stroke={l.color}
                strokeDasharray="4 4"
                strokeOpacity={0.4}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Mini sparklines row */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[
          { key: 'mw', label: 'MW Output', color: '#00e676' },
          { key: 'steam_pressure', label: 'Pressure', color: '#00e5ff' },
          { key: 'rpm', label: 'RPM', color: '#9c27b0' },
          { key: 'frequency', label: 'Frequency', color: '#ffb300' },
        ].map(({ key, label, color }) => {
          const val = data.length > 0 ? (data[data.length - 1][key] ?? 0) : 0
          return (
            <div key={key} style={{
              flex: 1, background: 'rgba(2,8,18,0.7)',
              border: '1px solid rgba(0,200,255,0.08)',
              borderRadius: 8, padding: '8px 12px',
            }}>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: '#3a6a85', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color, fontWeight: 700 }}>
                {val.toFixed(1)}
              </div>
              <ResponsiveContainer width="100%" height={35}>
                <LineChart data={data.slice(-50)}>
                  <Line type="monotone" dataKey={key} stroke={color} strokeWidth={1.5} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )
        })}
      </div>
    </div>
  )
}
