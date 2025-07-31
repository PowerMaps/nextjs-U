import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { RadioGroup, RadioGroupItem } from '../radio-group';
import { Label } from '../label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../form';

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Test component with form integration
function TestRadioForm() {
  const form = useForm({
    defaultValues: {
      type: "",
    },
  });

  return (
    <Form {...form}>
      <form>
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Select a type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all">All</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mentions" id="mentions" />
                    <Label htmlFor="mentions">Mentions</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="none" />
                    <Label htmlFor="none">None</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

// Simple test component
function SimpleRadioGroup() {
  const [value, setValue] = React.useState("");

  return (
    <RadioGroup value={value} onValueChange={setValue}>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option1" id="option1" />
        <Label htmlFor="option1">Option 1</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option2" id="option2" />
        <Label htmlFor="option2">Option 2</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option3" id="option3" />
        <Label htmlFor="option3">Option 3</Label>
      </div>
    </RadioGroup>
  );
}

describe('RadioGroup Component', () => {
  it('renders radio group with items correctly', () => {
    render(<SimpleRadioGroup />);
    
    expect(screen.getByLabelText('Option 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Option 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Option 3')).toBeInTheDocument();
  });

  it('allows selecting radio button options', () => {
    render(<SimpleRadioGroup />);
    
    const option1 = screen.getByLabelText('Option 1');
    const option2 = screen.getByLabelText('Option 2');
    
    // Initially no option should be selected
    expect(option1).not.toBeChecked();
    expect(option2).not.toBeChecked();
    
    // Select option 1
    fireEvent.click(option1);
    expect(option1).toBeChecked();
    expect(option2).not.toBeChecked();
    
    // Select option 2 (should deselect option 1)
    fireEvent.click(option2);
    expect(option1).not.toBeChecked();
    expect(option2).toBeChecked();
  });

  it('works with form integration', () => {
    render(<TestRadioForm />);
    
    const allOption = screen.getByLabelText('All');
    const mentionsOption = screen.getByLabelText('Mentions');
    const noneOption = screen.getByLabelText('None');
    
    expect(allOption).toBeInTheDocument();
    expect(mentionsOption).toBeInTheDocument();
    expect(noneOption).toBeInTheDocument();
    
    // Test selection
    fireEvent.click(mentionsOption);
    expect(mentionsOption).toBeChecked();
    expect(allOption).not.toBeChecked();
    expect(noneOption).not.toBeChecked();
  });

  it('has proper styling classes', () => {
    render(<SimpleRadioGroup />);
    
    const radioGroup = screen.getByRole('radiogroup');
    expect(radioGroup).toHaveClass('grid', 'gap-2');
    
    const radioItem = screen.getByLabelText('Option 1');
    expect(radioItem).toHaveClass('aspect-square', 'h-4', 'w-4', 'rounded-full');
  });

  it('supports disabled state', () => {
    render(
      <RadioGroup>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="disabled" id="disabled" disabled />
          <Label htmlFor="disabled">Disabled Option</Label>
        </div>
      </RadioGroup>
    );
    
    const disabledOption = screen.getByLabelText('Disabled Option');
    expect(disabledOption).toBeDisabled();
  });
});