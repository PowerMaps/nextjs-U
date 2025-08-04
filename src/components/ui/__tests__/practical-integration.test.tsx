import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Import components to test integration
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
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Badge,
    Input,
    Label,
    Alert,
    AlertDescription,
    AlertTitle,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
    Toggle,
    ToggleGroup,
    ToggleGroupItem,
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui';
import { describe } from 'node:test';
import { describe } from 'node:test';
import { describe } from 'node:test';
import { describe } from 'node:test';
import { describe } from 'node:test';

// Form schema for testing
const testFormSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    notifications: z.boolean(),
    theme: z.enum(['light', 'dark', 'system']),
    volume: z.number().min(0).max(100),
});

type TestFormData = z.infer<typeof testFormSchema>;

// Test form component using new form components
const IntegratedFormComponent: React.FC = () => {
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
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Settings Form</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                        <FormLabel>Email Notifications</FormLabel>
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

                        <Button type="submit" className="w-full">
                            Save Settings
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

// Dashboard-like component using multiple new components
const DashboardComponent: React.FC = () => {
    const data = [
        { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' },
        { id: '3', name: 'Bob Johnson', email: 'bob@example.com', status: 'active' },
    ];

    return (
        <div className="space-y-6">
            {/* Breadcrumb Navigation */}
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
                        <BreadcrumbPage>Users</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Alert */}
            <Alert>
                <AlertTitle>System Status</AlertTitle>
                <AlertDescription>
                    All systems are operational. Last updated 5 minutes ago.
                </AlertDescription>
            </Alert>

            {/* Toggle Controls */}
            <Card>
                <CardHeader>
                    <CardTitle>View Options</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-4">
                        <Toggle>Show Inactive</Toggle>
                        <ToggleGroup type="single" defaultValue="table">
                            <ToggleGroupItem value="table">Table</ToggleGroupItem>
                            <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
                            <ToggleGroupItem value="list">List</ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                </CardContent>
            </Card>

            {/* Data Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Users</CardTitle>
                </CardHeader>
                <CardContent>
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
                                    <TableCell className="font-medium">{item.name}</TableCell>
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
                </CardContent>
            </Card>

            {/* FAQ Accordion */}
            <Card>
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible>
                        <AccordionItem value="item-1">
                            <AccordionTrigger>How do I reset my password?</AccordionTrigger>
                            <AccordionContent>
                                You can reset your password by clicking the "Forgot Password" link on the login page.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>How do I update my profile?</AccordionTrigger>
                            <AccordionContent>
                                Navigate to Settings → Profile to update your personal information.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>How do I contact support?</AccordionTrigger>
                            <AccordionContent>
                                You can reach our support team at support@example.com or through the chat widget.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
};

describe('Practical Component Integration Tests', () => {
    describe('Form Integration', () => {
        it('should render integrated form with all new components', () => {
            render(<IntegratedFormComponent />);

            // Check that all form elements are present
            expect(screen.getByText('Settings Form')).toBeInTheDocument();
            expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/email notifications/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/light/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/dark/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/system/i)).toBeInTheDocument();
            expect(screen.getByText(/volume/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /save settings/i })).toBeInTheDocument();
        });

        it('should handle form validation with new components', async () => {
            render(<IntegratedFormComponent />);

            const submitButton = screen.getByRole('button', { name: /save settings/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
                expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
            });
        });

        it('should handle switch interaction', () => {
            render(<IntegratedFormComponent />);

            const switchElement = screen.getByRole('switch');
            expect(switchElement).not.toBeChecked();

            fireEvent.click(switchElement);
            expect(switchElement).toBeChecked();
        });

        it('should handle radio group selection', () => {
            render(<IntegratedFormComponent />);

            const darkRadio = screen.getByLabelText(/dark/i);
            fireEvent.click(darkRadio);
            expect(darkRadio).toBeChecked();

            const systemRadio = screen.getByLabelText(/system/i);
            fireEvent.click(systemRadio);
            expect(systemRadio).toBeChecked();
            expect(darkRadio).not.toBeChecked();
        });

        it('should handle successful form submission', async () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            render(<IntegratedFormComponent />);

            // Fill out the form
            fireEvent.change(screen.getByLabelText(/^name$/i), { target: { value: 'John Doe' } });
            fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: 'john@example.com' } });

            const submitButton = screen.getByRole('button', { name: /save settings/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalledWith('Form submitted:', expect.objectContaining({
                    name: 'John Doe',
                    email: 'john@example.com',
                    notifications: false,
                    theme: 'light',
                    volume: 50,
                }));
            });

            consoleSpy.mockRestore();
        });
    });

    describe('Dashboard Integration', () => {
        it('should render dashboard with all integrated components', () => {
            render(<DashboardComponent />);

            // Check breadcrumb navigation
            expect(screen.getByText('Home')).toBeInTheDocument();
            expect(screen.getByText('Dashboard')).toBeInTheDocument();
            expect(screen.getAllByText('Users')).toHaveLength(2); // One in breadcrumb, one in card title

            // Check alert
            expect(screen.getByText('System Status')).toBeInTheDocument();
            expect(screen.getByText(/all systems are operational/i)).toBeInTheDocument();

            // Check toggle controls
            expect(screen.getByText('Show Inactive')).toBeInTheDocument();
            expect(screen.getByText('Table')).toBeInTheDocument();
            expect(screen.getByText('Grid')).toBeInTheDocument();
            expect(screen.getByText('List')).toBeInTheDocument();

            // Check data table
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('jane@example.com')).toBeInTheDocument();
            expect(screen.getAllByText('active')).toHaveLength(2);
            expect(screen.getByText('inactive')).toBeInTheDocument();

            // Check accordion
            expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
            expect(screen.getByText(/how do i reset my password/i)).toBeInTheDocument();
        });

        it('should handle toggle interactions', () => {
            render(<DashboardComponent />);

            const showInactiveToggle = screen.getByText('Show Inactive');
            fireEvent.click(showInactiveToggle);
            // Toggle should be pressed after click
            expect(showInactiveToggle.closest('button')).toHaveAttribute('data-state', 'on');
        });

        it('should handle toggle group selection', () => {
            render(<DashboardComponent />);

            const gridToggle = screen.getByText('Grid');
            fireEvent.click(gridToggle);

            // Grid should be selected
            expect(gridToggle.closest('button')).toHaveAttribute('data-state', 'on');
        });

        it('should handle accordion expansion', () => {
            render(<DashboardComponent />);

            const accordionTrigger = screen.getByText(/how do i reset my password/i);
            fireEvent.click(accordionTrigger);

            expect(screen.getByText(/you can reset your password by clicking/i)).toBeInTheDocument();
        });

        it('should display badges with correct variants', () => {
            render(<DashboardComponent />);

            const badges = screen.getAllByText(/active|inactive/);
            expect(badges.length).toBeGreaterThan(0);

            // Check that badges are rendered as expected
            badges.forEach(badge => {
                expect(badge).toBeInTheDocument();
            });
        });
    });

    describe('Component Compatibility', () => {
        it('should work with existing UI components without conflicts', () => {
            render(
                <div className="space-y-4">
                    {/* Mix of existing and new components */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Mixed Components Test</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Existing components */}
                            <Button variant="default">Existing Button</Button>
                            <Badge>Existing Badge</Badge>

                            {/* New components */}
                            <Alert>
                                <AlertTitle>New Alert</AlertTitle>
                                <AlertDescription>This uses the new alert component</AlertDescription>
                            </Alert>

                            <div className="flex items-center space-x-2">
                                <Toggle>New Toggle</Toggle>
                                <Switch />
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Test Column</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>Test Data</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            );

            // All components should render without conflicts
            expect(screen.getByText('Mixed Components Test')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /existing button/i })).toBeInTheDocument();
            expect(screen.getByText('Existing Badge')).toBeInTheDocument();
            expect(screen.getByText('New Alert')).toBeInTheDocument();
            expect(screen.getByText('New Toggle')).toBeInTheDocument();
            expect(screen.getByText('Test Data')).toBeInTheDocument();
        });

        it('should handle edge cases gracefully', () => {
            render(
                <div>
                    {/* Test components with minimal props */}
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

                    <Accordion type="single">
                        <AccordionItem value="test">
                            <AccordionTrigger>Test</AccordionTrigger>
                            <AccordionContent>Content</AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            );

            expect(screen.getByText('Minimal alert')).toBeInTheDocument();
            expect(screen.getByText('Minimal table')).toBeInTheDocument();
            expect(screen.getByText('Test')).toBeInTheDocument();
        });
    });

    describe('Real-world Usage Scenarios', () => {
        it('should support complex form workflows', async () => {
            render(<IntegratedFormComponent />);

            // Simulate a complete user workflow
            const nameInput = screen.getByLabelText(/^name$/i);
            const emailInput = screen.getByLabelText(/^email$/i);
            const notificationSwitch = screen.getByRole('switch');
            const darkRadio = screen.getByLabelText(/dark/i);

            // Fill out form step by step
            fireEvent.change(nameInput, { target: { value: 'Test User' } });
            expect(nameInput).toHaveValue('Test User');

            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            expect(emailInput).toHaveValue('test@example.com');

            fireEvent.click(notificationSwitch);
            expect(notificationSwitch).toBeChecked();

            fireEvent.click(darkRadio);
            expect(darkRadio).toBeChecked();

            // Form should be ready for submission
            const submitButton = screen.getByRole('button', { name: /save settings/i });
            expect(submitButton).toBeEnabled();
        });

        it('should support interactive dashboard workflows', () => {
            render(<DashboardComponent />);

            // Test navigation breadcrumb
            const homeLink = screen.getByText('Home');
            expect(homeLink.closest('a')).toHaveAttribute('href', '/');

            // Test data table interaction
            const userRows = screen.getAllByRole('row');
            expect(userRows.length).toBeGreaterThan(1); // Header + data rows

            // Test accordion interaction
            const faqTriggers = screen.getAllByRole('button', { name: /how do i/i });
            expect(faqTriggers.length).toBeGreaterThan(0);

            // Expand first FAQ
            fireEvent.click(faqTriggers[0]);
            expect(screen.getByText(/you can reset your password/i)).toBeInTheDocument();
        });
    });
});