import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useScratchCanvas } from './useScratchCanvas'
import type React from 'react'
import type { MutableRefObject } from 'react'

function makeCanvas() {
  const canvas = document.createElement('canvas')
  canvas.width = 100
  canvas.height = 100
  canvas.getBoundingClientRect = () => ({
    left: 0, top: 0, width: 100, height: 100,
    right: 100, bottom: 100, x: 0, y: 0, toJSON: () => {},
  })
  canvas.setPointerCapture = vi.fn()
  const ctx = {
    globalCompositeOperation: 'source-over' as GlobalCompositeOperation,
    lineWidth: 0, lineCap: 'round' as CanvasLineCap, lineJoin: 'round' as CanvasLineJoin, fillStyle: '',
    beginPath: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(), stroke: vi.fn(), fill: vi.fn(), arc: vi.fn(), fillRect: vi.fn(),
  }
  vi.spyOn(canvas, 'getContext').mockReturnValue(ctx as unknown as CanvasRenderingContext2D)
  return { canvas, ctx }
}

function makeEvent(canvas: HTMLCanvasElement, pointerId: number, clientX = 10, clientY = 10) {
  return { pointerId, clientX, clientY, currentTarget: canvas } as unknown as React.PointerEvent<HTMLCanvasElement>
}

describe('useScratchCanvas', () => {
  it('initializes with default brush size 4', () => {
    const { result } = renderHook(() => useScratchCanvas())
    expect(result.current.brushSize).toBe(4)
  })

  it('updates brush size when setBrushSize is called', () => {
    const { result } = renderHook(() => useScratchCanvas())
    act(() => result.current.setBrushSize(8))
    expect(result.current.brushSize).toBe(8)
  })

  it('exposes colorCanvasRef and overlayCanvasRef', () => {
    const { result } = renderHook(() => useScratchCanvas())
    expect(result.current.colorCanvasRef).toBeDefined()
    expect(result.current.overlayCanvasRef).toBeDefined()
  })

  it('exposes resetOverlay function', () => {
    const { result } = renderHook(() => useScratchCanvas())
    expect(typeof result.current.resetOverlay).toBe('function')
  })

  describe('multi-touch guard', () => {
    it('ignores second pointerdown while first is active', () => {
      const { result } = renderHook(() => useScratchCanvas())
      const { canvas, ctx } = makeCanvas()
      ;(result.current.overlayCanvasRef as MutableRefObject<HTMLCanvasElement>).current = canvas

      act(() => { result.current.handlePointerDown(makeEvent(canvas, 1)) })
      const callsAfterFirst = ctx.beginPath.mock.calls.length

      act(() => { result.current.handlePointerDown(makeEvent(canvas, 2)) })

      expect(ctx.beginPath.mock.calls.length).toBe(callsAfterFirst)
    })

    it('ignores pointermove from a different pointerId', () => {
      const { result } = renderHook(() => useScratchCanvas())
      const { canvas, ctx } = makeCanvas()
      ;(result.current.overlayCanvasRef as MutableRefObject<HTMLCanvasElement>).current = canvas

      act(() => { result.current.handlePointerDown(makeEvent(canvas, 1)) })
      const callsAfterDown = ctx.beginPath.mock.calls.length

      act(() => { result.current.handlePointerMove(makeEvent(canvas, 2, 20, 20)) })

      expect(ctx.beginPath.mock.calls.length).toBe(callsAfterDown)
    })

    it('ignores pointerup from a different pointerId — first pointer drawing continues', () => {
      const { result } = renderHook(() => useScratchCanvas())
      const { canvas, ctx } = makeCanvas()
      ;(result.current.overlayCanvasRef as MutableRefObject<HTMLCanvasElement>).current = canvas

      act(() => {
        result.current.handlePointerDown(makeEvent(canvas, 1))
        result.current.handlePointerUp(makeEvent(canvas, 2))
      })
      const callsBefore = ctx.beginPath.mock.calls.length

      act(() => { result.current.handlePointerMove(makeEvent(canvas, 1, 30, 30)) })

      expect(ctx.beginPath.mock.calls.length).toBeGreaterThan(callsBefore)
    })

    it('accepts new pointerdown after pointercancel releases the active pointer', () => {
      const { result } = renderHook(() => useScratchCanvas())
      const { canvas, ctx } = makeCanvas()
      ;(result.current.overlayCanvasRef as MutableRefObject<HTMLCanvasElement>).current = canvas

      act(() => {
        result.current.handlePointerDown(makeEvent(canvas, 1))
        result.current.handlePointerCancel(makeEvent(canvas, 1))
      })
      const callsAfterCancel = ctx.beginPath.mock.calls.length

      act(() => { result.current.handlePointerDown(makeEvent(canvas, 2)) })

      expect(ctx.beginPath.mock.calls.length).toBeGreaterThan(callsAfterCancel)
    })
  })
})
