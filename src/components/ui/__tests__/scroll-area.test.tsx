import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ScrollArea, ScrollBar } from '../scroll-area';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';

describe('ScrollArea', () => {
  it('renders scroll area with content', () => {
    render(
      <ScrollArea className="h-72 w-48">
        <div className="p-4">
          <h4 className="mb-4 text-sm font-medium leading-none">Tags</h4>
          {Array.from({ length: 50 }).map((_, i) => (
            <div key={i} className="text-sm">
              Item {i + 1}
            </div>
          ))}
        </div>
      </ScrollArea>
    );

    expect(screen.getByText('Tags')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 50')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const { container } = render(
      <ScrollArea className="custom-scroll-area h-48">
        <div>Content</div>
      </ScrollArea>
    );

    const scrollArea = container.firstChild as HTMLElement;
    expect(scrollArea).toHaveClass('custom-scroll-area');
    expect(scrollArea).toHaveClass('h-48');
    expect(scrollArea).toHaveClass('relative');
    expect(scrollArea).toHaveClass('overflow-hidden');
  });

  it('renders scroll area with horizontal orientation', () => {
    render(
      <ScrollArea className="w-96 whitespace-nowrap">
        <div className="flex w-max space-x-4 p-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="shrink-0">
              Column {i + 1}
            </div>
          ))}
        </div>
      </ScrollArea>
    );

    expect(screen.getByText('Column 1')).toBeInTheDocument();
    expect(screen.getByText('Column 20')).toBeInTheDocument();
  });

  it('renders with scrollable content that overflows', () => {
    render(
      <ScrollArea className="h-20 w-48 border">
        <div className="p-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="text-sm py-2">
              Long item {i + 1} that might cause overflow
            </div>
          ))}
        </div>
      </ScrollArea>
    );

    expect(screen.getByText('Long item 1 that might cause overflow')).toBeInTheDocument();
    expect(screen.getByText('Long item 10 that might cause overflow')).toBeInTheDocument();
  });

  it('supports forwarded ref', () => {
    const ref = React.createRef<HTMLDivElement>();
    
    render(
      <ScrollArea ref={ref}>
        <div>Content</div>
      </ScrollArea>
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});