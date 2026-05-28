import { useRef, useState, useCallback } from 'react'
import type { ScratchBrushSize } from '@/types/scratch-canvas'

type PointerPos = { clientX: number; clientY: number }

export function useScratchCanvas() {
  const colorCanvasRef = useRef<HTMLCanvasElement>(null)
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null)
  const [brushSize, setBrushSize] = useState<ScratchBrushSize>(4)
  const isDrawing = useRef(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)
  const drawingPointerId = useRef<number | null>(null)
  const activePointers = useRef<Map<number, PointerPos>>(new Map())
  const panLastCentroidY = useRef<number | null>(null)

  const scratchStroke = useCallback(
    (x: number, y: number) => {
      const canvas = overlayCanvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.globalCompositeOperation = 'destination-out'
      ctx.lineWidth = brushSize
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      if (lastPos.current) {
        ctx.beginPath()
        ctx.moveTo(lastPos.current.x, lastPos.current.y)
        ctx.lineTo(x, y)
        ctx.stroke()
      } else {
        // single dot on pointer down
        ctx.beginPath()
        ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2)
        ctx.fill()
      }
      lastPos.current = { x, y }
    },
    [brushSize]
  )

  function toCanvasCoords(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const scaleX = e.currentTarget.width / rect.width
    const scaleY = e.currentTarget.height / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  function getCentroidY(pointers: Map<number, PointerPos>): number {
    let sum = 0
    pointers.forEach((p) => { sum += p.clientY })
    return sum / pointers.size
  }

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      activePointers.current.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY })

      if (activePointers.current.size === 1) {
        drawingPointerId.current = e.pointerId
        e.currentTarget.setPointerCapture(e.pointerId)
        isDrawing.current = true
        lastPos.current = null
        const { x, y } = toCanvasCoords(e)
        scratchStroke(x, y)
      } else if (activePointers.current.size === 2) {
        // cancel ongoing stroke
        isDrawing.current = false
        lastPos.current = null
        if (drawingPointerId.current !== null) {
          try { e.currentTarget.releasePointerCapture(drawingPointerId.current) } catch {}
          drawingPointerId.current = null
        }
        panLastCentroidY.current = getCentroidY(activePointers.current)
      }
      // 3+ fingers: just tracked in Map, pan uses first two
    },
    [scratchStroke]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!activePointers.current.has(e.pointerId)) return
      activePointers.current.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY })

      if (activePointers.current.size === 1) {
        if (!isDrawing.current) return
        const { x, y } = toCanvasCoords(e)
        scratchStroke(x, y)
      } else {
        if (panLastCentroidY.current === null) return
        const newCentroidY = getCentroidY(activePointers.current)
        const delta = newCentroidY - panLastCentroidY.current
        window.scrollBy(0, -delta)
        panLastCentroidY.current = newCentroidY
      }
    },
    [scratchStroke]
  )

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    activePointers.current.delete(e.pointerId)

    if (activePointers.current.size === 0) {
      isDrawing.current = false
      lastPos.current = null
      drawingPointerId.current = null
      panLastCentroidY.current = null
    } else {
      // transitioned from 2→1: stop pan, do not auto-resume drawing
      panLastCentroidY.current = null
      isDrawing.current = false
      lastPos.current = null
    }
  }, [])

  const handlePointerCancel = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    activePointers.current.delete(e.pointerId)

    if (activePointers.current.size === 0) {
      isDrawing.current = false
      lastPos.current = null
      drawingPointerId.current = null
      panLastCentroidY.current = null
    } else {
      panLastCentroidY.current = null
      isDrawing.current = false
      lastPos.current = null
    }
  }, [])

  const resetOverlay = useCallback(() => {
    const canvas = overlayCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    // scratchStroke leaves destination-out active — restore before filling black
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  return {
    colorCanvasRef,
    overlayCanvasRef,
    brushSize,
    setBrushSize,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    resetOverlay,
  }
}
