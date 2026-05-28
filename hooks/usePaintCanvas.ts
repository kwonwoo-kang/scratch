import { useRef, useState, useCallback } from 'react'

export function usePaintCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedColor, setSelectedColor] = useState('#E63946')
  const [brushSize, setBrushSize] = useState(10)
  const isDrawing = useRef(false)

  const paint = useCallback(
    (x: number, y: number) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.fillStyle = selectedColor
      ctx.beginPath()
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2)
      ctx.fill()
    },
    [selectedColor, brushSize]
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      isDrawing.current = true
      const rect = e.currentTarget.getBoundingClientRect()
      paint(e.clientX - rect.left, e.clientY - rect.top)
    },
    [paint]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawing.current) return
      const rect = e.currentTarget.getBoundingClientRect()
      paint(e.clientX - rect.left, e.clientY - rect.top)
    },
    [paint]
  )

  const handlePointerUp = useCallback(() => {
    isDrawing.current = false
  }, [])

  return {
    canvasRef,
    selectedColor,
    setSelectedColor,
    brushSize,
    setBrushSize,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  }
}
