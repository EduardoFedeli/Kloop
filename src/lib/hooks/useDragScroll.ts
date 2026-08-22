"use client"

import { useCallback, useRef } from "react"

/**
 * Torna um container com overflow-x-auto arrastável com o mouse (desktop),
 * já que overflow-x-auto só responde a touch/trackpad nativamente.
 * Distingue arrasto de clique para não quebrar links dentro do carrossel.
 */
export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const state = useRef({ isDown: false, startX: 0, scrollLeft: 0, moved: false })

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    state.current.isDown = true
    state.current.moved = false
    state.current.startX = e.pageX - el.offsetLeft
    state.current.scrollLeft = el.scrollLeft
  }, [])

  const stopDrag = useCallback(() => {
    state.current.isDown = false
  }, [])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current
    if (!el || !state.current.isDown) return
    e.preventDefault()
    const x = e.pageX - el.offsetLeft
    const walk = x - state.current.startX
    if (Math.abs(walk) > 5) state.current.moved = true
    el.scrollLeft = state.current.scrollLeft - walk
  }, [])

  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (state.current.moved) {
      e.preventDefault()
      e.stopPropagation()
    }
  }, [])

  return {
    ref,
    onMouseDown,
    onMouseUp: stopDrag,
    onMouseLeave: stopDrag,
    onMouseMove,
    onClickCapture,
    className: "cursor-grab active:cursor-grabbing",
  }
}
