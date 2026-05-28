'use client'

import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { usePaintCanvas } from '@/hooks/usePaintCanvas'
import type { CanvasSize, ColorLayerDataURL, LayerMode } from '@/types/scratch-canvas'

const CRAYON_COLORS = [
  { name: '흰색', hex: '#FFFFFF' },
  { name: '검정', hex: '#1A1A1A' },
  { name: '빨강', hex: '#E63946' },
  { name: '주황', hex: '#F4A261' },
  { name: '노랑', hex: '#FFD166' },
  { name: '연두', hex: '#A8D5BA' },
  { name: '초록', hex: '#2D9E5F' },
  { name: '청록', hex: '#06A77D' },
  { name: '파랑', hex: '#3A86FF' },
  { name: '남색', hex: '#264653' },
  { name: '보라', hex: '#7B2D8B' },
  { name: '분홍', hex: '#F72585' },
  { name: '갈색', hex: '#8B5E3C' },
  { name: '살구색', hex: '#FFBA9E' },
  { name: '하늘색', hex: '#90E0EF' },
  { name: '회색', hex: '#9B9B9B' },
]

interface PaintCanvasProps {
  selectedSize: CanvasSize
  onScratchStart: (colorDataURL: ColorLayerDataURL) => void
  onSwitchMode: (mode: LayerMode) => void
}

export default function PaintCanvas({ selectedSize, onScratchStart, onSwitchMode }: PaintCanvasProps) {
  const { width, height } = selectedSize
  const { canvasRef, selectedColor, setSelectedColor, brushSize, setBrushSize, handlePointerDown, handlePointerMove, handlePointerUp } = usePaintCanvas()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, width, height)
  }, [width, height, canvasRef])

  const scale = Math.min(1, 700 / Math.max(width, height))
  const displayWidth = Math.round(width * scale)
  const displayHeight = Math.round(height * scale)

  function handleScratchStart() {
    const canvas = canvasRef.current
    if (!canvas) return
    onScratchStart(canvas.toDataURL())
  }

  return (
    <div className="flex flex-col gap-4 p-6 max-w-2xl mx-auto">
      {/* Tab bar */}
      <div role="tablist" className="flex border-b border-border">
        <button
          role="tab"
          aria-selected={false}
          className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
          onClick={() => onSwitchMode('preset')}
        >
          프리셋 선택
        </button>
        <button
          role="tab"
          aria-selected={true}
          className="px-4 py-2 text-sm font-medium border-b-2 border-primary text-foreground"
        >
          직접 칠하기
        </button>
      </div>

      {/* Size badge */}
      <p className="text-xs text-muted-foreground">
        {selectedSize.label} — {width} × {height}
      </p>

      {/* Color palette */}
      <div className="flex flex-wrap gap-2">
        {CRAYON_COLORS.map((color) => (
          <button
            key={color.hex}
            aria-label={`색상 ${color.name}`}
            onClick={() => setSelectedColor(color.hex)}
            style={{ backgroundColor: color.hex }}
            className={cn(
              'size-8 rounded-full border-2 transition-transform',
              selectedColor === color.hex
                ? 'border-foreground scale-110'
                : 'border-border hover:scale-105'
            )}
          />
        ))}
      </div>

      {/* Brush size slider */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground w-12">굵기 {brushSize}px</span>
        <input
          type="range"
          role="slider"
          min={2}
          max={30}
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="flex-1"
        />
      </div>

      {/* Canvas */}
      <div
        className="border border-border rounded overflow-hidden"
        style={{ width: displayWidth, height: displayHeight }}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{ width: displayWidth, height: displayHeight, cursor: 'crosshair' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
      </div>

      <Button onClick={handleScratchStart}>스크래치 시작</Button>
    </div>
  )
}
