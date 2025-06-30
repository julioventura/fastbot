import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
  SelectSeparator,
  SelectGroup,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from './select';

// Mock Radix UI icons
vi.mock('lucide-react', () => ({
  Check: ({ className }: { className?: string }) => <div className={className} data-testid="check-icon" />,
  ChevronDown: ({ className }: { className?: string }) => <div className={className} data-testid="chevron-down-icon" />,
  ChevronUp: ({ className }: { className?: string }) => <div className={className} data-testid="chevron-up-icon" />,
}));

// Helper component that provides proper Select context
const SelectWithItems = ({ 
  onValueChange, 
  defaultValue, 
  disabled,
  placeholder = "Select option"
}: {
  onValueChange?: (value: string) => void
  defaultValue?: string
  disabled?: boolean
  placeholder?: string
}) => (
  <Select onValueChange={onValueChange} defaultValue={defaultValue} disabled={disabled}>
    <SelectTrigger data-testid="select-trigger">
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectLabel>Fruits</SelectLabel>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="orange" disabled>Orange (disabled)</SelectItem>
      </SelectGroup>
      <SelectSeparator />
      <SelectGroup>
        <SelectLabel>Vegetables</SelectLabel>
        <SelectItem value="carrot">Carrot</SelectItem>
        <SelectItem value="potato">Potato</SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
);

describe('Select Components', () => {
  describe('SelectTrigger', () => {
    it('renders with default classes', () => {
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
        </Select>
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveClass('flex', 'h-10', 'w-full', 'items-center', 'justify-between');
      expect(trigger).toHaveClass('rounded-md', 'border', 'border-input', 'bg-background');
      expect(trigger).toHaveClass('px-3', 'py-2', 'text-sm');
    });

    it('applies custom className', () => {
      render(
        <Select>
          <SelectTrigger className="custom-class" data-testid="select-trigger">
            <SelectValue />
          </SelectTrigger>
        </Select>
      );

      expect(screen.getByTestId('select-trigger')).toHaveClass('custom-class');
    });

    it('renders chevron down icon', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
        </Select>
      );

      expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
      expect(screen.getByTestId('chevron-down-icon')).toHaveClass('h-4', 'w-4', 'opacity-50');
    });

    it('supports disabled state', () => {
      render(
        <Select disabled>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue />
          </SelectTrigger>
        </Select>
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toBeDisabled();
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(
        <Select>
          <SelectTrigger ref={ref}>
            <SelectValue />
          </SelectTrigger>
        </Select>
      );

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });

  describe('SelectContent', () => {
    it('renders with default classes and position', () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent data-testid="select-content">
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      const content = screen.getByTestId('select-content');
      expect(content).toHaveClass('relative', 'z-50', 'max-h-96', 'min-w-[8rem]');
      expect(content).toHaveClass('overflow-hidden', 'rounded-md', 'border');
      expect(content).toHaveClass('bg-popover', 'text-popover-foreground', 'shadow-md');
    });

    it('applies custom className', () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="custom-content-class" data-testid="select-content">
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByTestId('select-content')).toHaveClass('custom-content-class');
    });

    it('supports different positions', () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="item-aligned" data-testid="select-content">
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      const content = screen.getByTestId('select-content');
      expect(content).toBeInTheDocument();
    });
  });

  describe('SelectItem', () => {
    it('renders with default classes', () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1" data-testid="select-item">
              Option 1
            </SelectItem>
          </SelectContent>
        </Select>
      );

      const item = screen.getByTestId('select-item');
      expect(item).toHaveClass('relative', 'flex', 'w-full', 'cursor-default');
      expect(item).toHaveClass('select-none', 'items-center', 'rounded-sm');
      expect(item).toHaveClass('py-1.5', 'pl-8', 'pr-2', 'text-sm');
    });

    it('renders item text', () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1" className="custom-item-class" data-testid="select-item">
              Option 1
            </SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByTestId('select-item')).toHaveClass('custom-item-class');
    });

    it('does not render check icon indicator when not selected', () => {
      render(
        <Select open defaultValue="option2">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1" data-testid="select-item">
              Option 1
            </SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      );

      const item = screen.getByTestId('select-item');
      // The check icon should not be present in an unselected item
      expect(within(item).queryByTestId('check-icon')).not.toBeInTheDocument();
    });
    
    it('renders check icon indicator when selected', () => {
      render(
        <Select open defaultValue="option1">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1" data-testid="select-item">
              Option 1
            </SelectItem>
          </SelectContent>
        </Select>
      );

      const item = screen.getByTestId('select-item');
      // The check icon should be present in the selected item
      const checkIcon = within(item).getByTestId('check-icon');
      expect(checkIcon).toBeInTheDocument();
      expect(checkIcon).toHaveClass('h-4', 'w-4');
    });

    it('supports disabled state', () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1" disabled data-testid="select-item">
              Option 1
            </SelectItem>
          </SelectContent>
        </Select>
      );

      const item = screen.getByTestId('select-item');
      expect(item).toHaveAttribute('data-disabled');
    });
  });

  describe('SelectLabel', () => {
    it('renders with default classes', () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel data-testid="select-label">Categories</SelectLabel>
            </SelectGroup>
          </SelectContent>
        </Select>
      );

      const label = screen.getByTestId('select-label');
      expect(label).toHaveClass('py-1.5', 'pl-8', 'pr-2', 'text-sm', 'font-semibold');
    });

    it('renders label text', () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Categories</SelectLabel>
            </SelectGroup>
          </SelectContent>
        </Select>
      );

      expect(screen.getByText('Categories')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel className="custom-label-class" data-testid="select-label">
                Categories
              </SelectLabel>
            </SelectGroup>
          </SelectContent>
        </Select>
      );

      expect(screen.getByTestId('select-label')).toHaveClass('custom-label-class');
    });
  });

  describe('SelectSeparator', () => {
    it('renders with default classes', () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectSeparator data-testid="select-separator" />
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      );

      const separator = screen.getByTestId('select-separator');
      expect(separator).toHaveClass('-mx-1', 'my-1', 'h-px', 'bg-muted');
    });

    it('applies custom className', () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectSeparator className="custom-separator-class" data-testid="select-separator" />
          </SelectContent>
        </Select>
      );

      expect(screen.getByTestId('select-separator')).toHaveClass('custom-separator-class');
    });
  });

  describe('Integration Tests', () => {
    it('renders complete select with all components', () => {
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent data-testid="select-content">
            <SelectGroup>
              <SelectLabel>Fruits</SelectLabel>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Vegetables</SelectLabel>
              <SelectItem value="carrot">Carrot</SelectItem>
              <SelectItem value="broccoli">Broccoli</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      );

      expect(screen.getByTestId('select-trigger')).toBeInTheDocument();
      expect(screen.getByText('Select an option')).toBeInTheDocument();
    });

    it('works with controlled state', () => {
      const TestComponent = () => {
        const [value, setValue] = React.useState<string>('');

        return (
          <div>
            <Select value={value} onValueChange={setValue}>
              <SelectTrigger data-testid="select-trigger">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
              </SelectContent>
            </Select>
            <div data-testid="selected-value">{value}</div>
          </div>
        );
      };

      render(<TestComponent />);
      
      expect(screen.getByTestId('selected-value')).toHaveTextContent('');
    });

    it('handles selection changes', async () => {
      const handleValueChange = vi.fn();
      const user = userEvent.setup();
      
      render(
        <Select onValueChange={handleValueChange} open>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
          </SelectContent>
        </Select>
      );

      const option = screen.getByText('Apple');
      await user.click(option);

      expect(handleValueChange).toHaveBeenCalledWith('apple');
    });

    it('supports default value', () => {
      render(<SelectWithItems defaultValue="banana" />);

      // The trigger should display the label of the default value
      expect(screen.getByText('Banana')).toBeInTheDocument();
    });

    it('disables the entire select when disabled prop is set', async () => {
      const user = userEvent.setup();
      
      render(<SelectWithItems disabled />);

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toBeDisabled();

      // Clicking a disabled trigger should not open the content
      await user.click(trigger).catch(() => {}); // userEvent throws error on disabled elements
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('disables a specific item', async () => {
      const handleValueChange = vi.fn();
      const user = userEvent.setup();
      
      render(
        <Select onValueChange={handleValueChange} open>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="enabled">Enabled</SelectItem>
            <SelectItem value="disabled" disabled>Disabled</SelectItem>
          </SelectContent>
        </Select>
      );

      const disabledOptionText = screen.getByText('Disabled');
      const disabledOptionItem = disabledOptionText.closest('[role="option"]');
      expect(disabledOptionItem).toHaveAttribute('data-disabled');

      if (disabledOptionItem) {
        await user.click(disabledOptionItem);
      }

      expect(handleValueChange).not.toHaveBeenCalled();
    });
  });
});
