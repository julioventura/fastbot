import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Switch } from './switch';

describe('Switch', () => {
  it('renders with default classes', () => {
    render(<Switch data-testid="switch" />);

    const switchElement = screen.getByTestId('switch');
    expect(switchElement).toHaveClass('peer', 'inline-flex', 'h-6', 'w-11', 'shrink-0');
    expect(switchElement).toHaveClass('cursor-pointer', 'items-center', 'rounded-full');
    expect(switchElement).toHaveClass('border-2', 'border-transparent', 'transition-colors');
    expect(switchElement).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2');
    expect(switchElement).toHaveClass('focus-visible:ring-ring', 'focus-visible:ring-offset-2');
    expect(switchElement).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
  });

  it('applies custom className', () => {
    render(<Switch className="custom-switch-class" data-testid="switch" />);

    expect(screen.getByTestId('switch')).toHaveClass('custom-switch-class');
  });

  it('renders thumb with default classes', () => {
    render(<Switch data-testid="switch" />);

    const switchElement = screen.getByTestId('switch');
    const thumb = switchElement.querySelector('[class*="pointer-events-none"]');
    
    expect(thumb).toBeInTheDocument();
    expect(thumb).toHaveClass('pointer-events-none', 'block', 'h-5', 'w-5');
    expect(thumb).toHaveClass('rounded-full', 'bg-background', 'shadow-lg', 'ring-0');
    expect(thumb).toHaveClass('transition-transform');
  });

  it('supports controlled checked state', () => {
    render(<Switch checked={true} data-testid="switch" />);

    const switchElement = screen.getByTestId('switch');
    expect(switchElement).toHaveAttribute('data-state', 'checked');
  });

  it('supports controlled unchecked state', () => {
    render(<Switch checked={false} data-testid="switch" />);

    const switchElement = screen.getByTestId('switch');
    expect(switchElement).toHaveAttribute('data-state', 'unchecked');
  });

  it('supports default checked state', () => {
    render(<Switch defaultChecked={true} data-testid="switch" />);

    const switchElement = screen.getByTestId('switch');
    expect(switchElement).toHaveAttribute('data-state', 'checked');
  });

  it('supports default unchecked state', () => {
    render(<Switch defaultChecked={false} data-testid="switch" />);

    const switchElement = screen.getByTestId('switch');
    expect(switchElement).toHaveAttribute('data-state', 'unchecked');
  });

  it('can be disabled', () => {
    render(<Switch disabled data-testid="switch" />);

    const switchElement = screen.getByTestId('switch');
    expect(switchElement).toBeDisabled();
    expect(switchElement).toHaveAttribute('data-disabled');
  });

  it('handles click events when enabled', async () => {
    const user = userEvent.setup();
    const handleCheckedChange = vi.fn();

    render(
      <Switch 
        onCheckedChange={handleCheckedChange} 
        data-testid="switch" 
      />
    );

    const switchElement = screen.getByTestId('switch');
    await user.click(switchElement);

    expect(handleCheckedChange).toHaveBeenCalledWith(true);
  });

  it('does not handle click events when disabled', async () => {
    const user = userEvent.setup();
    const handleCheckedChange = vi.fn();

    render(
      <Switch 
        disabled
        onCheckedChange={handleCheckedChange} 
        data-testid="switch" 
      />
    );

    const switchElement = screen.getByTestId('switch');
    await user.click(switchElement);

    expect(handleCheckedChange).not.toHaveBeenCalled();
  });

  it('supports keyboard interaction', async () => {
    const user = userEvent.setup();
    const handleCheckedChange = vi.fn();

    render(
      <Switch 
        onCheckedChange={handleCheckedChange} 
        data-testid="switch" 
      />
    );

    const switchElement = screen.getByTestId('switch');
    switchElement.focus();
    await user.keyboard(' '); // Space key

    expect(handleCheckedChange).toHaveBeenCalledWith(true);
  });

  it('supports Enter key interaction', async () => {
    const user = userEvent.setup();
    const handleCheckedChange = vi.fn();

    render(
      <Switch 
        onCheckedChange={handleCheckedChange} 
        data-testid="switch" 
      />
    );

    const switchElement = screen.getByTestId('switch');
    switchElement.focus();
    await user.keyboard('{Enter}');

    expect(handleCheckedChange).toHaveBeenCalledWith(true);
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<React.ElementRef<typeof Switch>>();
    
    render(<Switch ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('supports aria-label for accessibility', () => {
    render(
      <Switch 
        aria-label="Toggle notifications" 
        data-testid="switch" 
      />
    );

    const switchElement = screen.getByTestId('switch');
    expect(switchElement).toHaveAttribute('aria-label', 'Toggle notifications');
  });

  it('supports aria-labelledby for accessibility', () => {
    render(
      <div>
        <label id="switch-label">Enable notifications</label>
        <Switch 
          aria-labelledby="switch-label" 
          data-testid="switch" 
        />
      </div>
    );

    const switchElement = screen.getByTestId('switch');
    expect(switchElement).toHaveAttribute('aria-labelledby', 'switch-label');
  });

  it('supports aria-describedby for accessibility', () => {
    render(
      <div>
        <Switch 
          aria-describedby="switch-description" 
          data-testid="switch" 
        />
        <div id="switch-description">This will enable push notifications</div>
      </div>
    );

    const switchElement = screen.getByTestId('switch');
    expect(switchElement).toHaveAttribute('aria-describedby', 'switch-description');
  });

  it('has proper role attribute', () => {
    render(<Switch data-testid="switch" />);

    const switchElement = screen.getByTestId('switch');
    expect(switchElement).toHaveAttribute('role', 'switch');
  });

  it('supports required attribute', () => {
    render(
      <form>
        <Switch required name="notifications" data-testid="switch" />
      </form>
    );

    const switchElement = screen.getByTestId('switch');
    expect(switchElement).toHaveAttribute('aria-required', 'true');

    // Radix creates a hidden input for form submission.
    const input = screen.getByRole('checkbox', { hidden: true });
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('name', 'notifications');
    expect(input).toBeRequired();
  });

  it('can be used in a form', async () => {
    const user = userEvent.setup();
    render(
      <form>
        <Switch name="agree" value="yes" data-testid="switch" />
      </form>
    );

    const switchElement = screen.getByTestId('switch');
    expect(switchElement).toHaveAttribute('value', 'yes');

    // Radix creates a hidden input for form submission.
    const input = screen.getByRole('checkbox', { hidden: true });
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('name', 'agree');
    expect(input).toHaveAttribute('type', 'checkbox');
    expect(input).not.toBeChecked();

    // Click the switch to turn it on
    await user.click(switchElement);

    expect(input).toBeChecked();
    expect(input).toHaveAttribute('value', 'yes');
  });

  it('supports data attributes', () => {
    render(
      <Switch 
        data-testid="switch" 
        data-custom="custom-value"
        data-tracking="switch-component"
      />
    );

    const switchElement = screen.getByTestId('switch');
    expect(switchElement).toHaveAttribute('data-custom', 'custom-value');
    expect(switchElement).toHaveAttribute('data-tracking', 'switch-component');
  });

  it('merges additional props correctly', () => {
    render(
      <Switch 
        data-testid="switch"
        id="custom-switch"
        tabIndex={0}
      />
    );

    const switchElement = screen.getByTestId('switch');
    expect(switchElement).toHaveAttribute('id', 'custom-switch');
    expect(switchElement).toHaveAttribute('tabIndex', '0');
  });
});
