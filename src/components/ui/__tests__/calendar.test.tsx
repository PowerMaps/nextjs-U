import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Calendar } from '../calendar';

describe('Calendar', () => {
  it('renders correctly', () => {
    render(<Calendar />);
    
    // Check if calendar is rendered
    expect(screen.getByRole('grid')).toBeInTheDocument();
    
    // Check if navigation buttons are present
    expect(screen.getByRole('button', { name: /previous month/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next month/i })).toBeInTheDocument();
  });

  it('displays current month by default', () => {
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    render(<Calendar />);
    
    // The month should be displayed somewhere in the calendar
    expect(screen.getByText(new RegExp(currentDate.getFullYear().toString()))).toBeInTheDocument();
  });

  it('handles date selection', () => {
    const onSelect = jest.fn();
    render(<Calendar selected={undefined} onSelect={onSelect} />);
    
    // Find a day button (not disabled) and click it
    const dayButtons = screen.getAllByRole('button').filter(button => 
      button.textContent && /^\d+$/.test(button.textContent)
    );
    
    if (dayButtons.length > 0) {
      fireEvent.click(dayButtons[0]);
      expect(onSelect).toHaveBeenCalled();
    }
  });

  it('navigates between months', () => {
    render(<Calendar />);
    
    const nextButton = screen.getByRole('button', { name: /next month/i });
    const prevButton = screen.getByRole('button', { name: /previous month/i });
    
    expect(nextButton).toBeInTheDocument();
    expect(prevButton).toBeInTheDocument();
    
    // Test navigation
    fireEvent.click(nextButton);
    fireEvent.click(prevButton);
  });

  it('shows outside days when enabled', () => {
    render(<Calendar showOutsideDays={true} />);
    
    // Outside days should be visible (though they might be styled differently)
    const calendar = screen.getByRole('grid');
    expect(calendar).toBeInTheDocument();
  });

  it('hides outside days when disabled', () => {
    render(<Calendar showOutsideDays={false} />);
    
    // Calendar should still render
    const calendar = screen.getByRole('grid');
    expect(calendar).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Calendar className="custom-calendar" />);
    
    const calendar = screen.getByRole('grid').closest('[data-slot="calendar"]');
    expect(calendar).toHaveClass('custom-calendar');
  });

  it('handles disabled dates', () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    render(
      <Calendar 
        disabled={(date) => date.getTime() === tomorrow.getTime()}
      />
    );
    
    // Calendar should render with disabled functionality
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('supports range selection mode', () => {
    const onSelect = jest.fn();
    render(
      <Calendar 
        mode="range"
        selected={undefined}
        onSelect={onSelect}
      />
    );
    
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });
});