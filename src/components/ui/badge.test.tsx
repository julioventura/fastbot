import { render, screen } from '@/test/utils/test-utils'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { Badge } from './badge'

describe('Badge Component', () => {
  describe('quando renderizado', () => {
    it('deve exibir o conteúdo fornecido', () => {
      render(<Badge>Test Badge</Badge>)
      expect(screen.getByText('Test Badge')).toBeInTheDocument()
    })

    it('deve renderizar como um elemento div', () => {
      render(<Badge>Badge</Badge>)
      expect(screen.getByText('Badge')).toHaveProperty('tagName', 'DIV')
    })

    it('deve aplicar classes CSS padrão', () => {
      render(<Badge>Badge</Badge>)
      const badge = screen.getByText('Badge')
      expect(badge).toHaveClass('inline-flex', 'items-center', 'rounded-full', 'border', 'px-2.5', 'py-0.5', 'text-xs', 'font-semibold')
    })
  })

  describe('variantes de estilo', () => {
    it('deve aplicar variant default por padrão', () => {
      render(<Badge>Default</Badge>)
      const badge = screen.getByText('Default')
      expect(badge).toHaveClass('border-transparent', 'bg-primary', 'text-primary-foreground')
    })

    it('deve aplicar variant secondary', () => {
      render(<Badge variant="secondary">Secondary</Badge>)
      const badge = screen.getByText('Secondary')
      expect(badge).toHaveClass('border-transparent', 'bg-secondary', 'text-secondary-foreground')
    })

    it('deve aplicar variant destructive', () => {
      render(<Badge variant="destructive">Destructive</Badge>)
      const badge = screen.getByText('Destructive')
      expect(badge).toHaveClass('border-transparent', 'bg-destructive', 'text-destructive-foreground')
    })

    it('deve aplicar variant outline', () => {
      render(<Badge variant="outline">Outline</Badge>)
      const badge = screen.getByText('Outline')
      expect(badge).toHaveClass('text-foreground')
    })
  })

  describe('customização', () => {
    it('deve aceitar className customizada', () => {
      render(<Badge className="custom-class">Custom</Badge>)
      const badge = screen.getByText('Custom')
      expect(badge).toHaveClass('custom-class')
    })

    it('deve manter classes padrão quando className é fornecida', () => {
      render(<Badge className="custom-class">Custom</Badge>)
      const badge = screen.getByText('Custom')
      expect(badge).toHaveClass('inline-flex', 'custom-class')
    })

    it('deve aceitar props HTML padrão', () => {
      render(
        <Badge data-testid="badge" title="Badge title">
          Props Test
        </Badge>
      )
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveAttribute('title', 'Badge title')
    })
  })

  describe('acessibilidade', () => {
    it('deve ter role adequado para elementos informativos', () => {
      render(<Badge role="status">Status Badge</Badge>)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('deve suportar aria-label', () => {
      render(<Badge aria-label="Badge description">Badge</Badge>)
      const badge = screen.getByLabelText('Badge description')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('conteúdo', () => {
    it('deve renderizar conteúdo de texto simples', () => {
      render(<Badge>Simple text</Badge>)
      expect(screen.getByText('Simple text')).toBeInTheDocument()
    })

    it('deve renderizar conteúdo JSX', () => {
      render(
        <Badge>
          <span>Complex</span> content
        </Badge>
      )
      expect(screen.getByText('Complex')).toBeInTheDocument()
      expect(screen.getByText('content')).toBeInTheDocument()
    })

    it('deve renderizar badges vazios', () => {
      render(<Badge data-testid="empty-badge"></Badge>)
      const badge = screen.getByTestId('empty-badge')
      expect(badge).toBeInTheDocument()
      expect(badge).toBeEmptyDOMElement()
    })
  })

  describe('interações', () => {
    it('deve suportar evento onClick quando fornecido', () => {
      const handleClick = vi.fn()
      render(<Badge onClick={handleClick}>Clickable</Badge>)
      
      const badge = screen.getByText('Clickable')
      badge.click()
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('deve suportar eventos de teclado', async () => {
      const user = userEvent.setup()
      const handleKeyDown = vi.fn()
      render(<Badge onKeyDown={handleKeyDown} tabIndex={0}>Keyboard</Badge>)
      
      const badge = screen.getByText('Keyboard')
      badge.focus()
      
      // Usar userEvent para simular tecla Enter
      await user.keyboard('{Enter}')
      expect(handleKeyDown).toHaveBeenCalledTimes(1)
    })

    it('deve ter foco quando focusable', () => {
      render(<Badge tabIndex={0}>Focusable</Badge>)
      const badge = screen.getByText('Focusable')
      badge.focus()
      expect(badge).toHaveFocus()
    })
  })
})
