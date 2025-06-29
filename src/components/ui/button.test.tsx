import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/utils/test-utils'
import userEvent from '@testing-library/user-event'
import { Button } from './button'

describe('Button Component', () => {
  describe('quando renderizado', () => {
    it('deve renderizar com o texto correto', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
    })

    it('deve aplicar a variante default por padrão', () => {
      render(<Button>Default Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-primary')
    })

    it('deve aplicar variantes corretamente', () => {
      const { rerender } = render(<Button variant="destructive">Delete</Button>)
      let button = screen.getByRole('button')
      expect(button).toHaveClass('bg-destructive')

      rerender(<Button variant="outline">Outline</Button>)
      button = screen.getByRole('button')
      expect(button).toHaveClass('border', 'border-input')

      rerender(<Button variant="secondary">Secondary</Button>)
      button = screen.getByRole('button')
      expect(button).toHaveClass('bg-secondary')
    })

    it('deve aplicar tamanhos corretamente', () => {
      const { rerender } = render(<Button size="sm">Small</Button>)
      let button = screen.getByRole('button')
      expect(button).toHaveClass('h-9')

      rerender(<Button size="lg">Large</Button>)
      button = screen.getByRole('button')
      expect(button).toHaveClass('h-11')

      rerender(<Button size="icon">Icon</Button>)
      button = screen.getByRole('button')
      expect(button).toHaveClass('h-10', 'w-10')
    })

    it('deve ficar desabilitado quando a prop disabled é true', () => {
      render(<Button disabled>Disabled Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50')
    })
  })

  describe('quando usuário interage', () => {
    it('deve chamar onClick quando clicado', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      
      render(<Button onClick={handleClick}>Click me</Button>)
      
      await user.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('não deve chamar onClick quando desabilitado', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      
      render(<Button onClick={handleClick} disabled>Disabled</Button>)
      
      await user.click(screen.getByRole('button'))
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('deve receber foco corretamente', async () => {
      const user = userEvent.setup()
      
      render(<Button>Focusable Button</Button>)
      const button = screen.getByRole('button')
      
      await user.tab()
      expect(button).toHaveFocus()
    })
  })

  describe('quando personalizado', () => {
    it('deve aceitar className personalizada', () => {
      render(<Button className="custom-class">Custom</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })

    it('deve aceitar outras props HTML', () => {
      render(<Button type="submit" data-testid="submit-btn">Submit</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'submit')
      expect(button).toHaveAttribute('data-testid', 'submit-btn')
    })
  })
})
