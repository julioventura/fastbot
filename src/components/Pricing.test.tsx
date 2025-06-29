/**
 * Testes para o componente Pricing
 * 
 * Este arquivo contém testes abrangentes para o componente Pricing,
 * validando a renderização, dados dos planos, badges populares,
 * recursos listados e interações dos botões.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pricing from './Pricing';

// Mock do lucide-react
vi.mock('lucide-react', () => ({
  Check: ({ className }: { className?: string }) => (
    <span data-testid="check-icon" className={className}>✓</span>
  ),
}));

describe('Pricing Component', () => {
  describe('quando renderizado', () => {
    it('deve renderizar a seção de pricing', () => {
      render(<Pricing />);
      
      const pricingSection = document.querySelector('#pricing');
      expect(pricingSection).toBeInTheDocument();
      expect(pricingSection?.tagName).toBe('SECTION');
    });

    it('deve renderizar o título principal', () => {
      render(<Pricing />);
      
      expect(screen.getByText('Assine o Plano Gratuito')).toBeInTheDocument();
      expect(screen.getByText('E comece a usar JÁ!')).toBeInTheDocument();
    });

    it('deve renderizar a estrutura com ID correto', () => {
      render(<Pricing />);
      
      const pricingSection = document.querySelector('#pricing');
      expect(pricingSection).toBeInTheDocument();
      
      const pricingContainer = document.querySelector('#pricing-section');
      expect(pricingContainer).toBeInTheDocument();
    });
  });

  describe('planos de preços', () => {
    it('deve renderizar todos os planos definidos', () => {
      render(<Pricing />);
      
      // Verifica se os nomes dos planos estão presentes
      expect(screen.getByText('Fastbot Gratuito')).toBeInTheDocument();
      expect(screen.getByText('Fastbot Plus')).toBeInTheDocument();
    });

    it('deve exibir os preços corretos', () => {
      render(<Pricing />);
      
      expect(screen.getByText('GRÁTIS')).toBeInTheDocument();
      expect(screen.getByText('R$ 40 / mês')).toBeInTheDocument();
    });

    it('deve exibir as descrições dos planos', () => {
      render(<Pricing />);
      
      expect(screen.getByText('Para uso eventual')).toBeInTheDocument();
      expect(screen.getByText('Para uso ativo')).toBeInTheDocument();
    });

    it('deve renderizar os badges populares', () => {
      render(<Pricing />);
      
      expect(screen.getByText('GRATUITO')).toBeInTheDocument();
      expect(screen.getByText('ASSINATURA')).toBeInTheDocument();
    });

    it('deve renderizar os botões com textos corretos', () => {
      render(<Pricing />);
      
      expect(screen.getByRole('button', { name: /comece já/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /assine já/i })).toBeInTheDocument();
    });
  });

  describe('recursos dos planos', () => {
    it('deve renderizar todas as features do plano gratuito', () => {
      render(<Pricing />);
      
      expect(screen.getByText('100 conversas por mês')).toBeInTheDocument();
      expect(screen.getAllByText('Homepage profissional com chatbot')).toHaveLength(2);
    });

    it('deve renderizar todas as features do plano plus', () => {
      render(<Pricing />);
      
      expect(screen.getByText('Conversas ilimitadas')).toBeInTheDocument();
      expect(screen.getAllByText('Homepage profissional com chatbot')).toHaveLength(2);
    });

    it('deve renderizar ícones de check para cada feature', () => {
      render(<Pricing />);
      
      // Verifica se há ícones de check para todas as features
      const checkIcons = screen.getAllByTestId('check-icon');
      expect(checkIcons).toHaveLength(4); // 2 features para cada plano
    });
  });

  describe('interações do usuário', () => {
    it('deve permitir clicar no botão do plano gratuito', async () => {
      const user = userEvent.setup();
      render(<Pricing />);
      
      const button = screen.getByRole('button', { name: /comece já/i });
      expect(button).toBeEnabled();
      
      // Verifica se é clicável
      await user.click(button);
      expect(button).toBeInTheDocument();
    });

    it('deve permitir clicar no botão do plano plus', async () => {
      const user = userEvent.setup();
      render(<Pricing />);
      
      const button = screen.getByRole('button', { name: /assine já/i });
      expect(button).toBeEnabled();
      
      // Verifica se é clicável
      await user.click(button);
      expect(button).toBeInTheDocument();
    });
  });

  describe('acessibilidade', () => {
    it('deve ter estrutura semântica adequada', () => {
      render(<Pricing />);
      
      // Verifica se há uma seção principal
      const section = document.querySelector('section#pricing');
      expect(section).toBeInTheDocument();
      
      // Verifica se há headings hierárquicos
      const mainHeading = screen.getByRole('heading', { level: 2 });
      expect(mainHeading).toBeInTheDocument();
      
      const planHeadings = screen.getAllByRole('heading', { level: 3 });
      expect(planHeadings).toHaveLength(2);
    });

    it('deve ter todos os botões acessíveis', () => {
      render(<Pricing />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeEnabled();
        expect(button).toHaveAccessibleName();
      });
    });
  });

  describe('estilização condicional', () => {
    it('deve aplicar classes específicas para planos populares', () => {
      render(<Pricing />);
      
      // Verifica se os cards têm as classes corretas
      const cards = document.querySelectorAll('[class*="bg-theme-card"]');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('deve renderizar elementos SVG decorativos', () => {
      render(<Pricing />);
      
      const svgElements = document.querySelectorAll('svg');
      expect(svgElements.length).toBeGreaterThan(0);
    });

    it('deve renderizar padrão de grade decorativo', () => {
      render(<Pricing />);
      
      // Verifica se há elementos da grade
      const gridElements = document.querySelectorAll('[style*="grid"]');
      expect(gridElements.length).toBeGreaterThan(0);
    });
  });

  describe('responsividade', () => {
    it('deve ter classes responsivas aplicadas', () => {
      render(<Pricing />);
      
      // Verifica se há classes responsivas no container principal dos cards
      const cardsContainer = document.querySelector('.grid.grid-cols-1');
      expect(cardsContainer).toBeInTheDocument();
      expect(cardsContainer).toHaveClass('md:grid-cols-2');
    });

    it('deve ter texto responsivo nos títulos', () => {
      render(<Pricing />);
      
      const mainTitle = screen.getByText('Assine o Plano Gratuito');
      expect(mainTitle.closest('h2')).toHaveClass('text-3xl', 'md:text-5xl');
    });
  });
});
