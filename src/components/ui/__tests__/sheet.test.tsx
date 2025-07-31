import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../sheet';

describe('Sheet', () => {
  it('renders sheet trigger and opens sheet on click', () => {
    render(
      <Sheet>
        <SheetTrigger asChild>
          <button>Open Sheet</button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
            <SheetDescription>Sheet Description</SheetDescription>
          </SheetHeader>
          <div>Sheet Content</div>
        </SheetContent>
      </Sheet>
    );

    const trigger = screen.getByText('Open Sheet');
    expect(trigger).toBeInTheDocument();

    fireEvent.click(trigger);

    expect(screen.getByText('Sheet Title')).toBeInTheDocument();
    expect(screen.getByText('Sheet Description')).toBeInTheDocument();
    expect(screen.getByText('Sheet Content')).toBeInTheDocument();
  });

  it('renders sheet with different sides', () => {
    const { rerender } = render(
      <Sheet defaultOpen>
        <SheetContent side="left" data-testid="sheet-content">
          <SheetHeader>
            <SheetTitle>Left Sheet</SheetTitle>
            <SheetDescription>Left sheet description</SheetDescription>
          </SheetHeader>
          <div>Left Sheet</div>
        </SheetContent>
      </Sheet>
    );

    let sheetContent = screen.getByTestId('sheet-content');
    expect(sheetContent).toHaveClass('data-[state=open]:slide-in-from-left');

    rerender(
      <Sheet defaultOpen>
        <SheetContent side="right" data-testid="sheet-content">
          <SheetHeader>
            <SheetTitle>Right Sheet</SheetTitle>
            <SheetDescription>Right sheet description</SheetDescription>
          </SheetHeader>
          <div>Right Sheet</div>
        </SheetContent>
      </Sheet>
    );

    sheetContent = screen.getByTestId('sheet-content');
    expect(sheetContent).toHaveClass('data-[state=open]:slide-in-from-right');
  });

  it('renders sheet content with proper structure', () => {
    render(
      <Sheet defaultOpen>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Test Sheet</SheetTitle>
            <SheetDescription>Test sheet description</SheetDescription>
          </SheetHeader>
          <div>Sheet body content</div>
        </SheetContent>
      </Sheet>
    );

    expect(screen.getByText('Test Sheet')).toBeInTheDocument();
    expect(screen.getByText('Test sheet description')).toBeInTheDocument();
    expect(screen.getByText('Sheet body content')).toBeInTheDocument();
    
    // Verify close button exists
    const closeButton = screen.getByText('Close');
    expect(closeButton).toBeInTheDocument();
  });
});