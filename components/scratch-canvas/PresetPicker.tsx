'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { PRESETS, drawPreset } from '@/lib/presets'
import type { CanvasSize, ColorLayerDataURL, LayerMode, PresetId } from '@/types/scratch-canvas'

interface PresetPickerProps {
  selectedSize: CanvasSize
  onScratchStart: (colorDataURL: ColorLayerDataURL) => void
  onSwitchMode: (mode: LayerMode) => void
}

export default function PresetPicker({ selectedSize, onScratchStart, onSwitchMode }: PresetPickerProps) {
  const [selectedPreset, setSelectedPreset] = useState<PresetId | null>(null)
  const previewRefs = useRef<Map<PresetId, HTMLCanvasElement>>(new Map())

  const { width, height } = selectedSize
  const PREVIEW_SIZE = 80

  useEffect(() => {
    for (const preset of PRESETS) {
      const canvas = previewRefs.current.get(preset.id)
      if (!canvas) continue
      const ctx = canvas.getContext('2d')
      if (!ctx) continue
      drawPreset(ctx, preset.id, PREVIEW_SIZE, PREVIEW_SIZE)
    }
  }, [])

  function handleScratchStart() {
    if (!selectedPreset) return

    const offscreen = document.createElement('canvas')
    offscreen.width = width
    offscreen.height = height
    const ctx = offscreen.getContext('2d')
    if (!ctx) return
    drawPreset(ctx, selectedPreset, width, height)
    onScratchStart(offscreen.toDataURL())
  }

  return (
    <div className="flex flex-col gap-4 p-6 max-w-2xl mx-auto">
      {/* Tab bar */}
      <div role="tablist" className="flex border-b border-border">
        <button
          role="tab"
          aria-selected={true}
          className="px-4 py-2 text-sm font-medium border-b-2 border-primary text-foreground"
        >
          프리셋 선택
        </button>
        <button
          role="tab"
          aria-selected={false}
          className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
          onClick={() => onSwitchMode('paint')}
        >
          직접 칠하기
        </button>
      </div>

      {/* Size badge */}
      <p className="text-xs text-muted-foreground">
        {selectedSize.label} — {width} × {height}
      </p>

      {/* Preset cards */}
      <div className="grid grid-cols-3 gap-3">
        {PRESETS.map((preset) => {
          const isSelected = selectedPreset === preset.id
          return (
            <div
              key={preset.id}
              data-preset-card
              data-selected={isSelected}
              onClick={() => setSelectedPreset(preset.id)}
              className={cn(
                'cursor-pointer rounded-xl border-2 p-3 flex flex-col items-center gap-2 transition-colors',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-primary/40'
              )}
            >
              <canvas
                ref={(el) => {
                  if (el) previewRefs.current.set(preset.id, el)
                }}
                width={PREVIEW_SIZE}
                height={PREVIEW_SIZE}
                className="rounded"
              />
              <span className="text-xs font-medium text-foreground">{preset.label}</span>
            </div>
          )
        })}
      </div>

      <Button
        disabled={!selectedPreset}
        onClick={handleScratchStart}
        className="mt-2"
      >
        스크래치 시작
      </Button>
    </div>
  )
}
