'use client'

import { useState } from 'react'
import type { AppStep, CanvasSize, LayerMode, ColorLayerDataURL } from '@/types/scratch-canvas'
import SizePicker from '@/components/scratch-canvas/SizePicker'

export default function ScratchCanvasPage() {
  const [step, setStep] = useState<AppStep>('size-pick')
  const [canvasSize, setCanvasSize] = useState<CanvasSize | null>(null)
  const [layerMode, setLayerMode] = useState<LayerMode>('preset')
  const [colorDataURL, setColorDataURL] = useState<ColorLayerDataURL>('')

  function handleSizeSelect(size: CanvasSize) {
    setCanvasSize(size)
    setStep('layer-pick')
  }

  function handleScratchStart(dataURL: ColorLayerDataURL) {
    setColorDataURL(dataURL)
    setStep('scratch')
  }

  function handleReset() {
    setStep('size-pick')
    setCanvasSize(null)
    setColorDataURL('')
  }

  return (
    <main className="min-h-screen bg-background">
      {step === 'size-pick' && (
        <SizePicker onSelect={handleSizeSelect} />
      )}
      {step === 'layer-pick' && canvasSize && (
        <div>
          {/* PresetPicker / PaintCanvas — wired in Task 3 & 4 */}
          <p className="p-6 text-muted-foreground">색상 레이어 준비 (Task 3-4에서 연결)</p>
        </div>
      )}
      {step === 'scratch' && canvasSize && (
        <div>
          {/* ScratchCanvas — wired in Task 2 */}
          <p className="p-6 text-muted-foreground">스크래치 (Task 2에서 연결)</p>
        </div>
      )}
    </main>
  )
}
