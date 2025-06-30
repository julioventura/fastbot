import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';

describe('Tabs Components', () => {
  describe('Tabs', () => {
    it('renders tabs root component', () => {
      render(
        <Tabs defaultValue="tab1" data-testid="tabs-root">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>
      );

      expect(screen.getByTestId('tabs-root')).toBeInTheDocument();
    });

    it('supports controlled value', () => {
      render(
        <Tabs value="tab2" data-testid="tabs-root">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('supports default value', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    it('supports orientation prop', () => {
      render(
        <Tabs orientation="vertical" defaultValue="tab1" data-testid="tabs-root">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>
      );

      const tabsRoot = screen.getByTestId('tabs-root');
      expect(tabsRoot).toHaveAttribute('data-orientation', 'vertical');
    });

    it('handles value changes', async () => {
      const user = userEvent.setup();
      const handleValueChange = vi.fn();

      render(
        <Tabs onValueChange={handleValueChange} defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2" data-testid="tab2-trigger">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      await user.click(screen.getByTestId('tab2-trigger'));
      expect(handleValueChange).toHaveBeenCalledWith('tab2');
    });
  });

  describe('TabsList', () => {
    it('renders with default classes', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList data-testid="tabs-list">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      const tabsList = screen.getByTestId('tabs-list');
      expect(tabsList).toHaveClass('inline-flex', 'h-10', 'items-center', 'justify-center');
      expect(tabsList).toHaveClass('rounded-md', 'bg-muted', 'p-1', 'text-muted-foreground');
    });

    it('applies custom className', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList className="custom-tabs-list" data-testid="tabs-list">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      expect(screen.getByTestId('tabs-list')).toHaveClass('custom-tabs-list');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      
      render(
        <Tabs defaultValue="tab1">
          <TabsList ref={ref}>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('supports additional props', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList 
            data-testid="tabs-list"
            role="tablist"
            aria-label="Main navigation"
          >
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      const tabsList = screen.getByTestId('tabs-list');
      expect(tabsList).toHaveAttribute('role', 'tablist');
      expect(tabsList).toHaveAttribute('aria-label', 'Main navigation');
    });
  });

  describe('TabsTrigger', () => {
    it('renders with default classes', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" data-testid="tab-trigger">Tab 1</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      const trigger = screen.getByTestId('tab-trigger');
      expect(trigger).toHaveClass('inline-flex', 'items-center', 'justify-center');
      expect(trigger).toHaveClass('whitespace-nowrap', 'rounded-sm', 'px-3', 'py-1.5');
      expect(trigger).toHaveClass('text-sm', 'font-medium', 'ring-offset-background');
      expect(trigger).toHaveClass('transition-all', 'focus-visible:outline-none');
      expect(trigger).toHaveClass('focus-visible:ring-2', 'focus-visible:ring-ring');
      expect(trigger).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50');
    });

    it('applies custom className', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger 
              value="tab1" 
              className="custom-trigger-class" 
              data-testid="tab-trigger"
            >
              Tab 1
            </TabsTrigger>
          </TabsList>
        </Tabs>
      );

      expect(screen.getByTestId('tab-trigger')).toHaveClass('custom-trigger-class');
    });

    it('shows active state when selected', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" data-testid="tab1-trigger">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2" data-testid="tab2-trigger">Tab 2</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      const activeTab = screen.getByTestId('tab1-trigger');
      const inactiveTab = screen.getByTestId('tab2-trigger');

      expect(activeTab).toHaveAttribute('data-state', 'active');
      expect(inactiveTab).toHaveAttribute('data-state', 'inactive');
    });

    it('can be disabled', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" disabled data-testid="tab-trigger">
              Tab 1
            </TabsTrigger>
          </TabsList>
        </Tabs>
      );

      const trigger = screen.getByTestId('tab-trigger');
      expect(trigger).toBeDisabled();
      expect(trigger).toHaveAttribute('data-disabled');
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();

      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" data-testid="tab1-trigger">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2" data-testid="tab2-trigger">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      const tab1 = screen.getByTestId('tab1-trigger');
      const tab2 = screen.getByTestId('tab2-trigger');

      tab1.focus();
      expect(tab1).toHaveFocus();

      await user.keyboard('{ArrowRight}');
      expect(tab2).toHaveFocus();
    });

    it('handles click events', async () => {
      const user = userEvent.setup();

      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2" data-testid="tab2-trigger">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      await user.click(screen.getByTestId('tab2-trigger'));
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" ref={ref}>Tab 1</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });

  describe('TabsContent', () => {
    it('renders with default classes', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" data-testid="tab-content">
            Content 1
          </TabsContent>
        </Tabs>
      );

      const content = screen.getByTestId('tab-content');
      expect(content).toHaveClass('mt-2', 'ring-offset-background');
      expect(content).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2');
      expect(content).toHaveClass('focus-visible:ring-ring', 'focus-visible:ring-offset-2');
    });

    it('applies custom className', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent 
            value="tab1" 
            className="custom-content-class" 
            data-testid="tab-content"
          >
            Content 1
          </TabsContent>
        </Tabs>
      );

      expect(screen.getByTestId('tab-content')).toHaveClass('custom-content-class');
    });

    it('shows content for active tab only', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
    });

    it('switches content when tab changes', async () => {
      const user = userEvent.setup();

      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2" data-testid="tab2-trigger">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      expect(screen.getByText('Content 1')).toBeInTheDocument();

      await user.click(screen.getByTestId('tab2-trigger'));
      expect(screen.getByText('Content 2')).toBeInTheDocument();
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" ref={ref}>
            Content 1
          </TabsContent>
        </Tabs>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('supports tabIndex for focus management', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" tabIndex={0} data-testid="tab-content">
            Content 1
          </TabsContent>
        </Tabs>
      );

      const content = screen.getByTestId('tab-content');
      expect(content).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Integration Tests', () => {
    it('renders complete tabs component', () => {
      render(
        <Tabs defaultValue="overview" data-testid="tabs-root">
          <TabsList data-testid="tabs-list">
            <TabsTrigger value="overview" data-testid="overview-tab">
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics" data-testid="analytics-tab">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="reports" data-testid="reports-tab">
              Reports
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" data-testid="overview-content">
            <h2>Overview</h2>
            <p>Overview content goes here.</p>
          </TabsContent>
          <TabsContent value="analytics" data-testid="analytics-content">
            <h2>Analytics</h2>
            <p>Analytics content goes here.</p>
          </TabsContent>
          <TabsContent value="reports" data-testid="reports-content">
            <h2>Reports</h2>
            <p>Reports content goes here.</p>
          </TabsContent>
        </Tabs>
      );

      expect(screen.getByTestId('tabs-root')).toBeInTheDocument();
      const tabsList = screen.getByTestId('tabs-list');
      expect(tabsList).toBeInTheDocument();

      // Check for triggers within the list
      expect(within(tabsList).getByText('Overview')).toBeInTheDocument();
      expect(within(tabsList).getByText('Analytics')).toBeInTheDocument();
      expect(within(tabsList).getByText('Reports')).toBeInTheDocument();

      // Check for content
      expect(screen.getByText('Overview content goes here.')).toBeInTheDocument();
      
      // Check for heading within the content
      const overviewContent = screen.getByTestId('overview-content');
      expect(within(overviewContent).getByRole('heading', { name: 'Overview' })).toBeInTheDocument();
    });

    it('works with controlled state', () => {
      const TestComponent = () => {
        const [activeTab, setActiveTab] = React.useState('tab1');

        return (
          <div>
            <button 
              onClick={() => setActiveTab('tab2')}
              data-testid="external-button"
            >
              Switch to Tab 2
            </button>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                <TabsTrigger value="tab2">Tab 2</TabsTrigger>
              </TabsList>
              <TabsContent value="tab1">Content 1</TabsContent>
              <TabsContent value="tab2">Content 2</TabsContent>
            </Tabs>
            <div data-testid="active-tab-display">{activeTab}</div>
          </div>
        );
      };

      render(<TestComponent />);

      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.getByTestId('active-tab-display')).toHaveTextContent('tab1');
    });

    it('supports accessibility attributes', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList aria-label="Main navigation">
            <TabsTrigger value="tab1" aria-controls="tab1-content">
              Tab 1
            </TabsTrigger>
            <TabsTrigger value="tab2" aria-controls="tab2-content">
              Tab 2
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" id="tab1-content">
            Content 1
          </TabsContent>
          <TabsContent value="tab2" id="tab2-content">
            Content 2
          </TabsContent>
        </Tabs>
      );

      const tabsList = screen.getByRole('tablist');
      expect(tabsList).toHaveAttribute('aria-label', 'Main navigation');

      const tab1 = screen.getByText('Tab 1');
      expect(tab1).toHaveAttribute('aria-controls', 'tab1-content');
    });

    it('handles disabled tabs correctly', async () => {
      const user = userEvent.setup();

      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2" disabled data-testid="disabled-tab">
              Tab 2 (Disabled)
            </TabsTrigger>
            <TabsTrigger value="tab3" data-testid="tab3-trigger">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
          <TabsContent value="tab3">Content 3</TabsContent>
        </Tabs>
      );

      const disabledTab = screen.getByTestId('disabled-tab');
      await user.click(disabledTab);

      // Should still show content 1, not content 2
      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument();

      // But can still click on tab 3
      await user.click(screen.getByTestId('tab3-trigger'));
      expect(screen.getByText('Content 3')).toBeInTheDocument();
    });

    it('supports multiple tabs instances on same page', () => {
      render(
        <div>
          <Tabs defaultValue="a1" data-testid="tabs1">
            <TabsList>
              <TabsTrigger value="a1">A1</TabsTrigger>
              <TabsTrigger value="a2">A2</TabsTrigger>
            </TabsList>
            <TabsContent value="a1">Content A1</TabsContent>
            <TabsContent value="a2">Content A2</TabsContent>
          </Tabs>
          
          <Tabs defaultValue="b1" data-testid="tabs2">
            <TabsList>
              <TabsTrigger value="b1">B1</TabsTrigger>
              <TabsTrigger value="b2">B2</TabsTrigger>
            </TabsList>
            <TabsContent value="b1">Content B1</TabsContent>
            <TabsContent value="b2">Content B2</TabsContent>
          </Tabs>
        </div>
      );

      expect(screen.getByText('Content A1')).toBeInTheDocument();
      expect(screen.getByText('Content B1')).toBeInTheDocument();
      expect(screen.getByTestId('tabs1')).toBeInTheDocument();
      expect(screen.getByTestId('tabs2')).toBeInTheDocument();
    });
  });
});
