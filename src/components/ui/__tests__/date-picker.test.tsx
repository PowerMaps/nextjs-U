import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DatePicker, DateRangePicker } from '../date-picker';

// Mock date-fns format function
jest.mock('date-fns', () => ({
  format: jest.fn((date, formatStr) => {
    if (formatStr === 'PPP') return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    if (formatStr === 'LLL dd, y') return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: '2-digit', 
      year: 'numeric' 
    });
    return date.toLocaleDateString();
  }),
}));

describe('DatePicker', () => {
  it('renders correctly with placeholder', () => {
    render(<DatePicker placeholder="Select date" />);
    
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Select date')).toBeInTheDocument();
  });

  it('displays selected date', () => {
    const testDate = new Date('2024-01-15');
    render(<DatePicker date={testDate} />);
    
    expect(screen.getByRole('button')).toBeInTheDocument();
    // The formatted date should be displayed (mocked format function)
    expect(screen.getByText(/January 15th, 2024/)).toBeInTheDocument();
  });

  it('opens calendar on button click', async () => {
    render(<DatePicker />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getAllByRole('grid')).toHaveLength(1);
    });
  });

  it('calls onDateChange when date is selected', async () => {
    const onDateChange = jest.fn();
    render(<DatePicker onDateChange={onDateChange} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getAllByRole('grid')).toHaveLength(1);
    });
    
    // Find a day button and click it
    const dayButtons = screen.getAllByRole('button').filter(btn => 
      btn.textContent && /^\d+$/.test(btn.textContent)
    );
    
    if (dayButtons.length > 0) {
      fireEvent.click(dayButtons[0]);
      expect(onDateChange).toHaveBeenCalled();
    }
  });

  it('can be disabled', () => {
    render(<DatePicker disabled />);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('applies custom className', () => {
    render(<DatePicker className="custom-date-picker" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-date-picker');
  });
});

describe('DateRangePicker', () => {
  it('renders correctly with placeholder', () => {
    render(<DateRangePicker placeholder="Select date range" />);
    
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Select date range')).toBeInTheDocument();
  });

  it('displays selected date range', () => {
    const dateRange = {
      from: new Date('2024-01-15'),
      to: new Date('2024-01-20')
    };
    render(<DateRangePicker dateRange={dateRange} />);
    
    expect(screen.getByRole('button')).toBeInTheDocument();
    // Both dates should be displayed (mocked format)
    expect(screen.getByText(/Jan 15, 2024/)).toBeInTheDocument();
  });

  it('displays single date when only from is selected', () => {
    const dateRange = {
      from: new Date('2024-01-15'),
      to: undefined
    };
    render(<DateRangePicker dateRange={dateRange} />);
    
    expect(screen.getByText(/Jan 15, 2024/)).toBeInTheDocument();
  });

  it('opens calendar on button click', async () => {
    render(<DateRangePicker />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getAllByRole('grid')).toHaveLength(2); // Range picker shows 2 months
    });
  });

  it('calls onDateRangeChange when range is selected', async () => {
    const onDateRangeChange = jest.fn();
    render(<DateRangePicker onDateRangeChange={onDateRangeChange} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getAllByRole('grid')).toHaveLength(2); // Range picker shows 2 months
    });
    
    // Find a day button and click it
    const dayButtons = screen.getAllByRole('button').filter(btn => 
      btn.textContent && /^\d+$/.test(btn.textContent)
    );
    
    if (dayButtons.length > 0) {
      fireEvent.click(dayButtons[0]);
      expect(onDateRangeChange).toHaveBeenCalled();
    }
  });

  it('can be disabled', () => {
    render(<DateRangePicker disabled />);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('applies custom className', () => {
    render(<DateRangePicker className="custom-date-range-picker" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-date-range-picker');
  });
});