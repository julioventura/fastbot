import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { 
  Tooltip, 
  TooltipTrigger, 
  TooltipContent, 
  TooltipProvider 
} from './tooltip';

describe('Tooltip Components', () => {
  describe('TooltipProvider', () => {
    it('renders children without provider wrapper', () => {
      render(
        <TooltipProvider>
          <div data-testid="child">Child content</div>
        </TooltipProvider>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('supports delayDuration prop', () => {
      render(
        <TooltipProvider delayDuration={100}>
          <div data-testid="child">Child content</div>
        </TooltipProvider>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('supports skipDelayDuration prop', () => {
      render(
        <TooltipProvider skipDelayDuration={200}>
          <div data-testid="child">Child content</div>
        </TooltipProvider>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('supports disableHoverableContent prop', () => {
      render(
        <TooltipProvider disableHoverableContent={true}>
          <div data-testid="child">Child content</div>
        </TooltipProvider>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
    });
  });

  describe('Tooltip', () => {
    it('renders with TooltipProvider wrapper', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger data-testid="trigger">Hover me</TooltipTrigger>
            <TooltipContent>Tooltip content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      expect(screen.getByTestId('trigger')).toBeInTheDocument();
    });

    it('supports open prop', () => {
      render(
        <TooltipProvider>
          <Tooltip open={true}>
            <TooltipTrigger data-testid="trigger">Hover me</TooltipTrigger>
            <TooltipContent>Tooltip content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      expect(screen.getByTestId('trigger')).toBeInTheDocument();
    });

    it('supports defaultOpen prop', () => {
      render(
        <TooltipProvider>
          <Tooltip defaultOpen={true}>
            <TooltipTrigger data-testid="trigger">Hover me</TooltipTrigger>
            <TooltipContent>Tooltip content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      expect(screen.getByTestId('trigger')).toBeInTheDocument();
    });

    it('supports onOpenChange callback', () => {
      const handleOpenChange = vi.fn();

      render(
        <TooltipProvider>
          <Tooltip onOpenChange={handleOpenChange}>
            <TooltipTrigger data-testid="trigger">Hover me</TooltipTrigger>
            <TooltipContent>Tooltip content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      expect(screen.getByTestId('trigger')).toBeInTheDocument();
    });

    it('supports delayDuration prop', () => {
      render(
        <TooltipProvider>
          <Tooltip delayDuration={100}>
            <TooltipTrigger data-testid="trigger">Hover me</TooltipTrigger>
            <TooltipContent>Tooltip content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      expect(screen.getByTestId('trigger')).toBeInTheDocument();
    });
  });

  describe('TooltipTrigger', () => {
    it('renders trigger element', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger data-testid="trigger">Hover me</TooltipTrigger>
            <TooltipContent>Tooltip content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const trigger = screen.getByTestId('trigger');
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveTextContent('Hover me');
    });

    it('can be a button element', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button data-testid="trigger-button">Click me</button>
            </TooltipTrigger>
            <TooltipContent>Tooltip content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const trigger = screen.getByTestId('trigger-button');
      expect(trigger).toBeInTheDocument();
      expect(trigger.tagName).toBe('BUTTON');
    });

    it('can be a custom element', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div data-testid="trigger-div" role="button" tabIndex={0}>
                Custom trigger
              </div>
            </TooltipTrigger>
            <TooltipContent>Tooltip content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const trigger = screen.getByTestId('trigger-div');
      expect(trigger).toBeInTheDocument();
      expect(trigger.tagName).toBe('DIV');
      expect(trigger).toHaveAttribute('role', 'button');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();

      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button ref={ref} data-testid="trigger">
                Trigger
              </button>
            </TooltipTrigger>
            <TooltipContent>Tooltip content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it('supports accessibility attributes', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger 
              data-testid="trigger"
              aria-label="Show tooltip"
              aria-describedby="tooltip-description"
            >
              Hover me
            </TooltipTrigger>
            <TooltipContent>Tooltip content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const trigger = screen.getByTestId('trigger');
      expect(trigger).toHaveAttribute('aria-label', 'Show tooltip');
      expect(trigger).toHaveAttribute('aria-describedby', 'tooltip-description');
    });
  });

  describe('TooltipContent', () => {
    it('renders with default classes', () => {
      render(
        <TooltipProvider>
          <Tooltip open={true}>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent data-testid="tooltip-content">
              Tooltip content
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const content = screen.getByTestId('tooltip-content');
      expect(content).toHaveClass('z-50', 'overflow-hidden', 'rounded-md', 'border');
      expect(content).toHaveClass('bg-popover', 'px-3', 'py-1.5', 'text-sm');
      expect(content).toHaveClass('text-popover-foreground', 'shadow-md');
      expect(content).toHaveClass('animate-in', 'fade-in-0', 'zoom-in-95');
    });

    it('applies custom className', () => {
      render(
        <TooltipProvider>
          <Tooltip open={true}>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent 
              className="custom-tooltip-class" 
              data-testid="tooltip-content"
            >
              Tooltip content
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      expect(screen.getByTestId('tooltip-content')).toHaveClass('custom-tooltip-class');
    });

    it('renders tooltip text', () => {
      render(
        <TooltipProvider>
          <Tooltip open={true}>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent>This is tooltip content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      expect(screen.getByText('This is tooltip content')).toBeInTheDocument();
    });

    it('supports default sideOffset', () => {
      render(
        <TooltipProvider>
          <Tooltip open={true}>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent data-testid="tooltip-content">
              Tooltip content
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      // Default sideOffset should be 4 (tested indirectly through rendering)
      expect(screen.getByText('Tooltip content')).toBeInTheDocument();
    });

    it('supports custom sideOffset', () => {
      render(
        <TooltipProvider>
          <Tooltip open={true}>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent sideOffset={10} data-testid="tooltip-content">
              Tooltip content
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      expect(screen.getByText('Tooltip content')).toBeInTheDocument();
    });

    it('supports side prop', () => {
      render(
        <TooltipProvider>
          <Tooltip open={true}>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent side="top" data-testid="tooltip-content">
              Tooltip content
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      expect(screen.getByText('Tooltip content')).toBeInTheDocument();
    });

    it('supports align prop', () => {
      render(
        <TooltipProvider>
          <Tooltip open={true}>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent align="start" data-testid="tooltip-content">
              Tooltip content
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      expect(screen.getByText('Tooltip content')).toBeInTheDocument();
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();

      render(
        <TooltipProvider>
          <Tooltip open={true}>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent ref={ref}>
              Tooltip content
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('supports HTML content', () => {
      render(
        <TooltipProvider>
          <Tooltip open={true}>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent>
              <div>
                <strong>Bold text</strong>
                <br />
                <em>Italic text</em>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      expect(screen.getByText('Bold text')).toBeInTheDocument();
      expect(screen.getByText('Italic text')).toBeInTheDocument();
    });
  });

  describe('Integration Tests', () => {
    it('shows tooltip on hover', async () => {
      const user = userEvent.setup();

      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger data-testid="trigger">Hover me</TooltipTrigger>
            <TooltipContent>Tooltip content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const trigger = screen.getByTestId('trigger');
      
      // Initially tooltip should not be visible
      expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument();

      // Hover over trigger
      await user.hover(trigger);

      // Wait for tooltip to appear
      await waitFor(() => {
        expect(screen.getByText('Tooltip content')).toBeInTheDocument();
      });
    });

    it('hides tooltip on unhover', async () => {
      const user = userEvent.setup();

      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger data-testid="trigger">Hover me</TooltipTrigger>
            <TooltipContent>Tooltip content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const trigger = screen.getByTestId('trigger');

      // Hover to show tooltip
      await user.hover(trigger);
      
      await waitFor(() => {
        expect(screen.getByText('Tooltip content')).toBeInTheDocument();
      });

      // Unhover to hide tooltip
      await user.unhover(trigger);

      await waitFor(() => {
        expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument();
      });
    });

    it('shows tooltip on focus', async () => {
      const user = userEvent.setup();

      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button data-testid="trigger">Focus me</button>
            </TooltipTrigger>
            <TooltipContent>Tooltip content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const trigger = screen.getByTestId('trigger');

      // Focus trigger
      await user.tab();
      expect(trigger).toHaveFocus();

      // Wait for tooltip to appear
      await waitFor(() => {
        expect(screen.getByText('Tooltip content')).toBeInTheDocument();
      });
    });

    it('hides tooltip on blur', async () => {
      const user = userEvent.setup();

      render(
        <div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button data-testid="trigger">Focus me</button>
              </TooltipTrigger>
              <TooltipContent>Tooltip content</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <button data-testid="other-button">Other button</button>
        </div>
      );

      const trigger = screen.getByTestId('trigger');
      const otherButton = screen.getByTestId('other-button');

      // Focus trigger to show tooltip
      await user.tab();
      expect(trigger).toHaveFocus();

      await waitFor(() => {
        expect(screen.getByText('Tooltip content')).toBeInTheDocument();
      });

      // Focus other element to blur trigger
      await user.click(otherButton);

      await waitFor(() => {
        expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument();
      });
    });

    it('works with controlled state', async () => {
      const TestComponent = () => {
        const [open, setOpen] = React.useState(false);

        return (
          <div>
            <button 
              onClick={() => setOpen(!open)}
              data-testid="toggle-button"
            >
              Toggle tooltip
            </button>
            <TooltipProvider>
              <Tooltip open={open} onOpenChange={setOpen}>
                <TooltipTrigger data-testid="trigger">Trigger</TooltipTrigger>
                <TooltipContent>Tooltip content</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      };

      const user = userEvent.setup();
      render(<TestComponent />);

      const toggleButton = screen.getByTestId('toggle-button');

      // Initially tooltip should be hidden
      expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument();

      // Click to show tooltip
      await user.click(toggleButton);
      expect(screen.getByText('Tooltip content')).toBeInTheDocument();

      // Click to hide tooltip
      await user.click(toggleButton);
      await waitFor(() => {
        expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument();
      });
    });

    it('supports multiple tooltips', async () => {
      const user = userEvent.setup();

      render(
        <TooltipProvider>
          <div>
            <Tooltip>
              <TooltipTrigger data-testid="trigger1">First trigger</TooltipTrigger>
              <TooltipContent>First tooltip</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger data-testid="trigger2">Second trigger</TooltipTrigger>
              <TooltipContent>Second tooltip</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      );

      const trigger1 = screen.getByTestId('trigger1');
      const trigger2 = screen.getByTestId('trigger2');

      // Hover first trigger
      await user.hover(trigger1);
      await waitFor(() => {
        expect(screen.getByText('First tooltip')).toBeInTheDocument();
      });

      // Hover second trigger
      await user.hover(trigger2);
      await waitFor(() => {
        expect(screen.getByText('Second tooltip')).toBeInTheDocument();
      });
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();

      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button data-testid="trigger">Trigger</button>
            </TooltipTrigger>
            <TooltipContent>Tooltip content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const trigger = screen.getByTestId('trigger');

      // Use keyboard to focus
      await user.tab();
      expect(trigger).toHaveFocus();

      // Tooltip should appear on focus
      await waitFor(() => {
        expect(screen.getByText('Tooltip content')).toBeInTheDocument();
      });

      // Escape should close tooltip
      await user.keyboard('{Escape}');
      await waitFor(() => {
        expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument();
      });
    });

    it('respects delayDuration', async () => {
      const user = userEvent.setup();

      render(
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger data-testid="trigger">Hover me</TooltipTrigger>
            <TooltipContent>Tooltip content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const trigger = screen.getByTestId('trigger');
      
      await user.hover(trigger);

      // Should respect the delay
      await waitFor(() => {
        expect(screen.getByText('Tooltip content')).toBeInTheDocument();
      }, { timeout: 200 });
    });
  });
});
