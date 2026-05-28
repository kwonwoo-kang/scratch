'use client'

import { useState } from 'react'
import type { AppStep, CanvasSize, LayerMode, ColorLayerDataURL } from '@/types/scratch-canvas'
import SizePicker from '@/components/scratch-canvas/SizePicker'
import PresetPicker from '@/components/scratch-canvas/PresetPicker'
import PaintCanvas from '@/components/scratch-canvas/PaintCanvas'
import ScratchCanvas from '@/components/scratch-canvas/ScratchCanvas'

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
    setLayerMode('preset')
  }

  return (
    <main className="min-h-screen bg-background">
      {step === 'size-pick' && (
        <SizePicker onSelect={handleSizeSelect} />
      )}

      {step === 'layer-pick' && canvasSize && layerMode === 'preset' && (
        <PresetPicker
          selectedSize={canvasSize}
          onScratchStart={handleScratchStart}
          onSwitchMode={(mode) => setLayerMode(mode)}
        />
      )}

      {step === 'layer-pick' && canvasSize && layerMode === 'paint' && (
        <PaintCanvas
          selectedSize={canvasSize}
          onScratchStart={handleScratchStart}
          onSwitchMode={(mode) => setLayerMode(mode)}
        />
      )}

      {step === 'scratch' && canvasSize && (
        <ScratchCanvas
          width={canvasSize.width}
          height={canvasSize.height}
          colorDataURL={colorDataURL}
          onReset={handleReset}
        />
      )}
    </main>
  )
}
