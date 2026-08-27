import { useEffect, useRef, useState, useCallback } from 'react'
import usePlantStore from './usePlantStore'

export default function useAudioEngine() {
  const [audioEnabled, setAudioEnabled] = useState(false)
  const ctxRef = useRef(null)
  
  // Audio Nodes
  const masterGainRef = useRef(null)
  
  // Turbine (Low Hum)
  const turbineOscRef = useRef(null)
  const turbineGainRef = useRef(null)
  
  // Boiler (Rumble / Noise approx)
  const boilerOscRef = useRef(null)
  const boilerGainRef = useRef(null)
  
  // Alarm (Sawtooth pulse)
  const alarmOscRef = useRef(null)
  const alarmGainRef = useRef(null)
  const alarmIntervalRef = useRef(null)

  const state = usePlantStore(s => s.plantState)

  const initAudio = useCallback(() => {
    if (ctxRef.current) {
      if (ctxRef.current.state === 'suspended') {
        ctxRef.current.resume()
      }
      return
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext
    const ctx = new AudioContext()
    ctxRef.current = ctx

    // Master Gain
    const masterGain = ctx.createGain()
    masterGain.gain.value = 0.5 // Overall volume
    masterGain.connect(ctx.destination)
    masterGainRef.current = masterGain

    // ── Turbine Setup ──
    const tOsc = ctx.createOscillator()
    tOsc.type = 'triangle'
    tOsc.frequency.value = 0
    const tGain = ctx.createGain()
    tGain.gain.value = 0
    tOsc.connect(tGain)
    tGain.connect(masterGain)
    tOsc.start()
    turbineOscRef.current = tOsc
    turbineGainRef.current = tGain

    // ── Boiler Setup ──
    // Using a low square wave to approximate a rumble/roar
    const bOsc = ctx.createOscillator()
    bOsc.type = 'square'
    bOsc.frequency.value = 40
    const bGain = ctx.createGain()
    bGain.gain.value = 0
    // Lowpass filter for boiler to muffle it
    const bFilter = ctx.createBiquadFilter()
    bFilter.type = 'lowpass'
    bFilter.frequency.value = 200
    bOsc.connect(bFilter)
    bFilter.connect(bGain)
    bGain.connect(masterGain)
    bOsc.start()
    boilerOscRef.current = bOsc
    boilerGainRef.current = bGain

    // ── Alarm Setup ──
    const aOsc = ctx.createOscillator()
    aOsc.type = 'sawtooth'
    aOsc.frequency.value = 800
    const aGain = ctx.createGain()
    aGain.gain.value = 0
    aOsc.connect(aGain)
    aGain.connect(masterGain)
    aOsc.start()
    alarmOscRef.current = aOsc
    alarmGainRef.current = aGain

    setAudioEnabled(true)
  }, [])

  const toggleAudio = useCallback(() => {
    if (!ctxRef.current) {
      initAudio()
    } else {
      if (ctxRef.current.state === 'running') {
        ctxRef.current.suspend()
        setAudioEnabled(false)
      } else {
        ctxRef.current.resume()
        setAudioEnabled(true)
      }
    }
  }, [initAudio])

  // Single shot click sound
  const playClick = useCallback(() => {
    if (!ctxRef.current || ctxRef.current.state !== 'running') return
    const ctx = ctxRef.current
    
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1)
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
    
    osc.connect(gain)
    gain.connect(masterGainRef.current)
    
    osc.start()
    osc.stop(ctx.currentTime + 0.1)
  }, [])

  // Update sound loops based on plant state
  useEffect(() => {
    if (!ctxRef.current || !state || ctxRef.current.state !== 'running') return

    const ctx = ctxRef.current
    const t = ctx.currentTime

    // ── Turbine ──
    const rpm = state.turbine?.rpm_actual || 0
    if (turbineOscRef.current && turbineGainRef.current) {
      // Base frequency 20Hz at 0 RPM -> 100Hz at 3000 RPM, volume scales up with RPM
      const targetFreq = 20 + (rpm / 3000) * 80
      const targetGain = Math.min(1.0, rpm / 3000) * 0.4
      
      turbineOscRef.current.frequency.setTargetAtTime(targetFreq, t, 0.1)
      turbineGainRef.current.gain.setTargetAtTime(targetGain, t, 0.5)
    }

    // ── Boiler ──
    const boilerRunning = state.boiler?.running || false
    const firingRate = state.boiler?.firing_rate || 0
    if (boilerGainRef.current) {
      const targetGain = boilerRunning ? (0.05 + (firingRate / 100) * 0.1) : 0
      boilerGainRef.current.gain.setTargetAtTime(targetGain, t, 1.0)
    }

    // ── Alarm ──
    const criticalAlarms = state.alarm_count_critical || 0
    if (criticalAlarms > 0) {
      if (!alarmIntervalRef.current) {
        // Start pulsing
        alarmIntervalRef.current = setInterval(() => {
          if (ctxRef.current?.state === 'running' && alarmGainRef.current) {
            const ct = ctxRef.current.currentTime
            alarmGainRef.current.gain.setValueAtTime(0.3, ct)
            alarmGainRef.current.gain.setTargetAtTime(0, ct + 0.1, 0.1)
          }
        }, 500)
      }
    } else {
      if (alarmIntervalRef.current) {
        clearInterval(alarmIntervalRef.current)
        alarmIntervalRef.current = null
        if (alarmGainRef.current) {
          alarmGainRef.current.gain.setTargetAtTime(0, t, 0.1)
        }
      }
    }

  }, [state])

  // Cleanup
  useEffect(() => {
    return () => {
      if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current)
      if (ctxRef.current) {
        ctxRef.current.close()
        ctxRef.current = null
      }
    }
  }, [])

  return { audioEnabled, toggleAudio, playClick }
}
