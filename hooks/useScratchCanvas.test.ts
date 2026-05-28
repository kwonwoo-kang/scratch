import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
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
  canvas.releasePointerCapture = vi.fn()
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

  describe('multi-touch pan', () => {
    it('2nd pointer down stops drawing (no additional scratchStroke)', () => {
      const { result } = renderHook(() => useScratchCanvas())
      const { canvas, ctx } = makeCanvas()
      ;(result.current.overlayCanvasRef as MutableRefObject<HTMLCanvasElement>).current = canvas

      act(() => { result.current.handlePointerDown(makeEvent(canvas, 1)) })
      const callsAfterFirst = ctx.beginPath.mock.calls.length

      act(() => { result.current.handlePointerDown(makeEvent(canvas, 2)) })

      expect(ctx.beginPath.mock.calls.length).toBe(callsAfterFirst)
    })

    it('pointermove with 2 pointers calls onPan with both X and Y delta', () => {
      const onPan = vi.fn()
      const { result } = renderHook(() => useScratchCanvas({ onPan }))
      const { canvas } = makeCanvas()
      ;(result.current.overlayCanvasRef as MutableRefObject<HTMLCanvasElement>).current = canvas

      act(() => {
        result.current.handlePointerDown(makeEvent(canvas, 1, 10, 100))
        result.current.handlePointerDown(makeEvent(canvas, 2, 50, 200))
      })
      // centroid = (30, 150)
      act(() => {
        result.current.handlePointerMove(makeEvent(canvas, 1, 20, 110))
        // after move: pointer1=(20,110), pointer2=(50,200) → centroid=(35,155), deltaX=5, deltaY=5
      })

      expect(onPan).toHaveBeenCalledWith(5, 5)
    })

    it('pointermove with single pointer does not call onPan', () => {
      const onPan = vi.fn()
      const { result } = renderHook(() => useScratchCanvas({ onPan }))
      const { canvas } = makeCanvas()
      ;(result.current.overlayCanvasRef as MutableRefObject<HTMLCanvasElement>).current = canvas

      act(() => { result.current.handlePointerDown(makeEvent(canvas, 1, 10, 10)) })
      act(() => { result.current.handlePointerMove(makeEvent(canvas, 1, 10, 30)) })

      expect(onPan).not.toHaveBeenCalled()
    })

    it('after 2→1 finger, remaining finger move does not draw', () => {
      const { result } = renderHook(() => useScratchCanvas())
      const { canvas, ctx } = makeCanvas()
      ;(result.current.overlayCanvasRef as MutableRefObject<HTMLCanvasElement>).current = canvas

      act(() => {
        result.current.handlePointerDown(makeEvent(canvas, 1))
        result.current.handlePointerDown(makeEvent(canvas, 2))
        result.current.handlePointerUp(makeEvent(canvas, 2))
      })
      const callsBefore = ctx.beginPath.mock.calls.length

      act(() => { result.current.handlePointerMove(makeEvent(canvas, 1, 50, 50)) })

      expect(ctx.beginPath.mock.calls.length).toBe(callsBefore)
    })

    it('after all pointers lifted, new pointerdown resumes drawing', () => {
      const { result } = renderHook(() => useScratchCanvas())
      const { canvas, ctx } = makeCanvas()
      ;(result.current.overlayCanvasRef as MutableRefObject<HTMLCanvasElement>).current = canvas

      act(() => {
        result.current.handlePointerDown(makeEvent(canvas, 1))
        result.current.handlePointerDown(makeEvent(canvas, 2))
        result.current.handlePointerUp(makeEvent(canvas, 1))
        result.current.handlePointerUp(makeEvent(canvas, 2))
      })
      const callsAfterLift = ctx.beginPath.mock.calls.length

      act(() => { result.current.handlePointerDown(makeEvent(canvas, 3)) })

      expect(ctx.beginPath.mock.calls.length).toBeGreaterThan(callsAfterLift)
    })

    it('accepts new drawing after pointercancel releases all pointers', () => {
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

    it('ignores pointermove from unregistered pointerId', () => {
      const { result } = renderHook(() => useScratchCanvas())
      const { canvas, ctx } = makeCanvas()
      ;(result.current.overlayCanvasRef as MutableRefObject<HTMLCanvasElement>).current = canvas

      act(() => { result.current.handlePointerDown(makeEvent(canvas, 1)) })
      const callsAfterDown = ctx.beginPath.mock.calls.length

      act(() => { result.current.handlePointerMove(makeEvent(canvas, 99, 20, 20)) })

      expect(ctx.beginPath.mock.calls.length).toBe(callsAfterDown)
    })
  })
})
