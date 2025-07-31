import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../collapsible';

describe('Collapsible', () => {
  it('renders collapsible with trigger and content', () => {
    render(
      <Collapsible>
        <CollapsibleTrigger asChild>
          <button>Toggle Content</button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div>Collapsible content here</div>
        </CollapsibleContent>
      </Collapsible>
    );

    expect(screen.getByText('Toggle Content')).toBeInTheDocument();
    // Content should not be visible initially
    expect(screen.queryByText('Collapsible content here')).toBeNull();
  });

  it('expands content when trigger is clicked', () => {
    render(
      <Collapsible>
        <CollapsibleTrigger asChild>
          <button>Toggle Content</button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div>Collapsible content here</div>
        </CollapsibleContent>
      </Collapsible>
    );

    const trigger = screen.getByText('Toggle Content');
    fireEvent.click(trigger);

    expect(screen.getByText('Collapsible content here')).toBeInTheDocument();
  });

  it('collapses content when trigger is clicked again', () => {
    render(
      <Collapsible>
        <CollapsibleTrigger asChild>
          <button>Toggle Content</button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div>Collapsible content here</div>
        </CollapsibleContent>
      </Collapsible>
    );

    const trigger = screen.getByText('Toggle Content');
    
    // Expand
    fireEvent.click(trigger);
    expect(screen.getByText('Collapsible content here')).toBeInTheDocument();
    
    // Collapse
    fireEvent.click(trigger);
    expect(screen.queryByText('Collapsible content here')).toBeNull();
  });

  it('supports defaultOpen prop', () => {
    render(
      <Collapsible defaultOpen>
        <CollapsibleTrigger asChild>
          <button>Toggle Content</button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div>Initially visible content</div>
        </CollapsibleContent>
      </Collapsible>
    );

    // Content should be visible initially when defaultOpen is true
    expect(screen.getByText('Initially visible content')).toBeInTheDocument();
  });

  it('supports controlled state with open prop', () => {
    const TestComponent = () => {
      const [isOpen, setIsOpen] = React.useState(false);
      
      return (
        <div>
          <button onClick={() => setIsOpen(!isOpen)}>
            External Toggle
          </button>
          <Collapsible open={isOpen}>
            <CollapsibleTrigger asChild>
              <button>Internal Toggle</button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div>Controlled content</div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      );
    };

    render(<TestComponent />);

    const externalToggle = screen.getByText('External Toggle');
    
    // Initially closed
    expect(screen.queryByText('Controlled content')).toBeNull();
    
    // Open via external control
    fireEvent.click(externalToggle);
    expect(screen.getByText('Controlled content')).toBeInTheDocument();
  });
});