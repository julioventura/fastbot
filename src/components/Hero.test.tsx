/**
 * Testes para o componente Hero
 * 
 * Este arquivo contém testes abrangentes para o componente Hero,
 * validando a renderização, elementos de texto, imagens, botões
 * e funcionalidades de tema.
 * 
 * ABORDAGEM PARA TEXTOS FRAGMENTADOS:
 * O componente Hero usa múltiplos <span> para aplicar diferentes
 * classes de gradiente. Os testes foram adaptados para usar matchers
 * mais flexíveis que testam cada fragmento de texto individualmente,
 * ao invés de procurar por texto concatenado que pode estar 
 * fragmentado em múltiplos elementos DOM.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Hero from './Hero';

// Mock do hook useTheme
const mockUseTheme = vi.fn();
vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => mockUseTheme(),
}));

// Mock do lucide-react
vi.mock('lucide-react', () => ({
  ArrowRight: ({ className }: { className?: string }) => (
    <span data-testid="arrow-right-icon" className={className}>→</span>
  ),
}));

describe('Hero Component', () => {
  beforeEach(() => {
    // Reset do mock antes de cada teste
    mockUseTheme.mockReturnValue({ theme: 'light' });
  });

  describe('quando renderizado', () => {
    it('deve renderizar a seção hero', () => {
      render(<Hero />);
      
      const heroSection = document.querySelector('section');
      expect(heroSection).toBeInTheDocument();
      expect(heroSection).toHaveClass('relative', 'overflow-hidden', 'min-h-screen');
    });

    it('deve renderizar todos os elementos de texto principais', () => {
      render(<Hero />);
      
      // Testa textos individuais em elementos separados
      expect(screen.getByText('Olá!')).toBeInTheDocument();
      expect(screen.getByText('Sou Fastbot.')).toBeInTheDocument();
      expect(screen.getByText('Sua atendente')).toBeInTheDocument();
      expect(screen.getByText('chatbot de IA')).toBeInTheDocument();
    });

    it('deve renderizar o botão CTA principal', () => {
      render(<Hero />);
      
      const ctaButton = screen.getByRole('button', { name: /comece já o plano gratuito!/i });
      expect(ctaButton).toBeInTheDocument();
      expect(ctaButton).toHaveClass('hero-cta-button');
    });

    // Nota: Teste do ícone ArrowRight removido pois o ícone foi comentado/removido do componente
    // Isso é uma melhoria de design que simplifica o botão CTA
  });

  describe('gerenciamento de imagens', () => {
    it('deve renderizar a imagem da Fastbot com tema light por padrão', () => {
      mockUseTheme.mockReturnValue({ theme: 'light' });
      render(<Hero />);
      
      const anaImage = screen.getByAltText('Fastbot - Assistente Virtual Profissional da Saúde');
      expect(anaImage).toBeInTheDocument();
      expect(anaImage).toHaveAttribute('src', '/fastbot/hero-ana.png');
    });

    it('deve usar imagem escura quando o tema for dark', () => {
      mockUseTheme.mockReturnValue({ theme: 'dark' });
      render(<Hero />);
      
      const anaImage = screen.getByAltText('Fastbot - Assistente Virtual Profissional da Saúde');
      expect(anaImage).toBeInTheDocument();
      expect(anaImage).toHaveAttribute('src', '/fastbot/hero-ana-dark.png');
    });

    it('deve fazer fallback para imagem light quando imagem dark falha', () => {
      mockUseTheme.mockReturnValue({ theme: 'dark' });
      render(<Hero />);
      
      const anaImage = screen.getByAltText('Fastbot - Assistente Virtual Profissional da Saúde');
      
      // Simula erro de carregamento da imagem
      fireEvent.error(anaImage);
      
      expect(anaImage).toHaveAttribute('src', '/fastbot/hero-ana.png');
    });

    it('deve ter atributos de acessibilidade corretos na imagem', () => {
      render(<Hero />);
      
      const anaImage = screen.getByAltText('Fastbot - Assistente Virtual Profissional da Saúde');
      expect(anaImage).toHaveAttribute('alt', 'Fastbot - Assistente Virtual Profissional da Saúde');
      expect(anaImage).toHaveClass('h-full', 'w-auto', 'object-contain', 'object-center');
    });
  });

  describe('layout e estrutura', () => {
    it('deve ter estrutura de grid responsiva', () => {
      render(<Hero />);
      
      const gridContainer = document.querySelector('.grid.lg\\:grid-cols-5');
      expect(gridContainer).toBeInTheDocument();
      expect(gridContainer).toHaveClass('gap-6', 'lg:gap-12', 'items-center');
    });

    it('deve ter coluna de texto com classes corretas', () => {
      render(<Hero />);
      
      const textColumn = document.querySelector('.lg\\:col-span-2');
      expect(textColumn).toBeInTheDocument();
      expect(textColumn).toHaveClass('flex', 'flex-col', 'justify-center');
    });

    it('deve ter coluna de imagem com classes corretas', () => {
      render(<Hero />);
      
      const imageColumn = document.querySelector('.lg\\:col-span-3');
      expect(imageColumn).toBeInTheDocument();
      expect(imageColumn).toHaveClass('flex', 'justify-center', 'lg:justify-end');
    });
  });

  describe('elementos decorativos', () => {
    it('deve renderizar elementos decorativos circulares', () => {
      render(<Hero />);
      
      const decorativeElements = document.querySelectorAll('.decoration-circle');
      expect(decorativeElements).toHaveLength(3);
    });

    it('deve ter gradiente de fundo', () => {
      render(<Hero />);
      
      const backgroundGradient = document.querySelector('.bg-gradient-to-br');
      expect(backgroundGradient).toBeInTheDocument();
      expect(backgroundGradient).toHaveClass('from-background');
      expect(backgroundGradient).toHaveClass('via-background/90');
      expect(backgroundGradient).toHaveClass('to-primary/5');
    });

    it('deve ter overlay decorativo na imagem', () => {
      render(<Hero />);
      
      const overlay = document.querySelector('.bg-gradient-to-t.from-primary\\/5');
      expect(overlay).toBeInTheDocument();
    });
  });

  describe('tipografia e estilos de texto', () => {
    it('deve aplicar classes de gradiente corretas nos textos', () => {
      render(<Hero />);
      
      // Testa cada span individualmente com classes de gradiente
      const helloText = screen.getByText('Olá!');
      expect(helloText).toHaveClass('gradient-text-red');
      
      const nameText = screen.getByText('Sou Fastbot.');
      expect(nameText).toHaveClass('gradient-text-red');
      
      const roleText = screen.getByText('Sua atendente');
      expect(roleText).toHaveClass('gradient-text-blue');
      
      const chatbotText = screen.getByText('chatbot de IA');
      expect(chatbotText).toHaveClass('gradient-text-purple');
    });

    it('deve ter tamanhos de fonte responsivos', () => {
      render(<Hero />);
      
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveClass('text-4xl', 'md:text-6xl', 'lg:text-7xl');
    });
  });

  describe('interações do usuário', () => {
    it('deve permitir clicar no botão CTA', async () => {
      const user = userEvent.setup();
      render(<Hero />);
      
      const ctaButton = screen.getByRole('button', { name: /comece já o plano gratuito!/i });
      expect(ctaButton).toBeEnabled();
      
      await user.click(ctaButton);
      expect(ctaButton).toBeInTheDocument();
    });

    it('deve ter efeitos de hover no botão', () => {
      render(<Hero />);
      
      const ctaButton = screen.getByRole('button', { name: /comece já o plano gratuito!/i });
      expect(ctaButton).toHaveClass('hover:bg-primary/90', 'hover:scale-105', 'transition-all');
    });
  });

  describe('responsividade', () => {
    it('deve ter classes responsivas aplicadas corretamente', () => {
      render(<Hero />);
      
      const container = document.querySelector('.container');
      expect(container).toBeInTheDocument();
      
      const imageContainer = document.querySelector('.h-\\[85vh\\]');
      expect(imageContainer).toBeInTheDocument();
      expect(imageContainer).toHaveClass('lg:h-[90vh]');
    });

    it('deve ter espaçamento responsivo nos elementos', () => {
      render(<Hero />);
      
      const textColumn = document.querySelector('.lg\\:col-span-2');
      expect(textColumn).toHaveClass('space-y-6', 'lg:space-y-8');
    });
  });

  describe('acessibilidade', () => {
    it('deve ter estrutura semântica adequada', () => {
      render(<Hero />);
      
      const section = document.querySelector('section');
      expect(section).toBeInTheDocument();
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAccessibleName();
    });

    it('deve ter imagem com texto alternativo apropriado', () => {
      render(<Hero />);
      
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('alt', 'Fastbot - Assistente Virtual Profissional da Saúde');
    });
  });
});
