import React from 'react'
import { render, screen } from '@/test/utils/test-utils'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { Textarea } from './textarea'

describe('Textarea Component', () => {
  describe('quando renderizado', () => {
    it('deve renderizar como elemento textarea', () => {
      render(<Textarea placeholder="Digite aqui..." />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeInTheDocument()
      expect(textarea.tagName).toBe('TEXTAREA')
    })

    it('deve aplicar classes CSS padrão', () => {
      render(<Textarea />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveClass(
        'flex',
        'min-h-[80px]',
        'w-full',
        'rounded-md',
        'border',
        'border-input',
        'bg-background',
        'px-3',
        'py-2',
        'text-sm',
        'ring-offset-background'
      )
    })

    it('deve ter altura mínima configurada', () => {
      render(<Textarea />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveClass('min-h-[80px]')
    })
  })

  describe('propriedades básicas', () => {
    it('deve exibir placeholder', () => {
      render(<Textarea placeholder="Digite sua mensagem..." />)
      expect(screen.getByPlaceholderText('Digite sua mensagem...')).toBeInTheDocument()
    })

    it('deve aceitar valor inicial', () => {
      render(<Textarea defaultValue="Texto inicial" />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveValue('Texto inicial')
    })

    it('deve ser controlado com value e onChange', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      
      render(<Textarea value="texto controlado" onChange={handleChange} />)
      const textarea = screen.getByRole('textbox')
      
      expect(textarea).toHaveValue('texto controlado')
      
      await user.type(textarea, ' extra')
      expect(handleChange).toHaveBeenCalled()
    })

    it('deve suportar atributo name', () => {
      render(<Textarea name="description" />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('name', 'description')
    })

    it('deve suportar atributo id', () => {
      render(<Textarea id="message-input" />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('id', 'message-input')
    })
  })

  describe('estados', () => {
    it('deve ser desabilitado quando disabled=true', () => {
      render(<Textarea disabled placeholder="Desabilitado" />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeDisabled()
      expect(textarea).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
    })

    it('deve ser readonly quando readOnly=true', () => {
      render(<Textarea readOnly defaultValue="Apenas leitura" />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('readonly')
    })

    it('deve ser obrigatório quando required=true', () => {
      render(<Textarea required />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeRequired()
    })

    it('deve ter foco quando autoFocus=true', () => {
      render(<Textarea autoFocus />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveFocus()
    })
  })

  describe('interações do usuário', () => {
    it('deve aceitar digitação', async () => {
      const user = userEvent.setup()
      render(<Textarea />)
      const textarea = screen.getByRole('textbox')
      
      await user.type(textarea, 'Teste de digitação')
      expect(textarea).toHaveValue('Teste de digitação')
    })

    it('deve aceitar texto multilinhas', async () => {
      const user = userEvent.setup()
      render(<Textarea />)
      const textarea = screen.getByRole('textbox')
      
      await user.type(textarea, 'Linha 1{enter}Linha 2{enter}Linha 3')
      expect(textarea).toHaveValue('Linha 1\nLinha 2\nLinha 3')
    })

    it('deve responder a eventos de foco', async () => {
      const user = userEvent.setup()
      const handleFocus = vi.fn()
      const handleBlur = vi.fn()
      
      render(<Textarea onFocus={handleFocus} onBlur={handleBlur} />)
      const textarea = screen.getByRole('textbox')
      
      await user.click(textarea)
      expect(handleFocus).toHaveBeenCalledTimes(1)
      
      await user.tab()
      expect(handleBlur).toHaveBeenCalledTimes(1)
    })

    it('deve responder a eventos de teclado', async () => {
      const user = userEvent.setup()
      const handleKeyDown = vi.fn()
      const handleKeyUp = vi.fn()
      
      render(<Textarea onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} />)
      const textarea = screen.getByRole('textbox')
      
      await user.type(textarea, 'a')
      expect(handleKeyDown).toHaveBeenCalled()
      expect(handleKeyUp).toHaveBeenCalled()
    })

    it('deve permitir seleção de texto', async () => {
      const user = userEvent.setup()
      render(<Textarea defaultValue="Texto para seleção" />)
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
      
      await user.click(textarea)
      textarea.setSelectionRange(0, 5) // Selecionar "Texto"
      
      expect(textarea.selectionStart).toBe(0)
      expect(textarea.selectionEnd).toBe(5)
    })
  })

  describe('customização', () => {
    it('deve aceitar className customizada', () => {
      render(<Textarea className="custom-textarea" />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveClass('custom-textarea')
      expect(textarea).toHaveClass('flex') // mantém classes padrão
    })

    it('deve aceitar rows customizado', () => {
      render(<Textarea rows={10} />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('rows', '10')
    })

    it('deve aceitar cols customizado', () => {
      render(<Textarea cols={50} />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('cols', '50')
    })

    it('deve aceitar maxLength', () => {
      render(<Textarea maxLength={100} />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('maxlength', '100')
    })

    it('deve encaminhar ref corretamente', () => {
      const ref = React.createRef<HTMLTextAreaElement>()
      render(<Textarea ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
    })
  })

  describe('acessibilidade', () => {
    it('deve funcionar com label associado', async () => {
      const user = userEvent.setup()
      render(
        <div>
          <label htmlFor="message">Mensagem</label>
          <Textarea id="message" />
        </div>
      )
      
      const label = screen.getByText('Mensagem')
      const textarea = screen.getByLabelText('Mensagem')
      
      await user.click(label)
      expect(textarea).toHaveFocus()
    })

    it('deve suportar aria-describedby', () => {
      render(
        <div>
          <Textarea aria-describedby="help-text" />
          <div id="help-text">Texto de ajuda</div>
        </div>
      )
      
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('aria-describedby', 'help-text')
    })

    it('deve suportar aria-label', () => {
      render(<Textarea aria-label="Campo de descrição" />)
      const textarea = screen.getByLabelText('Campo de descrição')
      expect(textarea).toBeInTheDocument()
    })

    it('deve suportar aria-invalid para validação', () => {
      render(<Textarea aria-invalid="true" />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('aria-invalid', 'true')
    })
  })

  describe('validação e formulários', () => {
    it('deve funcionar em formulário', async () => {
      const user = userEvent.setup()
      const handleSubmit = vi.fn((e) => e.preventDefault())
      
      render(
        <form onSubmit={handleSubmit}>
          <Textarea name="description" required />
          <button type="submit">Enviar</button>
        </form>
      )
      
      const textarea = screen.getByRole('textbox')
      const button = screen.getByRole('button')
      
      await user.type(textarea, 'Descrição do formulário')
      await user.click(button)
      
      expect(handleSubmit).toHaveBeenCalledTimes(1)
    })

    it('deve respeitar validação HTML5', async () => {
      const user = userEvent.setup()
      render(<Textarea required />)
      const textarea = screen.getByRole('textbox')
      
      // Campo vazio deve ser inválido
      expect(textarea).toBeInvalid()
      
      // Após preencher deve ser válido
      await user.type(textarea, 'Conteúdo válido')
      expect(textarea).toBeValid()
    })

    it('deve funcionar com title de validação', () => {
      render(<Textarea title="Campo de descrição" />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('title', 'Campo de descrição')
    })
  })

  describe('casos especiais', () => {
    it('deve funcionar sem props', () => {
      render(<Textarea />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeInTheDocument()
    })

    it('deve manter displayName correto', () => {
      expect(Textarea.displayName).toBe('Textarea')
    })

    it('deve suportar data attributes', () => {
      render(<Textarea data-testid="test-textarea" data-custom="value" />)
      const textarea = screen.getByTestId('test-textarea')
      expect(textarea).toHaveAttribute('data-custom', 'value')
    })

    it('deve suportar resize via CSS', () => {
      render(<Textarea className="resize-none" />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveClass('resize-none')
    })
  })
})
