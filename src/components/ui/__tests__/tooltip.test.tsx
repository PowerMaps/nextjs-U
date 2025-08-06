import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../tooltip';
import { Button } from '../button';

// Helper component to wrap tests with TooltipProvider
const TooltipWrapper = ({ children }: { children: React.ReactNode }) => (
  <TooltipProvider>{children}</TooltipProvider>
);

describe('Tooltip Component', () => {
  it('renders trigger element correctly', () => {
    render(
      <TooltipWrapper>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button>Hover me</Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Tooltip content</p>
          </TooltipContent>
        </Tooltip>
      </TooltipWrapper>
    );

    const trigger = screen.getByText('Hover me');
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('data-state', 'closed');
  });

  it('renders with controlled open state', async () => {
    render(
      <TooltipWrapper>
        <Tooltip open={true}>
          <TooltipTrigger asChild>
            <Button>Trigger</Button>
          </TooltipTrigger>
          <TooltipContent data-testid="tooltip-content">
            <p>Always visible tooltip</p>
          </TooltipContent>
        </Tooltip>
      </TooltipWrapper>
    );

    const trigger = screen.getByText('Trigger');
    expect(trigger).toHaveAttribute('data-state', 'instant-open');

    await waitFor(() => {
      const content = screen.getByTestId('tooltip-content');
      expect(content).toBeInTheDocument();
    });
  });

  it('applies correct CSS classes to content when open', async () => {
    render(
      <TooltipWrapper>
        <Tooltip open={true}>
          <TooltipTrigger asChild>
            <Button>Trigger</Button>
          </TooltipTrigger>
          <TooltipContent data-testid="tooltip-content">
            <p>Tooltip content</p>
          </TooltipContent>
        </Tooltip>
      </TooltipWrapper>
    );

    await waitFor(() => {
      const content = screen.getByTestId('tooltip-content');
      expect(content).toHaveClass(
        'z-50',
        'overflow-hidden',
        'rounded-md',
        'border',
        'bg-popover',
        'px-3',
        'py-1.5',
        'text-sm',
        'text-popover-foreground',
        'shadow-md'
      );
    });
  });

  it('accepts custom className', async () => {
    render(
      <TooltipWrapper>
        <Tooltip open={true}>
          <TooltipTrigger asChild>
            <Button>Trigger</Button>
          </TooltipTrigger>
          <TooltipContent className="custom-tooltip" data-testid="tooltip-content">
            <p>Tooltip content</p>
          </TooltipContent>
        </Tooltip>
      </TooltipWrapper>
    );

    await waitFor(() => {
      const content = screen.getByTestId('tooltip-content');
      expect(content).toHaveClass('custom-tooltip');
    });
  });

  it('supports custom sideOffset', async () => {
    render(
      <TooltipWrapper>
        <Tooltip open={true}>
          <TooltipTrigger asChild>
            <Button>Trigger</Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={10} data-testid="tooltip-content">
            <p>Tooltip content</p>
          </TooltipContent>
        </Tooltip>
      </TooltipWrapper>
    );

    await waitFor(() => {
      const content = screen.getByTestId('tooltip-content');
      expect(content).toBeInTheDocument();
    });
  });

  it('can be controlled externally', async () => {
    const ControlledTooltip = () => {
      const [open, setOpen] = React.useState(false);

      return (
        <TooltipWrapper>
          <div>
            <Button onClick={() => setOpen(!open)} data-testid="control-button">
              {open ? 'Hide' : 'Show'} tooltip
            </Button>
            <Tooltip open={open} onOpenChange={setOpen}>
              <TooltipTrigger asChild>
                <Button>Trigger</Button>
              </TooltipTrigger>
              <TooltipContent data-testid="tooltip-content">
                <p>Controlled tooltip content</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipWrapper>
      );
    };

    render(<ControlledTooltip />);

    const controlButton = screen.getByTestId('control-button');
    expect(controlButton).toHaveTextContent('Show tooltip');

    // Content should not be visible initially
    expect(screen.queryByTestId('tooltip-content')).not.toBeInTheDocument();

    // Click to show tooltip
    fireEvent.click(controlButton);

    await waitFor(() => {
      expect(screen.getByTestId('tooltip-content')).toBeInTheDocument();
      expect(controlButton).toHaveTextContent('Hide tooltip');
    });

    // Click to hide tooltip
    fireEvent.click(controlButton);

    await waitFor(() => {
      expect(screen.queryByTestId('tooltip-content')).not.toBeInTheDocument();
      expect(controlButton).toHaveTextContent('Show tooltip');
    });
  });

  it('forwards refs correctly when open', async () => {
    const contentRef = React.createRef<HTMLDivElement>();

    render(
      <TooltipWrapper>
        <Tooltip open={true}>
          <TooltipTrigger asChild>
            <Button>Trigger</Button>
          </TooltipTrigger>
          <TooltipContent ref={contentRef}>
            <p>Tooltip content</p>
          </TooltipContent>
        </Tooltip>
      </TooltipWrapper>
    );

    await waitFor(() => {
      expect(contentRef.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  it('works with different trigger elements', () => {
    render(
      <TooltipWrapper>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>Hover this span</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Span tooltip</p>
          </TooltipContent>
        </Tooltip>
      </TooltipWrapper>
    );

    const trigger = screen.getByText('Hover this span');
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('data-state', 'closed');
  });

  it('supports different positioning sides', async () => {
    render(
      <TooltipWrapper>
        <Tooltip open={true}>
          <TooltipTrigger asChild>
            <Button>Trigger</Button>
          </TooltipTrigger>
          <TooltipContent side="top" data-testid="tooltip-content">
            <p>Top tooltip</p>
          </TooltipContent>
        </Tooltip>
      </TooltipWrapper>
    );

    await waitFor(() => {
      const content = screen.getByTestId('tooltip-content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveAttribute('data-side', 'top');
    });
  });

  it('supports complex content', async () => {
    render(
      <TooltipWrapper>
        <Tooltip open={true}>
          <TooltipTrigger asChild>
            <Button>Trigger</Button>
          </TooltipTrigger>
          <TooltipContent data-testid="tooltip-content">
            <div className="space-y-1">
              <h4 className="font-medium">Tooltip Title</h4>
              <p className="text-sm">This is a complex tooltip with multiple elements.</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipWrapper>
    );

    await waitFor(() => {
      const titles = screen.getAllByText('Tooltip Title');
      const descriptions = screen.getAllByText('This is a complex tooltip with multiple elements.');
      expect(titles.length).toBeGreaterThan(0);
      expect(descriptions.length).toBeGreaterThan(0);
    });
  });
});