'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { CanvasSize } from '@/types/scratch-canvas'

const CANVAS_SIZES: CanvasSize[] = [
  { label: '소형 정사각', width: 600, height: 600 },
  { label: '중형 정사각', width: 800, height: 800 },
  { label: '대형 정사각', width: 1200, height: 1200 },
  { label: '가로형', width: 1200, height: 800 },
  { label: '세로형', width: 800, height: 1200 },
  { label: '와이드', width: 1600, height: 900 },
]

interface SizePickerProps {
  onSelect: (size: CanvasSize) => void
}

export default function SizePicker({ onSelect }: SizePickerProps) {
  const [selected, setSelected] = useState<string | null>(null)

  function handleClick(size: CanvasSize) {
    setSelected(size.label)
    onSelect(size)
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-foreground">캔버스 크기 선택</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {CANVAS_SIZES.map((size) => {
          const isSelected = selected === size.label
          return (
            <div
              key={size.label}
              data-size-card
              data-selected={isSelected}
              onClick={() => handleClick(size)}
              className={cn(
                'cursor-pointer rounded-xl border-2 p-4 flex flex-col gap-1 transition-colors',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-primary/40'
              )}
            >
              <span className="font-medium text-sm text-foreground">{size.label}</span>
              <span className="text-xs text-muted-foreground">
                {size.width} × {size.height}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
