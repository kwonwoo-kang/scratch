import { useRef, useState, useCallback } from 'react'

export function usePaintCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedColor, setSelectedColor] = useState('#E63946')
  const [brushSize, setBrushSize] = useState(30)
  const isDrawing = useRef(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)

  const paintStroke = useCallback(
    (x: number, y: number) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const radius = brushSize / 2
      ctx.strokeStyle = selectedColor
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
        ctx.fillStyle = selectedColor
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fill()
      }
      lastPos.current = { x, y }
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
      e.currentTarget.setPointerCapture(e.pointerId)
      isDrawing.current = true
      lastPos.current = null
      const { x, y } = toCanvasCoords(e)
      paintStroke(x, y)
    },
    [paintStroke]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawing.current) return
      const { x, y } = toCanvasCoords(e)
      paintStroke(x, y)
    },
    [paintStroke]
  )

  const handlePointerUp = useCallback(() => {
    isDrawing.current = false
    lastPos.current = null
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
