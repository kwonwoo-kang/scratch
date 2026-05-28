import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useScratchCanvas } from './useScratchCanvas'

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
})
