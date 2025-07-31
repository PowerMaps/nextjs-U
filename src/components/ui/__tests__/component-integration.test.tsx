import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import existing components that are already used in the app
import { Card, CardContent, CardHeader, CardTitle } from '../card';
import { Button } from '../button';
import { Label } from '../label';
import { Input } from '../input';
import { useToast } from '../use-toast';

// Import newly added components
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Switch,
  RadioGroup,
  RadioGroupItem,
  Slider,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Sheet,
  SheetContent,
  SheetTrigger,
  Alert,
  AlertDescription,
  AlertTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Badge,
  Separator,
} from '../index';

// Mock react-hook-form for Form testing
import { useForm } from 'react-hook-form';

// Mock toast hook
jest.mock('../use-toast', () => ({
  useToast: jest.fn(() => ({
    toast: jest.fn(),
  })),
}));

describe('Component Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('New form components integrate with existing Card and Button components', () => {
    const TestForm = () => {
      const form = useForm({
        defaultValues: {
          name: '',
          email: '',
          notifications: false,
          theme: 'light',
          volume: [50],
        },
      });

      return (
        <Card data-testid="form-card">
          <CardHeader>
            <CardTitle>Settings Form</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notifications"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="notifications-switch"
                        />
                      </FormControl>
                      <FormLabel>Enable notifications</FormLabel>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="theme"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Theme</FormLabel>
                      <FormControl>
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          data-testid="theme-radio"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="light" id="light" />
                            <Label htmlFor="light">Light</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="dark" id="dark" />
                            <Label htmlFor="dark">Dark</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="volume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Volume</FormLabel>
                      <FormControl>
                        <Slider
                          value={field.value}
                          onValueChange={field.onChange}
                          max={100}
                          step={1}
                          data-testid="volume-slider"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <Button type="submit" data-testid="submit-button">
                  Save Settings
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      );
    };

    render(<TestForm />);
    
    expect(screen.getByTestId('form-card')).toBeInTheDocument();
    expect(screen.getByTestId('notifications-switch')).toBeInTheDocument();
    expect(screen.getByTestId('theme-radio')).toBeInTheDocument();
    expect(screen.getByTestId('volume-slider')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  test('New layout components work with existing Card components', async () => {
    const TestLayout = () => (
      <div>
        <Card data-testid="main-card">
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible data-testid="accordion">
              <AccordionItem value="item-1">
                <AccordionTrigger data-testid="accordion-trigger-1">Section 1</AccordionTrigger>
                <AccordionContent>
                  <Card data-testid="nested-card">
                    <CardContent>
                      <p>Nested content in accordion</p>
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger data-testid="accordion-trigger-2">Section 2</AccordionTrigger>
                <AccordionContent>
                  <Alert data-testid="alert-in-accordion">
                    <AlertTitle>Information</AlertTitle>
                    <AlertDescription>
                      This alert is inside an accordion item.
                    </AlertDescription>
                  </Alert>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    );

    render(<TestLayout />);
    
    expect(screen.getByTestId('main-card')).toBeInTheDocument();
    expect(screen.getByTestId('accordion')).toBeInTheDocument();
    
    // Open the first accordion item to access nested content
    fireEvent.click(screen.getByTestId('accordion-trigger-1'));
    
    await waitFor(() => {
      expect(screen.getByTestId('nested-card')).toBeInTheDocument();
    });
    
    // Open the second accordion item to access alert
    fireEvent.click(screen.getByTestId('accordion-trigger-2'));
    
    await waitFor(() => {
      expect(screen.getByTestId('alert-in-accordion')).toBeInTheDocument();
    });
  });

  test('New data display components integrate with existing components', () => {
    const TestDataDisplay = () => (
      <Card data-testid="data-card">
        <CardHeader>
          <CardTitle>User Data</CardTitle>
        </CardHeader>
        <CardContent>
          <Table data-testid="data-table">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>John Doe</TableCell>
                <TableCell>
                  <Badge variant="default" data-testid="status-badge">
                    Active
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" data-testid="action-button">
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Jane Smith</TableCell>
                <TableCell>
                  <Badge variant="secondary" data-testid="status-badge-2">
                    Inactive
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          
          <Separator className="my-4" />
          
          <Alert data-testid="info-alert">
            <AlertTitle>Note</AlertTitle>
            <AlertDescription>
              This table shows user data with integrated components.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );

    render(<TestDataDisplay />);
    
    expect(screen.getByTestId('data-card')).toBeInTheDocument();
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
    expect(screen.getByTestId('status-badge')).toBeInTheDocument();
    expect(screen.getByTestId('status-badge-2')).toBeInTheDocument();
    expect(screen.getByTestId('action-button')).toBeInTheDocument();
    expect(screen.getByTestId('info-alert')).toBeInTheDocument();
  });

  test('Sheet component works with existing components', async () => {
    const TestSheet = () => (
      <div>
        <Sheet>
          <SheetTrigger asChild>
            <Button data-testid="sheet-trigger">Open Settings</Button>
          </SheetTrigger>
          <SheetContent data-testid="sheet-content">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Settings Panel</h2>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch data-testid="sheet-switch" />
                      <Label>Enable feature</Label>
                    </div>
                    <Button data-testid="sheet-button">Save</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );

    render(<TestSheet />);
    
    expect(screen.getByTestId('sheet-trigger')).toBeInTheDocument();
    
    // Click to open sheet
    fireEvent.click(screen.getByTestId('sheet-trigger'));
    
    // Wait for sheet content to be available
    await waitFor(() => {
      expect(screen.getByTestId('sheet-content')).toBeInTheDocument();
    });
    
    expect(screen.getByTestId('sheet-switch')).toBeInTheDocument();
    expect(screen.getByTestId('sheet-button')).toBeInTheDocument();
  });

  test('Tooltip integration with existing Button components', () => {
    const TestTooltips = () => (
      <TooltipProvider>
        <Card data-testid="tooltip-card">
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="default" data-testid="tooltip-button-1">
                  Save
                </Button>
              </TooltipTrigger>
              <TooltipContent data-testid="tooltip-content-1">
                <p>Save your changes</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="destructive" data-testid="tooltip-button-2">
                  Delete
                </Button>
              </TooltipTrigger>
              <TooltipContent data-testid="tooltip-content-2">
                <p>Delete this item</p>
              </TooltipContent>
            </Tooltip>
          </CardContent>
        </Card>
      </TooltipProvider>
    );

    render(<TestTooltips />);
    
    expect(screen.getByTestId('tooltip-card')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip-button-1')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip-button-2')).toBeInTheDocument();
  });

  test('No conflicts between existing and new components', () => {
    // Test that importing both old and new components doesn't cause conflicts
    const TestNoConflicts = () => (
      <div>
        {/* Existing components */}
        <Card data-testid="existing-card">
          <CardHeader>
            <CardTitle>Existing Components</CardTitle>
          </CardHeader>
          <CardContent>
            <Button data-testid="existing-button">Existing Button</Button>
            <Input placeholder="Existing input" data-testid="existing-input" />
            <Label data-testid="existing-label">Existing Label</Label>
          </CardContent>
        </Card>
        
        {/* New components */}
        <Card data-testid="new-card">
          <CardHeader>
            <CardTitle>New Components</CardTitle>
          </CardHeader>
          <CardContent>
            <Switch data-testid="new-switch" />
            <Slider defaultValue={[50]} data-testid="new-slider" />
            <Badge data-testid="new-badge">New Badge</Badge>
          </CardContent>
        </Card>
      </div>
    );

    render(<TestNoConflicts />);
    
    // Verify all components render without conflicts
    expect(screen.getByTestId('existing-card')).toBeInTheDocument();
    expect(screen.getByTestId('existing-button')).toBeInTheDocument();
    expect(screen.getByTestId('existing-input')).toBeInTheDocument();
    expect(screen.getByTestId('existing-label')).toBeInTheDocument();
    
    expect(screen.getByTestId('new-card')).toBeInTheDocument();
    expect(screen.getByTestId('new-switch')).toBeInTheDocument();
    expect(screen.getByTestId('new-slider')).toBeInTheDocument();
    expect(screen.getByTestId('new-badge')).toBeInTheDocument();
  });

  test('Components maintain consistent styling and behavior', () => {
    const TestConsistency = () => (
      <div className="space-y-4">
        {/* Test that all button variants work consistently */}
        <div className="space-x-2">
          <Button variant="default" data-testid="btn-default">Default</Button>
          <Button variant="secondary" data-testid="btn-secondary">Secondary</Button>
          <Button variant="outline" data-testid="btn-outline">Outline</Button>
          <Button variant="destructive" data-testid="btn-destructive">Destructive</Button>
        </div>
        
        {/* Test that cards maintain consistent styling */}
        <div className="grid grid-cols-2 gap-4">
          <Card data-testid="card-1">
            <CardContent>Card 1</CardContent>
          </Card>
          <Card data-testid="card-2">
            <CardContent>Card 2</CardContent>
          </Card>
        </div>
        
        {/* Test that form elements are consistent */}
        <div className="space-y-2">
          <Input placeholder="Input field" data-testid="input-field" />
          <Switch data-testid="switch-field" />
          <Slider defaultValue={[25]} data-testid="slider-field" />
        </div>
      </div>
    );

    render(<TestConsistency />);
    
    // Verify all elements render
    expect(screen.getByTestId('btn-default')).toBeInTheDocument();
    expect(screen.getByTestId('btn-secondary')).toBeInTheDocument();
    expect(screen.getByTestId('btn-outline')).toBeInTheDocument();
    expect(screen.getByTestId('btn-destructive')).toBeInTheDocument();
    
    expect(screen.getByTestId('card-1')).toBeInTheDocument();
    expect(screen.getByTestId('card-2')).toBeInTheDocument();
    
    expect(screen.getByTestId('input-field')).toBeInTheDocument();
    expect(screen.getByTestId('switch-field')).toBeInTheDocument();
    expect(screen.getByTestId('slider-field')).toBeInTheDocument();
  });
});