import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
} from '../context-menu';

describe('Context Menu Component', () => {
  it('renders context menu trigger correctly', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>
          <div data-testid="trigger">Right click me</div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Item 1</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );

    expect(screen.getByTestId('trigger')).toBeInTheDocument();
    expect(screen.getByText('Right click me')).toBeInTheDocument();
  });

  it('shows context menu on right click', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>
          <div data-testid="trigger">Right click me</div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Copy</ContextMenuItem>
          <ContextMenuItem>Paste</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );

    const trigger = screen.getByTestId('trigger');
    fireEvent.contextMenu(trigger);

    expect(screen.getByText('Copy')).toBeInTheDocument();
    expect(screen.getByText('Paste')).toBeInTheDocument();
  });

  it('renders context menu items with shortcuts', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>
          <div data-testid="trigger">Right click me</div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>
            Copy
            <ContextMenuShortcut>⌘C</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>
            Paste
            <ContextMenuShortcut>⌘V</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );

    const trigger = screen.getByTestId('trigger');
    fireEvent.contextMenu(trigger);

    expect(screen.getByText('Copy')).toBeInTheDocument();
    expect(screen.getByText('⌘C')).toBeInTheDocument();
    expect(screen.getByText('Paste')).toBeInTheDocument();
    expect(screen.getByText('⌘V')).toBeInTheDocument();
  });

  it('renders context menu with checkbox items', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>
          <div data-testid="trigger">Right click me</div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuCheckboxItem checked={true}>
            Show Toolbar
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem checked={false}>
            Show Sidebar
          </ContextMenuCheckboxItem>
        </ContextMenuContent>
      </ContextMenu>
    );

    const trigger = screen.getByTestId('trigger');
    fireEvent.contextMenu(trigger);

    expect(screen.getByText('Show Toolbar')).toBeInTheDocument();
    expect(screen.getByText('Show Sidebar')).toBeInTheDocument();
  });

  it('renders context menu with radio items', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>
          <div data-testid="trigger">Right click me</div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuRadioGroup value="light">
            <ContextMenuRadioItem value="light">
              Light Theme
            </ContextMenuRadioItem>
            <ContextMenuRadioItem value="dark">
              Dark Theme
            </ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuContent>
      </ContextMenu>
    );

    const trigger = screen.getByTestId('trigger');
    fireEvent.contextMenu(trigger);

    expect(screen.getByText('Light Theme')).toBeInTheDocument();
    expect(screen.getByText('Dark Theme')).toBeInTheDocument();
  });

  it('renders context menu with labels and separators', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>
          <div data-testid="trigger">Right click me</div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuLabel>Edit</ContextMenuLabel>
          <ContextMenuItem>Copy</ContextMenuItem>
          <ContextMenuItem>Paste</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuLabel>View</ContextMenuLabel>
          <ContextMenuItem>Zoom In</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );

    const trigger = screen.getByTestId('trigger');
    fireEvent.contextMenu(trigger);

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('View')).toBeInTheDocument();
    expect(screen.getByText('Copy')).toBeInTheDocument();
    expect(screen.getByText('Zoom In')).toBeInTheDocument();
  });

  it('renders context menu with submenu', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>
          <div data-testid="trigger">Right click me</div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Copy</ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger>More Options</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem>Option 1</ContextMenuItem>
              <ContextMenuItem>Option 2</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuContent>
      </ContextMenu>
    );

    const trigger = screen.getByTestId('trigger');
    fireEvent.contextMenu(trigger);

    expect(screen.getByText('Copy')).toBeInTheDocument();
    expect(screen.getByText('More Options')).toBeInTheDocument();
  });

  it('handles menu item clicks', () => {
    const handleClick = jest.fn();

    render(
      <ContextMenu>
        <ContextMenuTrigger>
          <div data-testid="trigger">Right click me</div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={handleClick}>
            Copy
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );

    const trigger = screen.getByTestId('trigger');
    fireEvent.contextMenu(trigger);

    const copyItem = screen.getByText('Copy');
    fireEvent.click(copyItem);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders context menu with grouped items', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>
          <div data-testid="trigger">Right click me</div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuGroup>
            <ContextMenuItem>Copy</ContextMenuItem>
            <ContextMenuItem>Paste</ContextMenuItem>
          </ContextMenuGroup>
          <ContextMenuSeparator />
          <ContextMenuGroup>
            <ContextMenuItem>Delete</ContextMenuItem>
          </ContextMenuGroup>
        </ContextMenuContent>
      </ContextMenu>
    );

    const trigger = screen.getByTestId('trigger');
    fireEvent.contextMenu(trigger);

    expect(screen.getByText('Copy')).toBeInTheDocument();
    expect(screen.getByText('Paste')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });
});