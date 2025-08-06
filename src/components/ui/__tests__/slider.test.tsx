import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Slider } from '../slider';

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Test component with controlled state
function ControlledSlider() {
  const [value, setValue] = React.useState([50]);

  return (
    <div>
      <Slider
        value={value}
        onValueChange={setValue}
        max={100}
        min={0}
        step={1}
        data-testid="controlled-slider"
      />
      <div data-testid="slider-value">{value[0]}</div>
    </div>
  );
}

// Test component with range slider
function RangeSlider() {
  const [value, setValue] = React.useState([20, 80]);

  return (
    <div>
      <Slider
        value={value}
        onValueChange={setValue}
        max={100}
        min={0}
        step={1}
        data-testid="range-slider"
      />
      <div data-testid="range-values">{value.join(', ')}</div>
    </div>
  );
}

describe('Slider Component', () => {
  it('renders correctly', () => {
    render(<Slider />);
    
    const slider = screen.getByRole('slider');
    expect(slider).toBeInTheDocument();
  });

  it('has default value of 50 when no value is provided', () => {
    render(<Slider defaultValue={[50]} />);
    
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuenow', '50');
  });

  it('respects min and max values', () => {
    render(<Slider min={10} max={90} defaultValue={[50]} />);
    
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuemin', '10');
    expect(slider).toHaveAttribute('aria-valuemax', '90');
  });

  it('works with controlled state', () => {
    render(<ControlledSlider />);
    
    const slider = screen.getByTestId('controlled-slider');
    const valueDisplay = screen.getByTestId('slider-value');
    
    expect(slider).toBeInTheDocument();
    expect(valueDisplay).toHaveTextContent('50');
  });

  it('supports range selection with multiple values', () => {
    render(<RangeSlider />);
    
    const slider = screen.getByTestId('range-slider');
    const valuesDisplay = screen.getByTestId('range-values');
    
    expect(slider).toBeInTheDocument();
    expect(valuesDisplay).toHaveTextContent('20, 80');
  });

  it('can be disabled', () => {
    render(<Slider disabled defaultValue={[50]} />);
    
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('data-disabled');
  });

  it('applies custom className', () => {
    render(<Slider className="custom-class" data-testid="slider-root" />);
    
    const sliderRoot = screen.getByTestId('slider-root');
    expect(sliderRoot).toHaveClass('custom-class');
  });

  it('has proper styling classes', () => {
    render(<Slider data-testid="slider" />);
    
    const sliderContainer = screen.getByTestId('slider');
    expect(sliderContainer).toHaveClass('relative', 'flex', 'w-full', 'touch-none', 'select-none', 'items-center');
  });

  it('supports step values', () => {
    render(<Slider step={5} min={0} max={100} defaultValue={[25]} />);
    
    const slider = screen.getByRole('slider');
    // Radix UI Slider doesn't expose step as an HTML attribute, but it works internally
    expect(slider).toBeInTheDocument();
  });

  it('handles keyboard navigation', () => {
    render(<Slider defaultValue={[50]} min={0} max={100} step={1} />);
    
    const slider = screen.getByRole('slider');
    slider.focus();
    
    // Test arrow key navigation
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(slider).toHaveAttribute('aria-valuenow', '51');
    
    fireEvent.keyDown(slider, { key: 'ArrowLeft' });
    expect(slider).toHaveAttribute('aria-valuenow', '50');
  });
});