import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import StartScreen from './StartScreen'

describe('StartScreen', () => {
  it('renders the title', () => {
    render(<StartScreen onStart={vi.fn()} />)
    expect(screen.getByRole('heading', { name: /스크래치 캔버스/i })).toBeInTheDocument()
  })

  it('renders sample image', () => {
    render(<StartScreen onStart={vi.fn()} />)
    expect(screen.getByAltText(/스크래치 예시/i)).toBeInTheDocument()
  })

  it('renders usage instructions', () => {
    render(<StartScreen onStart={vi.fn()} />)
    expect(screen.getByText(/캔버스 크기를 고르세요/i)).toBeInTheDocument()
    expect(screen.getByText(/배경 색을 칠하세요/i)).toBeInTheDocument()
    expect(screen.getByText(/손가락으로 긁어/i)).toBeInTheDocument()
  })

  it('renders 시작하기 button', () => {
    render(<StartScreen onStart={vi.fn()} />)
    expect(screen.getByRole('button', { name: /시작하기/i })).toBeInTheDocument()
  })

  it('calls onStart when 시작하기 is clicked', () => {
    const onStart = vi.fn()
    render(<StartScreen onStart={onStart} />)
    fireEvent.click(screen.getByRole('button', { name: /시작하기/i }))
    expect(onStart).toHaveBeenCalledOnce()
  })
})
