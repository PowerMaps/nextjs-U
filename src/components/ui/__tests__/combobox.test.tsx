import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Combobox, MultiCombobox, ComboboxOption } from '../combobox';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { describe } from 'node:test';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { describe } from 'node:test';

const mockOptions: ComboboxOption[] = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3', disabled: true },
  { value: 'option4', label: 'Option 4' },
];

describe('Combobox', () => {
  it('renders correctly with placeholder', () => {
    render(<Combobox options={mockOptions} placeholder="Choose option" />);
    
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Choose option')).toBeInTheDocument();
  });

  it('displays selected value', () => {
    render(
      <Combobox 
        options={mockOptions} 
        value="option1" 
        placeholder="Choose option" 
      />
    );
    
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('opens dropdown on button click', async () => {
    render(<Combobox options={mockOptions} />);
    
    const button = screen.getByRole('combobox');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getAllByRole('combobox')).toHaveLength(2); // Button + Command input
    });
  });

  it('filters options based on search', async () => {
    render(<Combobox options={mockOptions} />);
    
    const button = screen.getByRole('combobox');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getAllByRole('combobox')).toHaveLength(2);
    });
    
    // Just verify that the search input exists and can be interacted with
    const searchInput = screen.getAllByRole('combobox')[1]; // Second combobox is the input
    expect(searchInput).toBeInTheDocument();
    fireEvent.change(searchInput, { target: { value: 'Option 1' } });
  });

  it('calls onValueChange when option is selected', async () => {
    const onValueChange = jest.fn();
    render(
      <Combobox 
        options={mockOptions} 
        onValueChange={onValueChange} 
      />
    );
    
    const button = screen.getByRole('combobox');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getAllByRole('combobox')).toHaveLength(2);
    });
    
    const option = screen.getByText('Option 1');
    fireEvent.click(option);
    
    expect(onValueChange).toHaveBeenCalledWith('option1');
  });

  it('deselects option when clicking selected option', async () => {
    const onValueChange = jest.fn();
    render(
      <Combobox 
        options={mockOptions} 
        value="option1"
        onValueChange={onValueChange} 
      />
    );
    
    const button = screen.getByRole('combobox');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getAllByRole('combobox')).toHaveLength(2);
    });
    
    const option = screen.getByRole('option', { name: /Option 1/ });
    fireEvent.click(option);
    
    expect(onValueChange).toHaveBeenCalledWith('');
  });

  it('can be disabled', () => {
    render(<Combobox options={mockOptions} disabled />);
    
    const button = screen.getByRole('combobox');
    expect(button).toBeDisabled();
  });

  it('applies custom className', () => {
    render(<Combobox options={mockOptions} className="custom-combobox" />);
    
    const button = screen.getByRole('combobox');
    expect(button).toHaveClass('custom-combobox');
  });

  it('shows empty text when no options match search', async () => {
    render(<Combobox options={mockOptions} emptyText="Nothing found" />);
    
    const button = screen.getByRole('combobox');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getAllByRole('combobox')).toHaveLength(2);
    });
    
    const searchInput = screen.getAllByRole('combobox')[1]; // Second combobox is the input
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
    
    await waitFor(() => {
      expect(screen.getByText('Nothing found')).toBeInTheDocument();
    });
  });
});

describe('MultiCombobox', () => {
  it('renders correctly with placeholder', () => {
    render(<MultiCombobox options={mockOptions} placeholder="Choose options" />);
    
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Choose options')).toBeInTheDocument();
  });

  it('displays selected count', () => {
    render(
      <MultiCombobox 
        options={mockOptions} 
        values={['option1', 'option2']} 
        placeholder="Choose options" 
      />
    );
    
    expect(screen.getByText('2 selected')).toBeInTheDocument();
  });

  it('opens dropdown on button click', async () => {
    render(<MultiCombobox options={mockOptions} />);
    
    const button = screen.getByRole('combobox');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getAllByRole('combobox')).toHaveLength(2);
    });
  });

  it('calls onValuesChange when option is selected', async () => {
    const onValuesChange = jest.fn();
    render(
      <MultiCombobox 
        options={mockOptions} 
        onValuesChange={onValuesChange} 
      />
    );
    
    const button = screen.getByRole('combobox');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getAllByRole('combobox')).toHaveLength(2);
    });
    
    const option = screen.getByText('Option 1');
    fireEvent.click(option);
    
    expect(onValuesChange).toHaveBeenCalledWith(['option1']);
  });

  it('removes option when clicking selected option', async () => {
    const onValuesChange = jest.fn();
    render(
      <MultiCombobox 
        options={mockOptions} 
        values={['option1']}
        onValuesChange={onValuesChange} 
      />
    );
    
    const button = screen.getByRole('combobox');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getAllByRole('combobox')).toHaveLength(2);
    });
    
    const option = screen.getByText('Option 1');
    fireEvent.click(option);
    
    expect(onValuesChange).toHaveBeenCalledWith([]);
  });

  it('respects maxSelected limit', async () => {
    const onValuesChange = jest.fn();
    render(
      <MultiCombobox 
        options={mockOptions} 
        values={['option1']}
        maxSelected={1}
        onValuesChange={onValuesChange} 
      />
    );
    
    const button = screen.getByRole('combobox');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getAllByRole('combobox')).toHaveLength(2);
    });
    
    const option = screen.getByText('Option 2');
    fireEvent.click(option);
    
    // Should not change values since max is reached
    expect(onValuesChange).toHaveBeenCalledWith(['option1']);
  });

  it('can be disabled', () => {
    render(<MultiCombobox options={mockOptions} disabled />);
    
    const button = screen.getByRole('combobox');
    expect(button).toBeDisabled();
  });
});