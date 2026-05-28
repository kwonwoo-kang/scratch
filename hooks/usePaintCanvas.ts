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
      // brushSize is diameter — radius is brushSize / 2
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2)
      ctx.fill()
    },
    [selectedColor, brushSize]
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
      paint(x, y)
    },
    [paint]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawing.current) return
      const { x, y } = toCanvasCoords(e)
      paint(x, y)
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
