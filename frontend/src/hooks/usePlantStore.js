import { create } from 'zustand'

const usePlantStore = create((set, get) => ({
  // ── Connection ──────────────────────────────────────────────────────────────
  connected: false,
  setConnected: (v) => set({ connected: v }),

  // ── Live plant state (latest tick) ─────────────────────────────────────────
  plantState: null,
  setPlantState: (state) => set({ plantState: state }),

  // ── Trend history (time-series array) ──────────────────────────────────────
  history: [],
  appendHistory: (snap) =>
    set((s) => ({
      history: [...s.history.slice(-299), snap],
    })),

  // ── Alarm history ──────────────────────────────────────────────────────────
  alarmHistory: [],
  setAlarmHistory: (h) => set({ alarmHistory: h }),

  // ── Active view ────────────────────────────────────────────────────────────
  activeView: 'overview',   // 'overview' | 'alarms' | 'trends' | 'controls' | 'boiler' | 'turbine' | 'generator'
  setActiveView: (v) => set({ activeView: v }),

  // ── WebSocket sender (set by useWebSocket hook) ────────────────────────────
  sendMessage: null,
  setSendMessage: (fn) => set({ sendMessage: fn }),

  // ── Convenience: send a control command ───────────────────────────────────
  sendControl: (payload) => {
    const fn = get().sendMessage
    if (fn) fn(JSON.stringify({ type: 'control', payload }))
  },

  acknowledgeAlarm: (id) => {
    const fn = get().sendMessage
    if (fn) fn(JSON.stringify({ type: 'acknowledge', alarm_id: id }))
  },

  acknowledgeAll: () => {
    const fn = get().sendMessage
    if (fn) fn(JSON.stringify({ type: 'acknowledge_all' }))
  },
}))

export default usePlantStore
