import { useRef, useState, useCallback } from 'react'
import type { ScratchBrushSize } from '@/types/scratch-canvas'

export function useScratchCanvas() {
  const colorCanvasRef = useRef<HTMLCanvasElement>(null)
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null)
  const [brushSize, setBrushSize] = useState<ScratchBrushSize>(4)
  const isDrawing = useRef(false)

  const scratch = useCallback(
    (x: number, y: number) => {
      const canvas = overlayCanvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.globalCompositeOperation = 'destination-out'
      ctx.beginPath()
      // brushSize is diameter — radius is brushSize / 2
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2)
      ctx.fill()
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
      isDrawing.current = true
      const { x, y } = toCanvasCoords(e)
      scratch(x, y)
    },
    [scratch]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawing.current) return
      const { x, y } = toCanvasCoords(e)
      scratch(x, y)
    },
    [scratch]
  )

  const handlePointerUp = useCallback(() => {
    isDrawing.current = false
  }, [])

  return {
    colorCanvasRef,
    overlayCanvasRef,
    brushSize,
    setBrushSize,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  }
}
