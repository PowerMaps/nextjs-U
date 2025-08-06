import { render, screen, act } from '@testing-library/react'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import { Toaster } from '../sonner'
import { it } from 'date-fns/locale'
import { it } from 'date-fns/locale'
import { it } from 'date-fns/locale'
import { it } from 'date-fns/locale'
import { it } from 'date-fns/locale'
import { beforeEach } from 'node:test'
import { describe } from 'node:test'

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}))

// Mock sonner
jest.mock('sonner', () => ({
  Toaster: ({ theme, className, toastOptions, position, expand, ...props }: any) => (
    <div 
      data-testid="sonner-toaster" 
      data-theme={theme}
      className={className}
      data-toast-options={JSON.stringify(toastOptions)}
      data-position={position}
      data-expand={expand}
      {...props}
    />
  ),
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}))

const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>

describe('Toaster (Sonner)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders with default theme from next-themes', () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: jest.fn(),
      resolvedTheme: 'light',
      themes: ['light', 'dark'],
      systemTheme: 'light',
    })

    render(<Toaster />)
    
    const toaster = screen.getByTestId('sonner-toaster')
    expect(toaster).toBeInTheDocument()
    expect(toaster).toHaveAttribute('data-theme', 'light')
    expect(toaster).toHaveClass('toaster', 'group')
  })

  it('renders with dark theme', () => {
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: jest.fn(),
      resolvedTheme: 'dark',
      themes: ['light', 'dark'],
      systemTheme: 'dark',
    })

    render(<Toaster />)
    
    const toaster = screen.getByTestId('sonner-toaster')
    expect(toaster).toHaveAttribute('data-theme', 'dark')
  })

  it('falls back to system theme when no theme is set', () => {
    mockUseTheme.mockReturnValue({
      theme: undefined,
      setTheme: jest.fn(),
      resolvedTheme: undefined,
      themes: ['light', 'dark'],
      systemTheme: 'light',
    })

    render(<Toaster />)
    
    const toaster = screen.getByTestId('sonner-toaster')
    expect(toaster).toHaveAttribute('data-theme', 'system')
  })

  it('applies correct toast styling classes', () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: jest.fn(),
      resolvedTheme: 'light',
      themes: ['light', 'dark'],
      systemTheme: 'light',
    })

    render(<Toaster />)
    
    const toaster = screen.getByTestId('sonner-toaster')
    const toastOptions = JSON.parse(toaster.getAttribute('data-toast-options') || '{}')
    
    expect(toastOptions.classNames).toEqual({
      toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
      description: "group-[.toast]:text-muted-foreground",
      actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
      cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
    })
  })

  it('accepts custom props', () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: jest.fn(),
      resolvedTheme: 'light',
      themes: ['light', 'dark'],
      systemTheme: 'light',
    })

    render(<Toaster position="top-right" expand />)
    
    const toaster = screen.getByTestId('sonner-toaster')
    expect(toaster).toHaveAttribute('data-position', 'top-right')
    expect(toaster).toHaveAttribute('data-expand', 'true')
  })
})