import { render, screen } from '@testing-library/react'
import { Alert, AlertTitle, AlertDescription } from '../alert'

describe('Alert', () => {
  it('renders with default variant', () => {
    render(
      <Alert>
        <AlertTitle>Test Title</AlertTitle>
        <AlertDescription>Test description</AlertDescription>
      </Alert>
    )
    
    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveClass('bg-background', 'text-foreground')
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('renders with destructive variant', () => {
    render(
      <Alert variant="destructive">
        <AlertTitle>Error Title</AlertTitle>
        <AlertDescription>Error description</AlertDescription>
      </Alert>
    )
    
    const alert = screen.getByRole('alert')
    expect(alert).toHaveClass('border-destructive/50', 'text-destructive')
  })

  it('applies custom className', () => {
    render(
      <Alert className="custom-class">
        <AlertTitle>Title</AlertTitle>
      </Alert>
    )
    
    const alert = screen.getByRole('alert')
    expect(alert).toHaveClass('custom-class')
  })

  it('renders AlertTitle with proper styling', () => {
    render(
      <Alert>
        <AlertTitle className="custom-title">Custom Title</AlertTitle>
      </Alert>
    )
    
    const title = screen.getByText('Custom Title')
    expect(title).toHaveClass('mb-1', 'font-medium', 'leading-none', 'tracking-tight', 'custom-title')
  })

  it('renders AlertDescription with proper styling', () => {
    render(
      <Alert>
        <AlertDescription className="custom-desc">Custom Description</AlertDescription>
      </Alert>
    )
    
    const description = screen.getByText('Custom Description')
    expect(description).toHaveClass('text-sm', '[&_p]:leading-relaxed', 'custom-desc')
  })

  it('supports icon placement with proper spacing', () => {
    const { container } = render(
      <Alert>
        <svg data-testid="alert-icon" />
        <AlertTitle>Title with Icon</AlertTitle>
        <AlertDescription>Description with Icon</AlertDescription>
      </Alert>
    )
    
    const alert = container.firstChild as HTMLElement
    expect(alert).toHaveClass('[&>svg~*]:pl-7', '[&>svg+div]:translate-y-[-3px]', '[&>svg]:absolute', '[&>svg]:left-4', '[&>svg]:top-4')
    expect(screen.getByTestId('alert-icon')).toBeInTheDocument()
  })
})