import { useEffect, useRef, useCallback } from 'react'
import usePlantStore from './usePlantStore'

const getWsUrl = () => {
  if (typeof window === 'undefined') return 'ws://localhost:8000/ws'
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  // If running in dev server (5173), hardcode to 8000. Otherwise use current host.
  const host = window.location.port === '5173' ? 'localhost:8000' : window.location.host
  return `${protocol}//${host}/ws`
}

const WS_URL = getWsUrl()
const RECONNECT_DELAY = 3000

export function useWebSocket() {
  const wsRef = useRef(null)
  const reconnectTimer = useRef(null)
  const {
    setConnected,
    setPlantState,
    appendHistory,
    setSendMessage,
  } = usePlantStore()

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => {
      setConnected(true)
      clearTimeout(reconnectTimer.current)
    }

    ws.onmessage = (evt) => {
      try {
        const state = JSON.parse(evt.data)
        setPlantState(state)
        // Append time-series snapshot for trend charts
        appendHistory({
          t: state.timestamp * 1000,    // ms for recharts
          tick: state.tick,
          steam_pressure: state.boiler?.steam_pressure ?? 0,
          steam_temp:     state.boiler?.steam_temp ?? 0,
          drum_level:     state.boiler?.drum_level ?? 0,
          rpm:            state.turbine?.rpm_actual ?? 0,
          vibration:      state.turbine?.vibration ?? 0,
          mw:             state.generator?.mw_output ?? 0,
          frequency:      state.generator?.frequency ?? 0,
          fw_flow:        state.feedwater?.feedwater_flow ?? 0,
          vacuum:         state.condenser?.vacuum ?? 0,
        })
      } catch (e) {
        // silently ignore malformed JSON
      }
    }

    ws.onerror = () => {}

    ws.onclose = () => {
      setConnected(false)
      reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY)
    }

    setSendMessage((msg) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(msg)
      }
    })
  }, [setConnected, setPlantState, appendHistory, setSendMessage])

  useEffect(() => {
    connect()
    return () => {
      clearTimeout(reconnectTimer.current)
      wsRef.current?.close()
    }
  }, [connect])
}
