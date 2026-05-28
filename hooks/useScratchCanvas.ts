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
      ctx.arc(x, y, brushSize, 0, Math.PI * 2)
      ctx.fill()
    },
    [brushSize]
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      isDrawing.current = true
      const rect = e.currentTarget.getBoundingClientRect()
      scratch(e.clientX - rect.left, e.clientY - rect.top)
    },
    [scratch]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawing.current) return
      const rect = e.currentTarget.getBoundingClientRect()
      scratch(e.clientX - rect.left, e.clientY - rect.top)
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
