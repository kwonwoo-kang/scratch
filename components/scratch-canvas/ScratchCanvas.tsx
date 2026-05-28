'use client'

import { useEffect, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { useScratchCanvas } from '@/hooks/useScratchCanvas'
import { useScratchSound } from '@/hooks/useScratchSound'
import { exportAsPng } from '@/lib/exportCanvas'
import type { ScratchBrushSize, ColorLayerDataURL } from '@/types/scratch-canvas'

const BRUSH_SIZES: ScratchBrushSize[] = [2, 4, 6, 8]

interface ScratchCanvasProps {
  width: number
  height: number
  colorDataURL: ColorLayerDataURL
  onReset: () => void
}

export default function ScratchCanvas({ width, height, colorDataURL, onReset }: ScratchCanvasProps) {
  const [soundEnabled, setSoundEnabled] = useState(true)
  const sound = useScratchSound(soundEnabled)
  const { colorCanvasRef, overlayCanvasRef, brushSize, setBrushSize, handlePointerDown, handlePointerMove, handlePointerUp, handlePointerCancel, resetOverlay } = useScratchCanvas({
    onStrokeStart: sound.start,
    onStrokeTick: sound.tick,
    onStrokeEnd: sound.stop,
  })
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [showRepaintDialog, setShowRepaintDialog] = useState(false)

  useEffect(() => {
    const colorCanvas = colorCanvasRef.current
    if (!colorCanvas) return
    const ctx = colorCanvas.getContext('2d')
    if (!ctx) return

    if (colorDataURL) {
      const img = new Image()
      img.onload = () => ctx.drawImage(img, 0, 0, width, height)
      img.src = colorDataURL
    } else {
      // demo gradient shown when no color layer is provided
      const grad = ctx.createLinearGradient(0, 0, width, 0)
      grad.addColorStop(0, '#e63946')
      grad.addColorStop(0.5, '#a8d5ba')
      grad.addColorStop(1, '#3a86ff')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)
    }
  }, [colorDataURL, width, height, colorCanvasRef])

  useEffect(() => {
    resetOverlay()
  }, [width, height, resetOverlay])

  const scale = Math.min(1, 800 / Math.max(width, height))
  const displayWidth = Math.round(width * scale)
  const displayHeight = Math.round(height * scale)

  return (
    <div className="flex flex-col gap-4 p-4 items-center">
      {/* Action buttons */}
      <div className="flex gap-2 items-center">
        <Button
          variant="outline"
          onClick={() => {
            const overlay = overlayCanvasRef.current
            if (overlay) exportAsPng(colorDataURL, overlay, width, height)
          }}
        >
          저장
        </Button>
        <Button variant="secondary" onClick={() => setShowRepaintDialog(true)}>
          다시 그리기
        </Button>
        <Button variant="destructive" onClick={() => setShowResetDialog(true)}>
          처음부터
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSoundEnabled((v) => !v)}
              aria-label={soundEnabled ? '효과음 끄기' : '효과음 켜기'}
            >
              {soundEnabled ? <Volume2 /> : <VolumeX />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{soundEnabled ? '효과음 끄기' : '효과음 켜기'}</TooltipContent>
        </Tooltip>
      </div>

      {/* Brush size controls */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">선 굵기:</span>
        {BRUSH_SIZES.map((size) => (
          <Button
            key={size}
            variant={brushSize === size ? 'default' : 'outline'}
            size="sm"
            onClick={() => setBrushSize(size)}
            aria-label={`선 굵기 ${size}px`}
          >
            {size}px
          </Button>
        ))}
      </div>

      {/* Canvas stack */}
      <div
        className="relative"
        style={{ width: displayWidth, height: displayHeight }}
      >
        <canvas
          ref={colorCanvasRef}
          width={width}
          height={height}
          style={{ position: 'absolute', top: 0, left: 0, width: displayWidth, height: displayHeight }}
        />
        {/* touch-action: none lets pointer events fire for both mouse and touch */}
        <canvas
          ref={overlayCanvasRef}
          width={width}
          height={height}
          style={{
            position: 'absolute', top: 0, left: 0,
            width: displayWidth, height: displayHeight,
            cursor: 'crosshair', touchAction: 'none',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
        />
      </div>

      {/* Repaint confirm dialog */}
      <Dialog open={showRepaintDialog} onOpenChange={setShowRepaintDialog}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>다시 그릴까요?</DialogTitle>
            <DialogDescription>지금까지 그린 그림이 사라집니다.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRepaintDialog(false)}>취소</Button>
            <Button onClick={() => { setShowRepaintDialog(false); resetOverlay() }}>확인</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset confirm dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>처음부터 시작하시겠어요?</DialogTitle>
            <DialogDescription>지금까지 작업한 내용이 모두 사라집니다.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>취소</Button>
            <Button onClick={() => { setShowResetDialog(false); onReset() }}>확인</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
