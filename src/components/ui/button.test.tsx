import { render, screen } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders a button with children', () => {
    render(<Button>Test Button</Button>);
    const buttonElement = screen.getByText(/Test Button/i);
    expect(buttonElement).toBeInTheDocument();
  });

  it('renders a button with a specific variant', () => {
    render(<Button variant="destructive">Delete</Button>);
    const buttonElement = screen.getByText(/Delete/i);
    expect(buttonElement).toHaveClass('bg-destructive');
  });

  it('renders a button with a specific size', () => {
    render(<Button size="lg">Large Button</Button>);
    const buttonElement = screen.getByText(/Large Button/i);
    expect(buttonElement).toHaveClass('h-10 px-8');
  });
});
