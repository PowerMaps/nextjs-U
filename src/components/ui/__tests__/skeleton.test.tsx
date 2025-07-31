import React from 'react';
import { render, screen } from '@testing-library/react';
import { Skeleton } from '../skeleton';

describe('Skeleton Component', () => {
  it('renders with default classes', () => {
    render(<Skeleton data-testid="skeleton" />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('animate-pulse', 'rounded-md', 'bg-muted');
  });

  it('accepts custom className', () => {
    render(<Skeleton className="h-4 w-full" data-testid="skeleton" />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('animate-pulse', 'rounded-md', 'bg-muted', 'h-4', 'w-full');
  });

  it('forwards HTML attributes', () => {
    render(<Skeleton data-testid="skeleton" id="test-skeleton" role="presentation" />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveAttribute('id', 'test-skeleton');
    expect(skeleton).toHaveAttribute('role', 'presentation');
  });

  it('renders multiple skeleton elements for loading states', () => {
    render(
      <div>
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" data-testid="avatar-skeleton" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" data-testid="title-skeleton" />
            <Skeleton className="h-4 w-[200px]" data-testid="subtitle-skeleton" />
          </div>
        </div>
      </div>
    );

    const avatarSkeleton = screen.getByTestId('avatar-skeleton');
    const titleSkeleton = screen.getByTestId('title-skeleton');
    const subtitleSkeleton = screen.getByTestId('subtitle-skeleton');

    expect(avatarSkeleton).toHaveClass('h-12', 'w-12', 'rounded-full');
    expect(titleSkeleton).toHaveClass('h-4', 'w-[250px]');
    expect(subtitleSkeleton).toHaveClass('h-4', 'w-[200px]');

    // All should have the base skeleton classes
    [avatarSkeleton, titleSkeleton, subtitleSkeleton].forEach(skeleton => {
      expect(skeleton).toHaveClass('animate-pulse', 'bg-muted');
    });
    
    // Check specific classes for each skeleton
    expect(avatarSkeleton).toHaveClass('rounded-full'); // overrides rounded-md
    expect(titleSkeleton).toHaveClass('rounded-md');
    expect(subtitleSkeleton).toHaveClass('rounded-md');
  });

  it('can be used for card loading state', () => {
    render(
      <div className="flex flex-col space-y-3">
        <Skeleton className="h-[125px] w-[250px] rounded-xl" data-testid="card-image" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" data-testid="card-title" />
          <Skeleton className="h-4 w-[200px]" data-testid="card-description" />
        </div>
      </div>
    );

    const cardImage = screen.getByTestId('card-image');
    const cardTitle = screen.getByTestId('card-title');
    const cardDescription = screen.getByTestId('card-description');

    expect(cardImage).toHaveClass('h-[125px]', 'w-[250px]', 'rounded-xl');
    expect(cardTitle).toHaveClass('h-4', 'w-[250px]');
    expect(cardDescription).toHaveClass('h-4', 'w-[200px]');
  });

  it('can be used for table loading state', () => {
    render(
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex space-x-4">
            <Skeleton className="h-4 w-[100px]" data-testid={`table-cell-${i}-0`} />
            <Skeleton className="h-4 w-[150px]" data-testid={`table-cell-${i}-1`} />
            <Skeleton className="h-4 w-[80px]" data-testid={`table-cell-${i}-2`} />
          </div>
        ))}
      </div>
    );

    // Check that all table skeleton cells are rendered
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const cell = screen.getByTestId(`table-cell-${i}-${j}`);
        expect(cell).toBeInTheDocument();
        expect(cell).toHaveClass('animate-pulse', 'rounded-md', 'bg-muted');
      }
    }
  });

  it('has proper animation class for loading effect', () => {
    render(<Skeleton data-testid="skeleton" />);
    
    const skeleton = screen.getByTestId('skeleton');
    
    // Check that the animate-pulse class is present for the loading animation
    expect(skeleton).toHaveClass('animate-pulse');
    
    // Check that it has the proper background for the skeleton effect
    expect(skeleton).toHaveClass('bg-muted');
  });
});