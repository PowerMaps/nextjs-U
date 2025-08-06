import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Import all the new components to test integration
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  DataTable,
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  Alert,
  AlertDescription,
  AlertTitle,
  Calendar,
  DatePicker,
  Combobox,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Input,
  Label
} from '@/components/ui';

// Test wrapper component that provides necessary context
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

// Form schema for testing form integration
const testFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  notifications: z.boolean(),
  theme: z.enum(['light', 'dark', 'system']),
  volume: z.number().min(0).max(100),
});

type TestFormData = z.infer<typeof testFormSchema>;

// Test form component using new form components
const TestFormComponent: React.FC = () => {
  const form = useForm<TestFormData>({
    resolver: zodResolver(testFormSchema),
    defaultValues: {
      name: '',
      email: '',
      notifications: false,
      theme: 'light',
      volume: 50,
    },
  });

  const onSubmit = (data: TestFormData) => {
    console.log('Form submitted:', data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notifications"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Email Notifications</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="theme"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Theme Preference</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light">Light</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="dark" />
                    <Label htmlFor="dark">Dark</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system" id="system" />
                    <Label htmlFor="system">System</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="volume"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Volume: {field.value}</FormLabel>
              <FormControl>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[field.value]}
                  onValueChange={(value) => field.onChange(value[0])}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

// Test data table component
const TestDataTableComponent: React.FC = () => {
  const data = [
    { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', status: 'active' },
  ];

  const columns = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'status', header: 'Status' },
  ];

  return (
    <div className="space-y-4">
      <DataTable columns={columns} data={data} />
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.email}</TableCell>
              <TableCell>
                <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                  {item.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

// Test layout components
const TestLayoutComponent: React.FC = () => {
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  return (
    <div className="space-y-6">
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="outline">Open Sheet</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <p>This is sheet content</p>
          </div>
        </SheetContent>
      </Sheet>

      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Accordion Item 1</AccordionTrigger>
          <AccordionContent>
            This is the content for accordion item 1.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Accordion Item 2</AccordionTrigger>
          <AccordionContent>
            This is the content for accordion item 2.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

// Test navigation components
const TestNavigationComponent: React.FC = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Settings</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <Button onClick={() => setOpen(true)}>Open Command</Button>
        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem>Calendar</CommandItem>
              <CommandItem>Search Emoji</CommandItem>
              <CommandItem>Calculator</CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </div>
    </div>
  );
};

describe('Component Integration Tests', () => {
  describe('Form Components Integration', () => {
    it('should render form with all new form components', () => {
      render(
        <TestWrapper>
          <TestFormComponent />
        </TestWrapper>
      );

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email notifications/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/light/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/volume/i)).toBeInTheDocument();
    });

    it('should handle form validation correctly', async () => {
      render(
        <TestWrapper>
          <TestFormComponent />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
        expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      });
    });

    it('should handle switch toggle', () => {
      render(
        <TestWrapper>
          <TestFormComponent />
        </TestWrapper>
      );

      const switchElement = screen.getByRole('switch');
      expect(switchElement).not.toBeChecked();
      
      fireEvent.click(switchElement);
      expect(switchElement).toBeChecked();
    });

    it('should handle radio group selection', () => {
      render(
        <TestWrapper>
          <TestFormComponent />
        </TestWrapper>
      );

      const darkRadio = screen.getByLabelText(/dark/i);
      fireEvent.click(darkRadio);
      expect(darkRadio).toBeChecked();
    });
  });

  describe('Data Display Components Integration', () => {
    it('should render data table with existing UI components', () => {
      render(
        <TestWrapper>
          <TestDataTableComponent />
        </TestWrapper>
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
      expect(screen.getAllByText('active')).toHaveLength(2);
    });

    it('should render table with badges correctly', () => {
      render(
        <TestWrapper>
          <TestDataTableComponent />
        </TestWrapper>
      );

      const badges = screen.getAllByText(/active|inactive/);
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  describe('Layout Components Integration', () => {
    it('should render sheet component', () => {
      render(
        <TestWrapper>
          <TestLayoutComponent />
        </TestWrapper>
      );

      const openButton = screen.getByRole('button', { name: /open sheet/i });
      expect(openButton).toBeInTheDocument();
    });

    it('should render accordion component', () => {
      render(
        <TestWrapper>
          <TestLayoutComponent />
        </TestWrapper>
      );

      expect(screen.getByText('Accordion Item 1')).toBeInTheDocument();
      expect(screen.getByText('Accordion Item 2')).toBeInTheDocument();
    });

    it('should handle accordion expansion', () => {
      render(
        <TestWrapper>
          <TestLayoutComponent />
        </TestWrapper>
      );

      const accordionTrigger = screen.getByText('Accordion Item 1');
      fireEvent.click(accordionTrigger);

      expect(screen.getByText('This is the content for accordion item 1.')).toBeInTheDocument();
    });
  });

  describe('Navigation Components Integration', () => {
    it('should render breadcrumb navigation', () => {
      render(
        <TestWrapper>
          <TestNavigationComponent />
        </TestWrapper>
      );

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('should render command dialog trigger', () => {
      render(
        <TestWrapper>
          <TestNavigationComponent />
        </TestWrapper>
      );

      const commandButton = screen.getByRole('button', { name: /open command/i });
      expect(commandButton).toBeInTheDocument();
    });
  });

  describe('Theme Integration', () => {
    it('should work with theme provider', () => {
      render(
        <TestWrapper>
          <div>
            <Button>Test Button</Button>
            <Card>
              <CardHeader>
                <CardTitle>Test Card</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertTitle>Test Alert</AlertTitle>
                  <AlertDescription>This is a test alert</AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TestWrapper>
      );

      expect(screen.getByRole('button', { name: /test button/i })).toBeInTheDocument();
      expect(screen.getByText('Test Card')).toBeInTheDocument();
      expect(screen.getByText('Test Alert')).toBeInTheDocument();
    });
  });

  describe('Utility Components Integration', () => {
    it('should render toggle components', () => {
      render(
        <TestWrapper>
          <div className="space-y-4">
            <Toggle>Single Toggle</Toggle>
            <ToggleGroup type="single">
              <ToggleGroupItem value="a">A</ToggleGroupItem>
              <ToggleGroupItem value="b">B</ToggleGroupItem>
              <ToggleGroupItem value="c">C</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </TestWrapper>
      );

      expect(screen.getByText('Single Toggle')).toBeInTheDocument();
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('B')).toBeInTheDocument();
      expect(screen.getByText('C')).toBeInTheDocument();
    });

    it('should render tooltip with provider', () => {
      render(
        <TestWrapper>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Hover me</Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>This is a tooltip</p>
            </TooltipContent>
          </Tooltip>
        </TestWrapper>
      );

      expect(screen.getByRole('button', { name: /hover me/i })).toBeInTheDocument();
    });

    it('should render popover component', () => {
      render(
        <TestWrapper>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Open popover</Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Dimensions</h4>
                  <p className="text-sm text-muted-foreground">
                    Set the dimensions for the layer.
                  </p>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </TestWrapper>
      );

      expect(screen.getByRole('button', { name: /open popover/i })).toBeInTheDocument();
    });
  });

  describe('Existing Component Compatibility', () => {
    it('should not conflict with existing components', () => {
      render(
        <TestWrapper>
          <div className="space-y-4">
            {/* Existing components */}
            <Button variant="default">Existing Button</Button>
            <Card>
              <CardHeader>
                <CardTitle>Existing Card</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge>Existing Badge</Badge>
              </CardContent>
            </Card>
            
            {/* New components */}
            <Switch />
            <Alert>
              <AlertTitle>New Alert</AlertTitle>
              <AlertDescription>This uses new alert component</AlertDescription>
            </Alert>
            <Toggle>New Toggle</Toggle>
          </div>
        </TestWrapper>
      );

      // All components should render without conflicts
      expect(screen.getByRole('button', { name: /existing button/i })).toBeInTheDocument();
      expect(screen.getByText('Existing Card')).toBeInTheDocument();
      expect(screen.getByText('Existing Badge')).toBeInTheDocument();
      expect(screen.getByText('New Alert')).toBeInTheDocument();
      expect(screen.getByText('New Toggle')).toBeInTheDocument();
    });
  });

  describe('Error Boundaries and Edge Cases', () => {
    it('should handle missing required props gracefully', () => {
      // Test that components don't crash with minimal props
      render(
        <TestWrapper>
          <div>
            <Alert>
              <AlertDescription>Minimal alert</AlertDescription>
            </Alert>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>Minimal table</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </TestWrapper>
      );

      expect(screen.getByText('Minimal alert')).toBeInTheDocument();
      expect(screen.getByText('Minimal table')).toBeInTheDocument();
    });
  });
});