import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Popover, PopoverTrigger, PopoverContent } from '../popover';
import { Button } from '../button';

describe('Popover Component', () => {
  it('renders trigger and content correctly', async () => {
    render(
      <Popover>
        <PopoverTrigger asChild>
          <Button>Open popover</Button>
        </PopoverTrigger>
        <PopoverContent>
          <div>Popover content</div>
        </PopoverContent>
      </Popover>
    );

    const trigger = screen.getByText('Open popover');
    expect(trigger).toBeInTheDocument();

    // Content should not be visible initially
    expect(screen.queryByText('Popover content')).not.toBeInTheDocument();

    // Click trigger to open popover
    fireEvent.click(trigger);

    // Content should now be visible
    await waitFor(() => {
      expect(screen.getByText('Popover content')).toBeInTheDocument();
    });
  });

  it('applies correct CSS classes to content', async () => {
    render(
      <Popover>
        <PopoverTrigger asChild>
          <Button>Open popover</Button>
        </PopoverTrigger>
        <PopoverContent data-testid="popover-content">
          <div>Popover content</div>
        </PopoverContent>
      </Popover>
    );

    const trigger = screen.getByText('Open popover');
    fireEvent.click(trigger);

    await waitFor(() => {
      const content = screen.getByTestId('popover-content');
      expect(content).toHaveClass(
        'z-50',
        'w-72',
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
      <Popover>
        <PopoverTrigger asChild>
          <Button>Open popover</Button>
        </PopoverTrigger>
        <PopoverContent className="custom-class" data-testid="popover-content">
          <div>Popover content</div>
        </PopoverContent>
      </Popover>
    );

    const trigger = screen.getByText('Open popover');
    fireEvent.click(trigger);

    await waitFor(() => {
      const content = screen.getByTestId('popover-content');
      expect(content).toHaveClass('custom-class');
    });
  });

  it('supports different alignment options', async () => {
    render(
      <Popover>
        <PopoverTrigger asChild>
          <Button>Open popover</Button>
        </PopoverTrigger>
        <PopoverContent align="start" data-testid="popover-content">
          <div>Popover content</div>
        </PopoverContent>
      </Popover>
    );

    const trigger = screen.getByText('Open popover');
    fireEvent.click(trigger);

    await waitFor(() => {
      const content = screen.getByTestId('popover-content');
      expect(content).toBeInTheDocument();
    });
  });

  it('supports custom sideOffset', async () => {
    render(
      <Popover>
        <PopoverTrigger asChild>
          <Button>Open popover</Button>
        </PopoverTrigger>
        <PopoverContent sideOffset={10} data-testid="popover-content">
          <div>Popover content</div>
        </PopoverContent>
      </Popover>
    );

    const trigger = screen.getByText('Open popover');
    fireEvent.click(trigger);

    await waitFor(() => {
      const content = screen.getByTestId('popover-content');
      expect(content).toBeInTheDocument();
    });
  });

  it('closes when pressing escape key', async () => {
    render(
      <Popover>
        <PopoverTrigger asChild>
          <Button>Open popover</Button>
        </PopoverTrigger>
        <PopoverContent>
          <div>Popover content</div>
        </PopoverContent>
      </Popover>
    );

    const trigger = screen.getByText('Open popover');
    fireEvent.click(trigger);

    // Content should be visible
    await waitFor(() => {
      expect(screen.getByText('Popover content')).toBeInTheDocument();
    });

    // Press escape key
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

    // Content should be hidden
    await waitFor(() => {
      expect(screen.queryByText('Popover content')).not.toBeInTheDocument();
    });
  });

  it('can be controlled externally', async () => {
    const ControlledPopover = () => {
      const [open, setOpen] = React.useState(false);

      return (
        <div>
          <Button onClick={() => setOpen(!open)} data-testid="external-trigger">
            {open ? 'Close' : 'Open'} popover
          </Button>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button>Trigger</Button>
            </PopoverTrigger>
            <PopoverContent>
              <div>Controlled popover content</div>
            </PopoverContent>
          </Popover>
        </div>
      );
    };

    render(<ControlledPopover />);

    const externalTrigger = screen.getByTestId('external-trigger');
    expect(externalTrigger).toHaveTextContent('Open popover');

    // Content should not be visible initially
    expect(screen.queryByText('Controlled popover content')).not.toBeInTheDocument();

    // Click external trigger to open
    fireEvent.click(externalTrigger);

    await waitFor(() => {
      expect(screen.getByText('Controlled popover content')).toBeInTheDocument();
      expect(externalTrigger).toHaveTextContent('Close popover');
    });

    // Click external trigger to close
    fireEvent.click(externalTrigger);

    await waitFor(() => {
      expect(screen.queryByText('Controlled popover content')).not.toBeInTheDocument();
      expect(externalTrigger).toHaveTextContent('Open popover');
    });
  });

  it('forwards refs correctly', async () => {
    const contentRef = React.createRef<HTMLDivElement>();

    render(
      <Popover>
        <PopoverTrigger asChild>
          <Button>Open popover</Button>
        </PopoverTrigger>
        <PopoverContent ref={contentRef}>
          <div>Popover content</div>
        </PopoverContent>
      </Popover>
    );

    const trigger = screen.getByText('Open popover');
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(contentRef.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  it('supports complex content with interactive elements', async () => {
    const handleButtonClick = jest.fn();

    render(
      <Popover>
        <PopoverTrigger asChild>
          <Button>Open popover</Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="space-y-2">
            <h3 className="font-medium">Popover Title</h3>
            <p className="text-sm text-muted-foreground">
              This is a popover with interactive content.
            </p>
            <Button onClick={handleButtonClick} size="sm">
              Action Button
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    );

    const trigger = screen.getByText('Open popover');
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('Popover Title')).toBeInTheDocument();
      expect(screen.getByText('This is a popover with interactive content.')).toBeInTheDocument();
    });

    const actionButton = screen.getByText('Action Button');
    fireEvent.click(actionButton);

    expect(handleButtonClick).toHaveBeenCalledTimes(1);
  });
});