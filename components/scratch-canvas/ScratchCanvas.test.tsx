import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ScratchCanvas from './ScratchCanvas'

vi.mock('@/lib/sound-engine', () => ({
  getAudioContext: vi.fn(() => ({
    state: 'running',
    currentTime: 0,
    resume: vi.fn(),
    createBufferSource: vi.fn(() => ({
      buffer: null, playbackRate: { value: 1 }, connect: vi.fn(), start: vi.fn(), stop: vi.fn(), onended: null,
    })),
    createGain: vi.fn(() => ({
      gain: { value: 1, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    })),
    destination: {},
  })),
  decodeAudioData: vi.fn().mockResolvedValue({ duration: 0.5 }),
}))

const defaultProps = {
  width: 800,
  height: 800,
  colorDataURL: '',
  onReset: vi.fn(),
}

describe('ScratchCanvas', () => {
  it('renders 선 굵기 label and 4 brush size buttons (2, 4, 6, 8)', () => {
    render(<ScratchCanvas {...defaultProps} />)
    expect(screen.getByText('선 굵기:')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '선 굵기 2px' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '선 굵기 4px' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '선 굵기 6px' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '선 굵기 8px' })).toBeInTheDocument()
  })

  it('renders Save, Repaint, and Reset buttons in order', () => {
    render(<ScratchCanvas {...defaultProps} />)
    expect(screen.getByRole('button', { name: /저장/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /다시 그리기/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /처음부터/i })).toBeInTheDocument()
  })

  it('has no Undo button (invariant rule)', () => {
    render(<ScratchCanvas {...defaultProps} />)
    expect(screen.queryByRole('button', { name: /되돌리기|undo/i })).not.toBeInTheDocument()
  })

  it('has no back-to-coloring button (one-way flow invariant)', () => {
    render(<ScratchCanvas {...defaultProps} />)
    expect(screen.queryByRole('button', { name: /색칠|프리셋|직접 칠하기/i })).not.toBeInTheDocument()
  })

  it('renders sound toggle button and toggles aria-label', () => {
    render(<ScratchCanvas {...defaultProps} />)
    const toggle = screen.getByRole('button', { name: /효과음 끄기/i })
    expect(toggle).toBeInTheDocument()
    fireEvent.click(toggle)
    expect(screen.getByRole('button', { name: /효과음 켜기/i })).toBeInTheDocument()
  })

  describe('처음부터 dialog', () => {
    it('shows dialog when 처음부터 is clicked', () => {
      render(<ScratchCanvas {...defaultProps} />)
      fireEvent.click(screen.getByRole('button', { name: /처음부터/i }))
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText(/처음부터 시작하시겠어요/i)).toBeInTheDocument()
    })

    it('closes dialog on 취소 click', () => {
      render(<ScratchCanvas {...defaultProps} />)
      fireEvent.click(screen.getByRole('button', { name: /처음부터/i }))
      fireEvent.click(screen.getByRole('button', { name: /취소/i }))
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('calls onReset when dialog 확인 is clicked', () => {
      const onReset = vi.fn()
      render(<ScratchCanvas {...defaultProps} onReset={onReset} />)
      fireEvent.click(screen.getByRole('button', { name: /처음부터/i }))
      fireEvent.click(screen.getByRole('button', { name: /^확인$/i }))
      expect(onReset).toHaveBeenCalled()
    })
  })

  describe('다시 그리기 dialog', () => {
    it('shows dialog when 다시 그리기 is clicked', () => {
      render(<ScratchCanvas {...defaultProps} />)
      fireEvent.click(screen.getByRole('button', { name: /다시 그리기/i }))
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText(/다시 그릴까요/i)).toBeInTheDocument()
    })

    it('closes dialog on 취소 click', () => {
      render(<ScratchCanvas {...defaultProps} />)
      fireEvent.click(screen.getByRole('button', { name: /다시 그리기/i }))
      fireEvent.click(screen.getByRole('button', { name: /취소/i }))
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('does not call onReset when 다시 그리기 확인 is clicked (step preserved)', () => {
      const onReset = vi.fn()
      render(<ScratchCanvas {...defaultProps} onReset={onReset} />)
      fireEvent.click(screen.getByRole('button', { name: /다시 그리기/i }))
      fireEvent.click(screen.getByRole('button', { name: /^확인$/i }))
      expect(onReset).not.toHaveBeenCalled()
    })

    it('closes dialog after 확인 click', () => {
      render(<ScratchCanvas {...defaultProps} />)
      fireEvent.click(screen.getByRole('button', { name: /다시 그리기/i }))
      fireEvent.click(screen.getByRole('button', { name: /^확인$/i }))
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
})
