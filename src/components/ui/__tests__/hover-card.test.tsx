import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '../hover-card';
import { Button } from '../button';

describe('HoverCard Component', () => {
  it('renders trigger element correctly', () => {
    render(
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button>Hover me</Button>
        </HoverCardTrigger>
        <HoverCardContent>
          <div>Hover card content</div>
        </HoverCardContent>
      </HoverCard>
    );

    const trigger = screen.getByText('Hover me');
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('data-state', 'closed');
  });

  it('renders with controlled open state', async () => {
    render(
      <HoverCard open={true}>
        <HoverCardTrigger asChild>
          <Button>Trigger</Button>
        </HoverCardTrigger>
        <HoverCardContent data-testid="hover-card-content">
          <div>Always visible hover card</div>
        </HoverCardContent>
      </HoverCard>
    );

    const trigger = screen.getByText('Trigger');
    expect(trigger).toHaveAttribute('data-state', 'open');

    await waitFor(() => {
      const content = screen.getByTestId('hover-card-content');
      expect(content).toBeInTheDocument();
    });
  });

  it('applies correct CSS classes to content when open', async () => {
    render(
      <HoverCard open={true}>
        <HoverCardTrigger asChild>
          <Button>Trigger</Button>
        </HoverCardTrigger>
        <HoverCardContent data-testid="hover-card-content">
          <div>Hover card content</div>
        </HoverCardContent>
      </HoverCard>
    );

    await waitFor(() => {
      const content = screen.getByTestId('hover-card-content');
      expect(content).toHaveClass(
        'z-50',
        'w-64',
        'rounded-md',
        'border',
        'bg-popover',
        'p-4',
        'text-popover-foreground',
        'shadow-md',
        'outline-none'
      );
    });
  });

  it('accepts custom className', async () => {
    render(
      <HoverCard open={true}>
        <HoverCardTrigger asChild>
          <Button>Trigger</Button>
        </HoverCardTrigger>
        <HoverCardContent className="custom-hover-card" data-testid="hover-card-content">
          <div>Hover card content</div>
        </HoverCardContent>
      </HoverCard>
    );

    await waitFor(() => {
      const content = screen.getByTestId('hover-card-content');
      expect(content).toHaveClass('custom-hover-card');
    });
  });

  it('supports custom alignment', async () => {
    render(
      <HoverCard open={true}>
        <HoverCardTrigger asChild>
          <Button>Trigger</Button>
        </HoverCardTrigger>
        <HoverCardContent align="start" data-testid="hover-card-content">
          <div>Hover card content</div>
        </HoverCardContent>
      </HoverCard>
    );

    await waitFor(() => {
      const content = screen.getByTestId('hover-card-content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveAttribute('data-align', 'start');
    });
  });

  it('supports custom sideOffset', async () => {
    render(
      <HoverCard open={true}>
        <HoverCardTrigger asChild>
          <Button>Trigger</Button>
        </HoverCardTrigger>
        <HoverCardContent sideOffset={10} data-testid="hover-card-content">
          <div>Hover card content</div>
        </HoverCardContent>
      </HoverCard>
    );

    await waitFor(() => {
      const content = screen.getByTestId('hover-card-content');
      expect(content).toBeInTheDocument();
    });
  });

  it('can be controlled externally', async () => {
    const ControlledHoverCard = () => {
      const [open, setOpen] = React.useState(false);

      return (
        <div>
          <Button onClick={() => setOpen(!open)} data-testid="control-button">
            {open ? 'Hide' : 'Show'} hover card
          </Button>
          <HoverCard open={open} onOpenChange={setOpen}>
            <HoverCardTrigger asChild>
              <Button>Trigger</Button>
            </HoverCardTrigger>
            <HoverCardContent data-testid="hover-card-content">
              <div>Controlled hover card content</div>
            </HoverCardContent>
          </HoverCard>
        </div>
      );
    };

    render(<ControlledHoverCard />);

    const controlButton = screen.getByTestId('control-button');
    expect(controlButton).toHaveTextContent('Show hover card');

    // Content should not be visible initially
    expect(screen.queryByTestId('hover-card-content')).not.toBeInTheDocument();

    // Click to show hover card
    fireEvent.click(controlButton);

    await waitFor(() => {
      expect(screen.getByTestId('hover-card-content')).toBeInTheDocument();
      expect(controlButton).toHaveTextContent('Hide hover card');
    });

    // Click to hide hover card
    fireEvent.click(controlButton);

    await waitFor(() => {
      expect(screen.queryByTestId('hover-card-content')).not.toBeInTheDocument();
      expect(controlButton).toHaveTextContent('Show hover card');
    });
  });

  it('forwards refs correctly when open', async () => {
    const contentRef = React.createRef<HTMLDivElement>();

    render(
      <HoverCard open={true}>
        <HoverCardTrigger asChild>
          <Button>Trigger</Button>
        </HoverCardTrigger>
        <HoverCardContent ref={contentRef}>
          <div>Hover card content</div>
        </HoverCardContent>
      </HoverCard>
    );

    await waitFor(() => {
      expect(contentRef.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  it('works with different trigger elements', () => {
    render(
      <HoverCard>
        <HoverCardTrigger asChild>
          <span>Hover this span</span>
        </HoverCardTrigger>
        <HoverCardContent>
          <div>Span hover card</div>
        </HoverCardContent>
      </HoverCard>
    );

    const trigger = screen.getByText('Hover this span');
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('data-state', 'closed');
  });

  it('supports different positioning sides', async () => {
    render(
      <HoverCard open={true}>
        <HoverCardTrigger asChild>
          <Button>Trigger</Button>
        </HoverCardTrigger>
        <HoverCardContent side="top" data-testid="hover-card-content">
          <div>Top hover card</div>
        </HoverCardContent>
      </HoverCard>
    );

    await waitFor(() => {
      const content = screen.getByTestId('hover-card-content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveAttribute('data-side', 'top');
    });
  });

  it('supports complex content with user profile example', async () => {
    render(
      <HoverCard open={true}>
        <HoverCardTrigger asChild>
          <Button>@username</Button>
        </HoverCardTrigger>
        <HoverCardContent data-testid="hover-card-content">
          <div className="flex justify-between space-x-4">
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">@username</h4>
              <p className="text-sm">
                The React Framework – created and maintained by @vercel.
              </p>
              <div className="flex items-center pt-2">
                <span className="text-xs text-muted-foreground">
                  Joined December 2021
                </span>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    );

    await waitFor(() => {
      const content = screen.getByTestId('hover-card-content');
      expect(content).toBeInTheDocument();
      expect(screen.getByText('The React Framework – created and maintained by @vercel.')).toBeInTheDocument();
      expect(screen.getByText('Joined December 2021')).toBeInTheDocument();
    });
  });

  it('supports custom open and close delays', async () => {
    render(
      <HoverCard openDelay={100} closeDelay={200}>
        <HoverCardTrigger asChild>
          <Button>Trigger with delays</Button>
        </HoverCardTrigger>
        <HoverCardContent data-testid="hover-card-content">
          <div>Delayed hover card</div>
        </HoverCardContent>
      </HoverCard>
    );

    const trigger = screen.getByText('Trigger with delays');
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('data-state', 'closed');
  });

  it('renders with proper data attributes', async () => {
    render(
      <HoverCard open={true}>
        <HoverCardTrigger asChild>
          <Button>Trigger</Button>
        </HoverCardTrigger>
        <HoverCardContent data-testid="hover-card-content">
          <div>Hover card content</div>
        </HoverCardContent>
      </HoverCard>
    );

    const trigger = screen.getByText('Trigger');
    
    await waitFor(() => {
      const content = screen.getByTestId('hover-card-content');
      expect(content).toBeInTheDocument();
      
      // Check that trigger has proper data attributes
      expect(trigger).toHaveAttribute('data-state', 'open');
      expect(content).toHaveAttribute('data-state', 'open');
    });
  });
});