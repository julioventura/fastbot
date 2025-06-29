/**
 * Testes para o componente Input
 * 
 * Este arquivo contém testes abrangentes para o componente Input,
 * validando renderização, tipos de input, estados, acessibilidade,
 * eventos e forwarding de ref.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { createRef } from 'react';
import { Input } from './input';

describe('Input Component', () => {
  describe('quando renderizado', () => {
    it('deve renderizar um input básico', () => {
      render(<Input />);
      
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input.tagName).toBe('INPUT');
    });

    it('deve aplicar classes CSS padrão', () => {
      render(<Input />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('flex', 'h-10', 'w-full', 'rounded-md');
    });

    it('deve aceitar className personalizada', () => {
      render(<Input className="custom-class" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-class');
      expect(input).toHaveClass('flex'); // deve manter classes padrão
    });

    it('deve renderizar com placeholder', () => {
      render(<Input placeholder="Digite seu nome" />);
      
      const input = screen.getByPlaceholderText('Digite seu nome');
      expect(input).toBeInTheDocument();
    });

    it('deve renderizar com valor inicial', () => {
      render(<Input defaultValue="Valor inicial" />);
      
      const input = screen.getByDisplayValue('Valor inicial');
      expect(input).toBeInTheDocument();
    });
  });

  describe('tipos de input', () => {
    it('deve renderizar como text por padrão', () => {
      render(<Input />);
      
      const input = screen.getByRole('textbox');
      // Input sem type explícito é text por padrão no HTML
      expect(input.getAttribute('type')).toBe(null); // DOM padrão não define o atributo
      expect(input).toHaveProperty('type', 'text'); // Mas a propriedade type é 'text'
    });

    it('deve renderizar como password', () => {
      render(<Input type="password" />);
      
      const input = document.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
    });

    it('deve renderizar como email', () => {
      render(<Input type="email" />);
      
      const input = document.querySelector('input[type="email"]');
      expect(input).toBeInTheDocument();
    });

    it('deve renderizar como number', () => {
      render(<Input type="number" />);
      
      const input = document.querySelector('input[type="number"]');
      expect(input).toBeInTheDocument();
    });

    it('deve renderizar como tel', () => {
      render(<Input type="tel" />);
      
      const input = document.querySelector('input[type="tel"]');
      expect(input).toBeInTheDocument();
    });
  });

  describe('estados e propriedades', () => {
    it('deve ficar desabilitado quando disabled é true', () => {
      render(<Input disabled />);
      
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
      expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });

    it('deve ser somente leitura quando readOnly é true', () => {
      render(<Input readOnly />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('readonly');
    });

    it('deve ser obrigatório quando required é true', () => {
      render(<Input required />);
      
      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
    });

    it('deve aplicar maxLength corretamente', () => {
      render(<Input maxLength={10} />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('maxLength', '10');
    });

    it('deve aplicar minLength corretamente', () => {
      render(<Input minLength={5} />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('minLength', '5');
    });
  });

  describe('interações do usuário', () => {
    it('deve chamar onChange quando o valor muda', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      
      render(<Input onChange={handleChange} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'teste');
      
      expect(handleChange).toHaveBeenCalled();
      expect(handleChange).toHaveBeenCalledTimes(5); // uma para cada caractere
    });

    it('deve chamar onFocus quando focado', async () => {
      const handleFocus = vi.fn();
      const user = userEvent.setup();
      
      render(<Input onFocus={handleFocus} />);
      
      const input = screen.getByRole('textbox');
      await user.click(input);
      
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('deve chamar onBlur quando perde o foco', async () => {
      const handleBlur = vi.fn();
      const user = userEvent.setup();
      
      render(
        <div>
          <Input onBlur={handleBlur} />
          <button>Outro elemento</button>
        </div>
      );
      
      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button');
      
      await user.click(input);
      await user.click(button);
      
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('deve chamar onKeyDown quando tecla é pressionada', async () => {
      const handleKeyDown = vi.fn();
      const user = userEvent.setup();
      
      render(<Input onKeyDown={handleKeyDown} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'a');
      
      expect(handleKeyDown).toHaveBeenCalled();
    });

    it('deve permitir digitação normal', async () => {
      const user = userEvent.setup();
      
      render(<Input />);
      
      const input = screen.getByRole('textbox') as HTMLInputElement;
      await user.type(input, 'Texto de teste');
      
      expect(input.value).toBe('Texto de teste');
    });
  });

  describe('acessibilidade', () => {
    it('deve ter role textbox por padrão', () => {
      render(<Input />);
      
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('deve suportar aria-label', () => {
      render(<Input aria-label="Campo de nome" />);
      
      const input = screen.getByLabelText('Campo de nome');
      expect(input).toBeInTheDocument();
    });

    it('deve suportar aria-describedby', () => {
      render(
        <div>
          <Input aria-describedby="help-text" />
          <div id="help-text">Texto de ajuda</div>
        </div>
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'help-text');
    });

    it('deve suportar id personalizado', () => {
      render(<Input id="custom-input" />);
      
      const input = document.getElementById('custom-input');
      expect(input).toBeInTheDocument();
    });

    it('deve ser acessível via teclado', async () => {
      const user = userEvent.setup();
      
      render(<Input />);
      
      const input = screen.getByRole('textbox');
      
      // Tab para focar
      await user.tab();
      expect(input).toHaveFocus();
      
      // Typing deveria funcionar
      await user.keyboard('teste');
      expect(input).toHaveValue('teste');
    });
  });

  describe('ref forwarding', () => {
    it('deve forwardar ref corretamente', () => {
      const inputRef = createRef<HTMLInputElement>();
      
      render(<Input ref={inputRef} />);
      
      expect(inputRef.current).toBeInstanceOf(HTMLInputElement);
      expect(inputRef.current?.tagName).toBe('INPUT');
    });

    it('deve permitir acesso aos métodos do input via ref', () => {
      const inputRef = createRef<HTMLInputElement>();
      
      render(<Input ref={inputRef} />);
      
      // Testar método focus
      expect(() => inputRef.current?.focus()).not.toThrow();
      
      // Testar método blur
      expect(() => inputRef.current?.blur()).not.toThrow();
    });
  });

  describe('casos especiais', () => {
    it('deve funcionar com controlled value', async () => {
      const ControlledInput = () => {
        const [value, setValue] = React.useState('');
        return (
          <Input 
            value={value} 
            onChange={(e) => setValue(e.target.value)} 
          />
        );
      };
      
      const user = userEvent.setup();
      render(<ControlledInput />);
      
      const input = screen.getByRole('textbox') as HTMLInputElement;
      await user.type(input, 'controlled');
      
      expect(input.value).toBe('controlled');
    });

    it('deve aplicar atributos HTML nativos', () => {
      render(
        <Input 
          autoComplete="email"
          name="email"
          form="my-form"
          data-testid="input-test"
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('autoComplete', 'email');
      expect(input).toHaveAttribute('name', 'email');
      expect(input).toHaveAttribute('form', 'my-form');
      expect(input).toHaveAttribute('data-testid', 'input-test');
    });

    it('deve lidar com file input corretamente', () => {
      render(<Input type="file" />);
      
      const input = document.querySelector('input[type="file"]');
      expect(input).toBeInTheDocument();
      expect(input).toHaveClass('file:border-0', 'file:bg-transparent');
    });
  });
});
