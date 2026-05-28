import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeAll } from 'vitest'
import PresetPicker from './PresetPicker'

// jsdom: canvas getContext is not implemented — stub prototype methods
beforeAll(() => {
  const fakeCtx = {
    fillRect: vi.fn(),
    fillStyle: '',
    createLinearGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() }),
    createRadialGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() }),
  }
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(fakeCtx)
  HTMLCanvasElement.prototype.toDataURL = vi.fn().mockReturnValue('data:image/png;base64,stub')
})

const defaultProps = {
  selectedSize: { label: '중형 정사각', width: 800, height: 800 },
  onScratchStart: vi.fn(),
  onSwitchMode: vi.fn(),
}

describe('PresetPicker', () => {
  it('renders two tabs: 프리셋 선택 and 직접 칠하기', () => {
    render(<PresetPicker {...defaultProps} />)
    expect(screen.getByRole('tab', { name: /프리셋 선택/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /직접 칠하기/i })).toBeInTheDocument()
  })

  it('renders all 6 preset cards', () => {
    render(<PresetPicker {...defaultProps} />)
    expect(screen.getByText('무지개')).toBeInTheDocument()
    expect(screen.getByText('야경')).toBeInTheDocument()
    expect(screen.getByText('황금빛 낙조')).toBeInTheDocument()
    expect(screen.getByText('새벽')).toBeInTheDocument()
    expect(screen.getByText('숲')).toBeInTheDocument()
    expect(screen.getByText('파스텔')).toBeInTheDocument()
  })

  it('highlights a preset card when clicked', () => {
    render(<PresetPicker {...defaultProps} />)
    const card = screen.getByText('무지개').closest('[data-preset-card]')!
    fireEvent.click(card)
    expect(card).toHaveAttribute('data-selected', 'true')
  })

  it('renders 스크래치 시작 button', () => {
    render(<PresetPicker {...defaultProps} />)
    expect(screen.getByRole('button', { name: /스크래치 시작/i })).toBeInTheDocument()
  })

  it('calls onSwitchMode("paint") when 직접 칠하기 tab is clicked', () => {
    const onSwitchMode = vi.fn()
    render(<PresetPicker {...defaultProps} onSwitchMode={onSwitchMode} />)
    fireEvent.click(screen.getByRole('tab', { name: /직접 칠하기/i }))
    expect(onSwitchMode).toHaveBeenCalledWith('paint')
  })

  it('calls onScratchStart when 스크래치 시작 is clicked with a preset selected', () => {
    const onScratchStart = vi.fn()
    render(<PresetPicker {...defaultProps} onScratchStart={onScratchStart} />)
    fireEvent.click(screen.getByText('야경').closest('[data-preset-card]')!)
    fireEvent.click(screen.getByRole('button', { name: /스크래치 시작/i }))
    expect(onScratchStart).toHaveBeenCalledWith(expect.any(String))
  })

  it('shows selectedSize badge', () => {
    render(<PresetPicker {...defaultProps} />)
    expect(screen.getByText(/800 × 800/)).toBeInTheDocument()
  })
})
