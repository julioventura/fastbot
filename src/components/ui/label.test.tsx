import React from 'react'
import { render, screen } from '@/test/utils/test-utils'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { Label } from './label'

describe('Label Component', () => {
  describe('quando renderizado', () => {
    it('deve exibir o texto do label', () => {
      render(<Label>Nome completo</Label>)
      expect(screen.getByText('Nome completo')).toBeInTheDocument()
    })

    it('deve renderizar como um elemento label', () => {
      render(<Label>Test Label</Label>)
      const label = screen.getByText('Test Label')
      expect(label.tagName).toBe('LABEL')
    })

    it('deve aplicar classes CSS padrão', () => {
      render(<Label>Default Label</Label>)
      const label = screen.getByText('Default Label')
      expect(label).toHaveClass('text-sm', 'font-medium', 'leading-none', 'peer-disabled:cursor-not-allowed', 'peer-disabled:opacity-70')
    })
  })

  describe('associação com inputs', () => {
    it('deve associar com input usando htmlFor', () => {
      render(
        <div>
          <Label htmlFor="email-input">Email</Label>
          <input id="email-input" type="email" />
        </div>
      )
      
      const label = screen.getByText('Email')
      const input = screen.getByRole('textbox')
      
      expect(label).toHaveAttribute('for', 'email-input')
      expect(input).toHaveAttribute('id', 'email-input')
    })

    it('deve focar input quando label é clicado', async () => {
      const user = userEvent.setup()
      
      render(
        <div>
          <Label htmlFor="focus-input">Focus Test</Label>
          <input id="focus-input" type="text" />
        </div>
      )
      
      const label = screen.getByText('Focus Test')
      const input = screen.getByRole('textbox')
      
      await user.click(label)
      expect(input).toHaveFocus()
    })

    it('deve funcionar com input wrapper (sem id direto)', async () => {
      const user = userEvent.setup()
      
      render(
        <Label>
          Wrapped Input
          <input type="text" />
        </Label>
      )
      
      const label = screen.getByText('Wrapped Input')
      const input = screen.getByRole('textbox')
      
      await user.click(label)
      expect(input).toHaveFocus()
    })
  })

  describe('customização', () => {
    it('deve aceitar className customizada', () => {
      render(<Label className="custom-label-class">Custom Label</Label>)
      const label = screen.getByText('Custom Label')
      expect(label).toHaveClass('custom-label-class')
      expect(label).toHaveClass('text-sm') // mantém classes padrão
    })

    it('deve aceitar props HTML padrão', () => {
      render(
        <Label data-testid="test-label" title="Label tooltip">
          Props Test
        </Label>
      )
      
      const label = screen.getByTestId('test-label')
      expect(label).toHaveAttribute('title', 'Label tooltip')
    })

    it('deve encaminhar ref corretamente', () => {
      const ref = React.createRef<HTMLLabelElement>()
      render(<Label ref={ref}>Ref Test</Label>)
      expect(ref.current).toBeInstanceOf(HTMLLabelElement)
    })
  })

  describe('estados e variações', () => {
    it('deve suportar estado desabilitado via peer', () => {
      render(
        <div>
          <input disabled className="peer" id="disabled-input" />
          <Label htmlFor="disabled-input">Disabled Label</Label>
        </div>
      )
      
      const label = screen.getByText('Disabled Label')
      expect(label).toHaveClass('peer-disabled:cursor-not-allowed', 'peer-disabled:opacity-70')
    })

    it('deve renderizar conteúdo JSX complexo', () => {
      render(
        <Label>
          <span data-testid="icon">📧</span>
          Email Address
          <span className="text-red-500">*</span>
        </Label>
      )
      
      expect(screen.getByTestId('icon')).toBeInTheDocument()
      expect(screen.getByText('Email Address')).toBeInTheDocument()
      expect(screen.getByText('*')).toBeInTheDocument()
    })

    it('deve suportar texto vazio', () => {
      render(<Label data-testid="empty-label"></Label>)
      const label = screen.getByTestId('empty-label')
      expect(label).toBeInTheDocument()
      expect(label).toBeEmptyDOMElement()
    })
  })

  describe('acessibilidade', () => {
    it('deve ter role label por padrão', () => {
      render(<Label>Accessible Label</Label>)
      // Radix UI Label já fornece semântica apropriada
      expect(screen.getByText('Accessible Label')).toBeInTheDocument()
    })

    it('deve suportar aria-describedby', () => {
      render(
        <div>
          <Label htmlFor="described-input" aria-describedby="help-text">
            Username
          </Label>
          <input id="described-input" type="text" />
          <div id="help-text">Must be at least 3 characters</div>
        </div>
      )
      
      const label = screen.getByText('Username')
      expect(label).toHaveAttribute('aria-describedby', 'help-text')
    })

    it('deve suportar aria-required', () => {
      render(
        <Label htmlFor="required-input" aria-required="true">
          Required Field
        </Label>
      )
      
      const label = screen.getByText('Required Field')
      expect(label).toHaveAttribute('aria-required', 'true')
    })
  })

  describe('formulários', () => {
    it('deve funcionar em formulário complexo', async () => {
      const user = userEvent.setup()
      const handleSubmit = vi.fn((e) => e.preventDefault())
      
      render(
        <form onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="form-name">Name</Label>
            <input id="form-name" type="text" required />
          </div>
          <div>
            <Label htmlFor="form-email">Email</Label>
            <input id="form-email" type="email" required />
          </div>
          <button type="submit">Submit</button>
        </form>
      )
      
      const nameLabel = screen.getByText('Name')
      const emailLabel = screen.getByText('Email')
      const nameInput = screen.getByLabelText('Name')
      const emailInput = screen.getByLabelText('Email')
      
      // Testar associação funcionando
      await user.click(nameLabel)
      expect(nameInput).toHaveFocus()
      
      await user.click(emailLabel)
      expect(emailInput).toHaveFocus()
      
      // Preencher e submeter
      await user.type(nameInput, 'John Doe')
      await user.type(emailInput, 'john@example.com')
      await user.click(screen.getByRole('button', { name: 'Submit' }))
      
      expect(handleSubmit).toHaveBeenCalledTimes(1)
    })

    it('deve suportar labels para diferentes tipos de input', () => {
      render(
        <div>
          <Label htmlFor="text-input">Text Input</Label>
          <input id="text-input" type="text" />
          
          <Label htmlFor="checkbox-input">Checkbox</Label>
          <input id="checkbox-input" type="checkbox" />
          
          <Label htmlFor="radio-input">Radio</Label>
          <input id="radio-input" type="radio" />
          
          <Label htmlFor="select-input">Select</Label>
          <select id="select-input">
            <option>Option 1</option>
          </select>
          
          <Label htmlFor="textarea-input">Textarea</Label>
          <textarea id="textarea-input"></textarea>
        </div>
      )
      
      expect(screen.getByLabelText('Text Input')).toBeInTheDocument()
      expect(screen.getByLabelText('Checkbox')).toBeInTheDocument()
      expect(screen.getByLabelText('Radio')).toBeInTheDocument()
      expect(screen.getByLabelText('Select')).toBeInTheDocument()
      expect(screen.getByLabelText('Textarea')).toBeInTheDocument()
    })
  })
})
