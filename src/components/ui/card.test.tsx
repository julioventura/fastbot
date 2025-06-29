/**
 * Testes para os componentes Card
 * 
 * Este arquivo contém testes abrangentes para todos os componentes
 * relacionados ao Card: Card, CardHeader, CardTitle, CardDescription,
 * CardContent e CardFooter. Valida renderização, estrutura, classes,
 * acessibilidade e ref forwarding.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React, { createRef } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from './card';

describe('Card Components', () => {
  describe('Card', () => {
    it('deve renderizar um card básico', () => {
      render(<Card data-testid="card">Conteúdo do card</Card>);
      
      const card = screen.getByTestId('card');
      expect(card).toBeInTheDocument();
      expect(card.tagName).toBe('DIV');
      expect(card).toHaveTextContent('Conteúdo do card');
    });

    it('deve aplicar classes CSS padrão', () => {
      render(<Card data-testid="card" />);
      
      const card = screen.getByTestId('card');
      expect(card).toHaveClass(
        'rounded-lg',
        'border',
        'bg-card',
        'text-card-foreground',
        'shadow-sm'
      );
    });

    it('deve aceitar className personalizada', () => {
      render(<Card data-testid="card" className="custom-card" />);
      
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('custom-card');
      expect(card).toHaveClass('rounded-lg'); // deve manter classes padrão
    });

    it('deve forwardar ref corretamente', () => {
      const cardRef = createRef<HTMLDivElement>();
      
      render(<Card ref={cardRef} data-testid="card" />);
      
      expect(cardRef.current).toBeInstanceOf(HTMLDivElement);
      expect(cardRef.current).toBe(screen.getByTestId('card'));
    });

    it('deve aceitar props HTML nativas', () => {
      render(
        <Card 
          data-testid="card"
          id="my-card"
          role="article"
          aria-label="Card de exemplo"
        />
      );
      
      const card = screen.getByTestId('card');
      expect(card).toHaveAttribute('id', 'my-card');
      expect(card).toHaveAttribute('role', 'article');
      expect(card).toHaveAttribute('aria-label', 'Card de exemplo');
    });
  });

  describe('CardHeader', () => {
    it('deve renderizar um header de card', () => {
      render(<CardHeader data-testid="card-header">Header content</CardHeader>);
      
      const header = screen.getByTestId('card-header');
      expect(header).toBeInTheDocument();
      expect(header.tagName).toBe('DIV');
      expect(header).toHaveTextContent('Header content');
    });

    it('deve aplicar classes CSS padrão', () => {
      render(<CardHeader data-testid="card-header" />);
      
      const header = screen.getByTestId('card-header');
      expect(header).toHaveClass(
        'flex',
        'flex-col',
        'space-y-1.5',
        'p-6'
      );
    });

    it('deve aceitar className personalizada', () => {
      render(<CardHeader data-testid="card-header" className="custom-header" />);
      
      const header = screen.getByTestId('card-header');
      expect(header).toHaveClass('custom-header');
      expect(header).toHaveClass('flex'); // deve manter classes padrão
    });

    it('deve forwardar ref corretamente', () => {
      const headerRef = createRef<HTMLDivElement>();
      
      render(<CardHeader ref={headerRef} data-testid="card-header" />);
      
      expect(headerRef.current).toBeInstanceOf(HTMLDivElement);
      expect(headerRef.current).toBe(screen.getByTestId('card-header'));
    });
  });

  describe('CardTitle', () => {
    it('deve renderizar um título de card', () => {
      render(<CardTitle>Título do Card</CardTitle>);
      
      const title = screen.getByRole('heading', { level: 3 });
      expect(title).toBeInTheDocument();
      expect(title.tagName).toBe('H3');
      expect(title).toHaveTextContent('Título do Card');
    });

    it('deve aplicar classes CSS padrão', () => {
      render(<CardTitle data-testid="card-title">Título</CardTitle>);
      
      const title = screen.getByTestId('card-title');
      expect(title).toHaveClass(
        'text-2xl',
        'font-semibold',
        'leading-none',
        'tracking-tight'
      );
    });

    it('deve aceitar className personalizada', () => {
      render(<CardTitle data-testid="card-title" className="custom-title">Título</CardTitle>);
      
      const title = screen.getByTestId('card-title');
      expect(title).toHaveClass('custom-title');
      expect(title).toHaveClass('text-2xl'); // deve manter classes padrão
    });

    it('deve forwardar ref corretamente', () => {
      const titleRef = createRef<HTMLHeadingElement>();
      
      render(<CardTitle ref={titleRef} data-testid="card-title">Título</CardTitle>);
      
      expect(titleRef.current).toBeInstanceOf(HTMLHeadingElement);
      expect(titleRef.current).toBe(screen.getByTestId('card-title'));
    });

    it('deve ser acessível como heading', () => {
      render(<CardTitle>Título Principal</CardTitle>);
      
      const title = screen.getByRole('heading', { name: /título principal/i });
      expect(title).toBeInTheDocument();
    });
  });

  describe('CardDescription', () => {
    it('deve renderizar uma descrição de card', () => {
      render(<CardDescription>Descrição do card</CardDescription>);
      
      const description = screen.getByText('Descrição do card');
      expect(description).toBeInTheDocument();
      expect(description.tagName).toBe('P');
    });

    it('deve aplicar classes CSS padrão', () => {
      render(<CardDescription data-testid="card-description">Descrição</CardDescription>);
      
      const description = screen.getByTestId('card-description');
      expect(description).toHaveClass(
        'text-sm',
        'text-muted-foreground'
      );
    });

    it('deve aceitar className personalizada', () => {
      render(
        <CardDescription data-testid="card-description" className="custom-description">
          Descrição
        </CardDescription>
      );
      
      const description = screen.getByTestId('card-description');
      expect(description).toHaveClass('custom-description');
      expect(description).toHaveClass('text-sm'); // deve manter classes padrão
    });

    it('deve forwardar ref corretamente', () => {
      const descriptionRef = createRef<HTMLParagraphElement>();
      
      render(
        <CardDescription ref={descriptionRef} data-testid="card-description">
          Descrição
        </CardDescription>
      );
      
      expect(descriptionRef.current).toBeInstanceOf(HTMLParagraphElement);
      expect(descriptionRef.current).toBe(screen.getByTestId('card-description'));
    });
  });

  describe('CardContent', () => {
    it('deve renderizar conteúdo de card', () => {
      render(<CardContent data-testid="card-content">Conteúdo principal</CardContent>);
      
      const content = screen.getByTestId('card-content');
      expect(content).toBeInTheDocument();
      expect(content.tagName).toBe('DIV');
      expect(content).toHaveTextContent('Conteúdo principal');
    });

    it('deve aplicar classes CSS padrão', () => {
      render(<CardContent data-testid="card-content" />);
      
      const content = screen.getByTestId('card-content');
      expect(content).toHaveClass('p-6', 'pt-0');
    });

    it('deve aceitar className personalizada', () => {
      render(<CardContent data-testid="card-content" className="custom-content" />);
      
      const content = screen.getByTestId('card-content');
      expect(content).toHaveClass('custom-content');
      expect(content).toHaveClass('p-6'); // deve manter classes padrão
    });

    it('deve forwardar ref corretamente', () => {
      const contentRef = createRef<HTMLDivElement>();
      
      render(<CardContent ref={contentRef} data-testid="card-content" />);
      
      expect(contentRef.current).toBeInstanceOf(HTMLDivElement);
      expect(contentRef.current).toBe(screen.getByTestId('card-content'));
    });
  });

  describe('CardFooter', () => {
    it('deve renderizar footer de card', () => {
      render(<CardFooter data-testid="card-footer">Footer content</CardFooter>);
      
      const footer = screen.getByTestId('card-footer');
      expect(footer).toBeInTheDocument();
      expect(footer.tagName).toBe('DIV');
      expect(footer).toHaveTextContent('Footer content');
    });

    it('deve aplicar classes CSS padrão', () => {
      render(<CardFooter data-testid="card-footer" />);
      
      const footer = screen.getByTestId('card-footer');
      expect(footer).toHaveClass(
        'flex',
        'items-center',
        'p-6',
        'pt-0'
      );
    });

    it('deve aceitar className personalizada', () => {
      render(<CardFooter data-testid="card-footer" className="custom-footer" />);
      
      const footer = screen.getByTestId('card-footer');
      expect(footer).toHaveClass('custom-footer');
      expect(footer).toHaveClass('flex'); // deve manter classes padrão
    });

    it('deve forwardar ref corretamente', () => {
      const footerRef = createRef<HTMLDivElement>();
      
      render(<CardFooter ref={footerRef} data-testid="card-footer" />);
      
      expect(footerRef.current).toBeInstanceOf(HTMLDivElement);
      expect(footerRef.current).toBe(screen.getByTestId('card-footer'));
    });
  });

  describe('Composição de Card Completo', () => {
    it('deve renderizar um card completo com todos os componentes', () => {
      render(
        <Card data-testid="complete-card">
          <CardHeader>
            <CardTitle>Título do Card</CardTitle>
            <CardDescription>Descrição detalhada do card</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Este é o conteúdo principal do card.</p>
          </CardContent>
          <CardFooter>
            <button>Ação</button>
          </CardFooter>
        </Card>
      );

      // Verificar se todos os componentes estão presentes
      expect(screen.getByTestId('complete-card')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /título do card/i })).toBeInTheDocument();
      expect(screen.getByText('Descrição detalhada do card')).toBeInTheDocument();
      expect(screen.getByText('Este é o conteúdo principal do card.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /ação/i })).toBeInTheDocument();
    });

    it('deve manter hierarquia semântica correta', () => {
      render(
        <Card role="article">
          <CardHeader>
            <CardTitle>Artigo Principal</CardTitle>
            <CardDescription>Subtítulo do artigo</CardDescription>
          </CardHeader>
          <CardContent>
            Conteúdo do artigo
          </CardContent>
        </Card>
      );

      const article = screen.getByRole('article');
      const heading = screen.getByRole('heading');
      
      expect(article).toContainElement(heading);
      expect(heading.tagName).toBe('H3');
    });

    it('deve permitir aninhamento e composição flexível', () => {
      render(
        <Card>
          <CardContent>
            <Card data-testid="nested-card">
              <CardHeader>
                <CardTitle>Card Aninhado</CardTitle>
              </CardHeader>
              <CardContent>
                Conteúdo aninhado
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      );

      expect(screen.getByTestId('nested-card')).toBeInTheDocument();
      expect(screen.getByText('Card Aninhado')).toBeInTheDocument();
      expect(screen.getByText('Conteúdo aninhado')).toBeInTheDocument();
    });

    it('deve funcionar sem componentes opcionais', () => {
      render(
        <Card data-testid="minimal-card">
          <CardContent>
            Apenas conteúdo, sem header ou footer
          </CardContent>
        </Card>
      );

      const card = screen.getByTestId('minimal-card');
      expect(card).toBeInTheDocument();
      expect(card).toHaveTextContent('Apenas conteúdo, sem header ou footer');
      
      // Não deve ter heading
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });
  });

  describe('Acessibilidade', () => {
    it('deve suportar roles ARIA customizados', () => {
      render(
        <Card role="region" aria-labelledby="card-title">
          <CardHeader>
            <CardTitle id="card-title">Região de Conteúdo</CardTitle>
          </CardHeader>
          <CardContent>
            Conteúdo da região
          </CardContent>
        </Card>
      );

      const region = screen.getByRole('region');
      expect(region).toHaveAttribute('aria-labelledby', 'card-title');
      
      const title = screen.getByRole('heading');
      expect(title).toHaveAttribute('id', 'card-title');
    });

    it('deve permitir descrições acessíveis', () => {
      render(
        <Card aria-describedby="card-desc" data-testid="accessible-card">
          <CardHeader>
            <CardTitle>Card Acessível</CardTitle>
            <CardDescription id="card-desc">
              Esta é uma descrição acessível do card
            </CardDescription>
          </CardHeader>
        </Card>
      );

      const card = screen.getByTestId('accessible-card');
      expect(card).toHaveAttribute('aria-describedby', 'card-desc');
      
      const description = screen.getByText('Esta é uma descrição acessível do card');
      expect(description).toHaveAttribute('id', 'card-desc');
    });
  });
});
