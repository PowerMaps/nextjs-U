import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Switch } from '../switch';

describe('Switch Component', () => {
  it('renders correctly', () => {
    render(<Switch />);
    
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeInTheDocument();
  });

  it('starts unchecked by default', () => {
    render(<Switch />);
    
    const switchElement = screen.getByRole('switch');
    expect(switchElement).not.toBeChecked();
  });

  it('can be toggled on and off', () => {
    render(<Switch />);
    
    const switchElement = screen.getByRole('switch');
    
    // Initially unchecked
    expect(switchElement).not.toBeChecked();
    
    // Click to check
    fireEvent.click(switchElement);
    expect(switchElement).toBeChecked();
    
    // Click again to uncheck
    fireEvent.click(switchElement);
    expect(switchElement).not.toBeChecked();
  });

  it('respects controlled state', () => {
    const handleChange = jest.fn();
    render(<Switch checked={true} onCheckedChange={handleChange} />);
    
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeChecked();
    
    fireEvent.click(switchElement);
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it('can be disabled', () => {
    render(<Switch disabled />);
    
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeDisabled();
  });

  it('applies custom className', () => {
    render(<Switch className="custom-class" />);
    
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveClass('custom-class');
  });

  it('has proper styling classes', () => {
    render(<Switch />);
    
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveClass('peer', 'inline-flex', 'h-6', 'w-11', 'cursor-pointer');
  });
});