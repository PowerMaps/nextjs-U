import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toggle } from '../toggle';

describe('Toggle', () => {
  it('renders correctly', () => {
    render(<Toggle>Toggle me</Toggle>);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Toggle me')).toBeInTheDocument();
  });

  it('handles toggle functionality', () => {
    const onPressedChange = jest.fn();
    render(
      <Toggle onPressedChange={onPressedChange}>
        Toggle me
      </Toggle>
    );
    
    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);
    
    expect(onPressedChange).toHaveBeenCalledWith(true);
  });

  it('applies different variants', () => {
    const { rerender } = render(<Toggle variant="default">Default</Toggle>);
    expect(screen.getByRole('button')).toHaveClass('bg-transparent');
    
    rerender(<Toggle variant="outline">Outline</Toggle>);
    expect(screen.getByRole('button')).toHaveClass('border', 'border-input');
  });

  it('applies different sizes', () => {
    const { rerender } = render(<Toggle size="default">Default</Toggle>);
    expect(screen.getByRole('button')).toHaveClass('h-10', 'px-3');
    
    rerender(<Toggle size="sm">Small</Toggle>);
    expect(screen.getByRole('button')).toHaveClass('h-9', 'px-2.5');
    
    rerender(<Toggle size="lg">Large</Toggle>);
    expect(screen.getByRole('button')).toHaveClass('h-11', 'px-5');
  });

  it('handles pressed state', () => {
    render(<Toggle pressed={true}>Pressed</Toggle>);
    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toHaveAttribute('data-state', 'on');
  });

  it('can be disabled', () => {
    render(<Toggle disabled>Disabled</Toggle>);
    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toBeDisabled();
    expect(toggleButton).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50');
  });
});