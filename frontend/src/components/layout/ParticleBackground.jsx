/**
 * ParticleBackground — Interactive canvas particle field.
 * Particles react to mouse movement (attraction/repulsion).
 * Coloured nodes connected by proximity lines — pure human-crafted feel.
 */
import React, { useRef, useEffect } from 'react'

const PARTICLE_COUNT = 55
const COLORS = [
  'rgba(0,229,255,',    // cyan
  'rgba(176,64,255,',   // purple
  'rgba(0,255,136,',    // green
  'rgba(255,179,0,',    // amber
  'rgba(0,255,213,',    // teal
  'rgba(255,45,120,',   // pink
]

export default function ParticleBackground() {
  const canvasRef = useRef(null)
  const mouse = useRef({ x: -1000, y: -1000 })
  const particlesRef = useRef([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Initialise particles
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => {
      const colorBase = COLORS[Math.floor(Math.random() * COLORS.length)]
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.8 + 0.6,
        color: colorBase,
        alpha: Math.random() * 0.5 + 0.2,
        pulse: Math.random() * Math.PI * 2,
      }
    })

    const handleMouse = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handleMouse)

    let animId
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const particles = particlesRef.current
      const now = performance.now() / 1000

      // Update & draw particles
      for (let p of particles) {
        p.pulse += 0.02

        // Mouse attraction (gentle)
        const dx = mouse.current.x - p.x
        const dy = mouse.current.y - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 160 && dist > 0) {
          const force = (160 - dist) / 160 * 0.012
          p.vx += (dx / dist) * force
          p.vy += (dy / dist) * force
        }

        // Slight damping
        p.vx *= 0.995
        p.vy *= 0.995

        p.x += p.vx
        p.y += p.vy

        // Wrap edges
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        // Pulsing alpha
        const a = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse))

        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r + Math.sin(p.pulse) * 0.4, 0, Math.PI * 2)
        ctx.fillStyle = p.color + a + ')'
        ctx.fill()

        // Glow halo on larger particles
        if (p.r > 1.4) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2)
          ctx.fillStyle = p.color + (a * 0.15) + ')'
          ctx.fill()
        }
      }

      // Draw connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j]
          const dx = a.x - b.x, dy = a.y - b.y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 110) {
            const opacity = (1 - d / 110) * 0.18
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = a.color + opacity + ')'
            ctx.lineWidth = 0.6
            ctx.stroke()
          }
        }
      }

      // Mouse proximity glow
      for (let p of particles) {
        const dx = mouse.current.x - p.x
        const dy = mouse.current.y - p.y
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d < 100) {
          const o = (1 - d / 100) * 0.6
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r + 3, 0, Math.PI * 2)
          ctx.fillStyle = p.color + o + ')'
          ctx.fill()
        }
      }

      animId = requestAnimationFrame(draw)
    }
    animId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouse)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.7,
      }}
    />
  )
}
