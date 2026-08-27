/**
 * App v2 — Root layout with particle background and colourful view transitions.
 */
import React, { useEffect, useState } from 'react'
import { useWebSocket } from './hooks/useWebSocket'
import usePlantStore from './hooks/usePlantStore'
import useAudioEngine from './hooks/useAudioEngine'
import { AnimatePresence, motion } from 'framer-motion'

import NavBar from './components/layout/NavBar'
import AlarmBanner from './components/layout/AlarmBanner'
import ParticleBackground from './components/layout/ParticleBackground'
import OverviewScreen from './components/overview/OverviewScreen'
import AlarmPanel from './components/alarms/AlarmPanel'
import TrendScreen from './components/trends/TrendScreen'
import ControlPanel from './components/controls/ControlPanel'
import BoilerDetail from './components/detail/BoilerDetail'
import TurbineDetail from './components/detail/TurbineDetail'
import GeneratorDetail from './components/detail/GeneratorDetail'

const SCREENS = {
  overview:  OverviewScreen,
  alarms:    AlarmPanel,
  trends:    TrendScreen,
  controls:  ControlPanel,
  boiler:    BoilerDetail,
  turbine:   TurbineDetail,
  generator: GeneratorDetail,
}

// Per-view accent colours for transition glow
const VIEW_ACCENTS = {
  overview:  '#00e5ff',
  alarms:    '#ff1744',
  trends:    '#b040ff',
  controls:  '#ffb300',
  boiler:    '#ff6d00',
  turbine:   '#00e5ff',
  generator: '#00ff88',
}

const pageVariants = {
  initial: { opacity: 0, scale: 0.99, y: 6 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, scale: 1.005, y: -6, transition: { duration: 0.16 } },
}

export default function App() {
  useWebSocket()
  const activeView = usePlantStore(s => s.activeView)
  const Screen = SCREENS[activeView] || OverviewScreen
  const accent = VIEW_ACCENTS[activeView] || '#00e5ff'

  const { audioEnabled, toggleAudio, playClick } = useAudioEngine()

  return (
    <div
      className="scanlines"
      style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', position: 'relative' }}
    >
      {/* Interactive particle field */}
      <ParticleBackground />

      {/* Coloured accent vignette that changes per view */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `radial-gradient(ellipse 50% 40% at 50% 100%, ${accent}0a 0%, transparent 70%)`,
        transition: 'background 0.8s ease',
      }} />

      <NavBar audioEnabled={audioEnabled} toggleAudio={toggleAudio} />

      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ width: '100%', height: '100%', overflowY: 'auto' }}
          >
            <Screen playClick={playClick} />
          </motion.div>
        </AnimatePresence>
      </div>

      <AlarmBanner />
    </div>
  )
}
