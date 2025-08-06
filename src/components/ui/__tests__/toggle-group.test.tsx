import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToggleGroup, ToggleGroupItem } from '../toggle-group';

describe('ToggleGroup', () => {
  it('renders correctly with multiple items', () => {
    render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="option1">Option 1</ToggleGroupItem>
        <ToggleGroupItem value="option2">Option 2</ToggleGroupItem>
        <ToggleGroupItem value="option3">Option 3</ToggleGroupItem>
      </ToggleGroup>
    );
    
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('handles single selection', () => {
    const onValueChange = jest.fn();
    render(
      <ToggleGroup type="single" onValueChange={onValueChange}>
        <ToggleGroupItem value="option1">Option 1</ToggleGroupItem>
        <ToggleGroupItem value="option2">Option 2</ToggleGroupItem>
      </ToggleGroup>
    );
    
    fireEvent.click(screen.getByText('Option 1'));
    expect(onValueChange).toHaveBeenCalledWith('option1');
  });

  it('handles multiple selection', () => {
    const onValueChange = jest.fn();
    render(
      <ToggleGroup type="multiple" onValueChange={onValueChange}>
        <ToggleGroupItem value="option1">Option 1</ToggleGroupItem>
        <ToggleGroupItem value="option2">Option 2</ToggleGroupItem>
      </ToggleGroup>
    );
    
    fireEvent.click(screen.getByText('Option 1'));
    expect(onValueChange).toHaveBeenCalledWith(['option1']);
    
    fireEvent.click(screen.getByText('Option 2'));
    expect(onValueChange).toHaveBeenCalledWith(['option1', 'option2']);
  });

  it('applies variant and size from context', () => {
    render(
      <ToggleGroup type="single" variant="outline" size="sm">
        <ToggleGroupItem value="option1">Option 1</ToggleGroupItem>
      </ToggleGroup>
    );
    
    const item = screen.getByText('Option 1');
    expect(item).toHaveClass('border', 'border-input', 'h-9', 'px-2.5');
  });

  it('uses context variant when provided', () => {
    render(
      <ToggleGroup type="single" variant="outline">
        <ToggleGroupItem value="option1">Option 1</ToggleGroupItem>
      </ToggleGroup>
    );
    
    const item = screen.getByText('Option 1');
    expect(item).toHaveClass('border', 'border-input');
  });

  it('handles disabled state', () => {
    render(
      <ToggleGroup type="single" disabled>
        <ToggleGroupItem value="option1">Option 1</ToggleGroupItem>
      </ToggleGroup>
    );
    
    const item = screen.getByText('Option 1');
    expect(item).toBeDisabled();
  });

  it('maintains selected state', () => {
    render(
      <ToggleGroup type="single" value="option1">
        <ToggleGroupItem value="option1">Option 1</ToggleGroupItem>
        <ToggleGroupItem value="option2">Option 2</ToggleGroupItem>
      </ToggleGroup>
    );
    
    const selectedItem = screen.getByText('Option 1');
    expect(selectedItem).toHaveAttribute('data-state', 'on');
  });
});