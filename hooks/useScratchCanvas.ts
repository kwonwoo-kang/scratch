import { useRef, useState, useCallback } from 'react'
import type { ScratchBrushSize } from '@/types/scratch-canvas'

type PointerPos = { clientX: number; clientY: number }

interface UseScratchCanvasOpts {
  onStrokeStart?: () => void
  onStrokeTick?: () => void
  onStrokeEnd?: () => void
  onPan?: (deltaX: number, deltaY: number) => void
}

export function useScratchCanvas(opts: UseScratchCanvasOpts = {}) {
  const { onStrokeStart, onStrokeTick, onStrokeEnd, onPan } = opts
  const colorCanvasRef = useRef<HTMLCanvasElement>(null)
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null)
  const [brushSize, setBrushSize] = useState<ScratchBrushSize>(4)
  const isDrawing = useRef(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)
  const drawingPointerId = useRef<number | null>(null)
  const activePointers = useRef<Map<number, PointerPos>>(new Map())
  const panLastCentroid = useRef<{ x: number; y: number } | null>(null)

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
      onStrokeTick?.()
    },
    [brushSize, onStrokeTick]
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

  function getCentroid(pointers: Map<number, PointerPos>): { x: number; y: number } {
    let sumX = 0, sumY = 0
    pointers.forEach((p) => { sumX += p.clientX; sumY += p.clientY })
    return { x: sumX / pointers.size, y: sumY / pointers.size }
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
        onStrokeStart?.()
      } else if (activePointers.current.size === 2) {
        // cancel ongoing stroke
        isDrawing.current = false
        lastPos.current = null
        if (drawingPointerId.current !== null) {
          try { e.currentTarget.releasePointerCapture(drawingPointerId.current) } catch {}
          drawingPointerId.current = null
        }
        onStrokeEnd?.()
        panLastCentroid.current = getCentroid(activePointers.current)
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
        if (panLastCentroid.current === null) return
        const newCentroid = getCentroid(activePointers.current)
        const deltaX = newCentroid.x - panLastCentroid.current.x
        const deltaY = newCentroid.y - panLastCentroid.current.y
        onPan?.(deltaX, deltaY)
        panLastCentroid.current = newCentroid
      }
    },
    [scratchStroke, onPan]
  )

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    activePointers.current.delete(e.pointerId)

    if (activePointers.current.size === 0) {
      isDrawing.current = false
      lastPos.current = null
      drawingPointerId.current = null
      panLastCentroid.current = null
      onStrokeEnd?.()
    } else {
      // transitioned from 2→1: stop pan, do not auto-resume drawing
      panLastCentroid.current = null
      isDrawing.current = false
      lastPos.current = null
      onStrokeEnd?.()
    }
  }, [onStrokeEnd])

  const handlePointerCancel = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    activePointers.current.delete(e.pointerId)

    if (activePointers.current.size === 0) {
      isDrawing.current = false
      lastPos.current = null
      drawingPointerId.current = null
      panLastCentroid.current = null
      onStrokeEnd?.()
    } else {
      panLastCentroid.current = null
      isDrawing.current = false
      lastPos.current = null
      onStrokeEnd?.()
    }
  }, [onStrokeEnd])

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
