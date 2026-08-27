"use client"

import { useEffect, useRef, useCallback } from "react"

// ── Config ──────────────────────────────────────────────────────────────────

const LINE_DISTANCE = 130
const MOUSE_RADIUS = 230
const BASE_SPEED = 0.3
const NODE_RADIUS = 1.5
const NODE_COLOR = [76, 126, 255] as const // --neon-lift in RGB
const MOBILE_BREAKPOINT = 640

// ── Types ───────────────────────────────────────────────────────────────────

interface Node {
  x: number
  y: number
  vx: number
  vy: number
}

// ── Component ───────────────────────────────────────────────────────────────

export function CircuitBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number>(0)
  const nodesRef = useRef<Node[]>([])
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -9999,
    y: -9999,
    active: false,
  })
  const reducedMotionRef = useRef(false)
  const isTouchRef = useRef(false)

  const createNodes = useCallback((width: number, height: number): Node[] => {
    const isMobile = width <= MOBILE_BREAKPOINT
    const divisor = isMobile ? 52000 : 26000
    const count = Math.max(30, Math.min(200, Math.round((width * height) / divisor)))

    return Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * BASE_SPEED * 2,
      vy: (Math.random() - 0.5) * BASE_SPEED * 2,
    }))
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d", { alpha: false })
    if (!ctx) return

    // Detect reduced motion & touch
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)")
    reducedMotionRef.current = mql.matches
    isTouchRef.current = "ontouchstart" in window || navigator.maxTouchPoints > 0

    const handleMotionChange = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches
    }
    mql.addEventListener("change", handleMotionChange)

    // ── Sizing ────────────────────────────────────────────────────────────
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    function resize() {
      const w = window.innerWidth
      const h = window.innerHeight
      canvas!.width = w * dpr
      canvas!.height = h * dpr
      canvas!.style.width = `${w}px`
      canvas!.style.height = `${h}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Regenerate nodes on resize so density stays proportional
      nodesRef.current = createNodes(w, h)
    }

    resize()
    window.addEventListener("resize", resize)

    // ── Mouse tracking (skip on touch devices) ────────────────────────────
    function onMouseMove(e: MouseEvent) {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
      mouseRef.current.active = true
    }
    function onMouseLeave() {
      mouseRef.current.active = false
    }

    if (!isTouchRef.current) {
      window.addEventListener("mousemove", onMouseMove)
      document.addEventListener("mouseleave", onMouseLeave)
    }

    // ── Animation loop ───────────────────────────────────────────────────
    const [r, g, b] = NODE_COLOR

    function draw() {
      const w = window.innerWidth
      const h = window.innerHeight
      const nodes = nodesRef.current
      const mouse = mouseRef.current
      const isReduced = reducedMotionRef.current

      // Clear with eclipse background
      ctx!.fillStyle = "#04060F"
      ctx!.fillRect(0, 0, w, h)

      // Update positions (skip if reduced motion)
      if (!isReduced) {
        for (const node of nodes) {
          node.x += node.vx
          node.y += node.vy

          if (node.x < 0 || node.x > w) node.vx *= -1
          if (node.y < 0 || node.y > h) node.vy *= -1

          // Clamp within bounds
          node.x = Math.max(0, Math.min(w, node.x))
          node.y = Math.max(0, Math.min(h, node.y))
        }
      }

      // Draw lines between nearby nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < LINE_DISTANCE) {
            let alpha = 1 - dist / LINE_DISTANCE

            // Mouse glow boost
            if (mouse.active) {
              const midX = (nodes[i].x + nodes[j].x) / 2
              const midY = (nodes[i].y + nodes[j].y) / 2
              const mouseDist = Math.sqrt(
                (midX - mouse.x) ** 2 + (midY - mouse.y) ** 2
              )
              if (mouseDist < MOUSE_RADIUS) {
                const boost = 1 - mouseDist / MOUSE_RADIUS
                alpha = Math.min(1, alpha + boost * 0.6)
              }
            }

            ctx!.strokeStyle = `rgba(${r},${g},${b},${(alpha * 0.35).toFixed(3)})`
            ctx!.lineWidth = 1
            ctx!.beginPath()
            ctx!.moveTo(nodes[i].x, nodes[i].y)
            ctx!.lineTo(nodes[j].x, nodes[j].y)
            ctx!.stroke()
          }
        }
      }

      // Draw nodes
      for (const node of nodes) {
        let alpha = 0.5

        if (mouse.active) {
          const mouseDist = Math.sqrt(
            (node.x - mouse.x) ** 2 + (node.y - mouse.y) ** 2
          )
          if (mouseDist < MOUSE_RADIUS) {
            const boost = 1 - mouseDist / MOUSE_RADIUS
            alpha = Math.min(1, alpha + boost * 0.5)
          }
        }

        ctx!.fillStyle = `rgba(${r},${g},${b},${alpha.toFixed(3)})`
        ctx!.beginPath()
        ctx!.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2)
        ctx!.fill()
      }

      animFrameRef.current = requestAnimationFrame(draw)
    }

    animFrameRef.current = requestAnimationFrame(draw)

    // ── Cleanup ──────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseleave", onMouseLeave)
      mql.removeEventListener("change", handleMotionChange)
    }
  }, [createNodes])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none"
    />
  )
}
