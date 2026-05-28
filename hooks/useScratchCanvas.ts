import { useRef, useState, useCallback } from 'react'
import type { ScratchBrushSize } from '@/types/scratch-canvas'

export function useScratchCanvas() {
  const colorCanvasRef = useRef<HTMLCanvasElement>(null)
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null)
  const [brushSize, setBrushSize] = useState<ScratchBrushSize>(4)
  const isDrawing = useRef(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)
  const activePointerId = useRef<number | null>(null)

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

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (activePointerId.current !== null) return
      activePointerId.current = e.pointerId
      e.currentTarget.setPointerCapture(e.pointerId)
      isDrawing.current = true
      lastPos.current = null
      const { x, y } = toCanvasCoords(e)
      scratchStroke(x, y)
    },
    [scratchStroke]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (e.pointerId !== activePointerId.current) return
      if (!isDrawing.current) return
      const { x, y } = toCanvasCoords(e)
      scratchStroke(x, y)
    },
    [scratchStroke]
  )

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerId !== activePointerId.current) return
    isDrawing.current = false
    lastPos.current = null
    activePointerId.current = null
  }, [])

  const handlePointerCancel = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerId !== activePointerId.current) return
    isDrawing.current = false
    lastPos.current = null
    activePointerId.current = null
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
