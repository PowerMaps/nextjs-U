import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { DatePicker } from '@/components/ui/date-picker';
import { Combobox } from '@/components/ui/combobox';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DataTable } from '@/components/ui/data-table';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Toaster } from '@/components/ui/sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { CalendarIcon, AlertCircle, Settings, Users, FileText } from 'lucide-react';

// Form validation schema
const profileFormSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  bio: z.string().max(160, 'Bio must not exceed 160 characters').optional(),
  notifications: z.boolean().default(false),
  theme: z.enum(['light', 'dark', 'system']),
  volume: z.array(z.number()).length(1),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Sample data for DataTable
const sampleData = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Inactive' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'Moderator', status: 'Active' },
];

const columns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
  { accessorKey: 'status', header: 'Status' },
];

// Combobox options
const frameworks = [
  { value: 'next.js', label: 'Next.js' },
  { value: 'sveltekit', label: 'SvelteKit' },
  { value: 'nuxt.js', label: 'Nuxt.js' },
  { value: 'remix', label: 'Remix' },
  { value: 'astro', label: 'Astro' },
];

/**
 * Complex Form Example
 * Demonstrates Form component with various input types and validation
 */
export function ComplexFormExample() {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: '',
      email: '',
      bio: '',
      notifications: false,
      theme: 'system',
      volume: [50],
    },
  });

  function onSubmit(data: ProfileFormValues) {
    toast.success('Profile updated successfully!', {
      description: `Welcome, ${data.username}!`,
    });
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>
          Update your profile information and preferences.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your username" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your public display name.
                  </FormDescription>
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
                    <FormDescription>
                      Receive emails about your account activity.
                    </FormDescription>
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
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="light" />
                        </FormControl>
                        <FormLabel className="font-normal">Light</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="dark" />
                        </FormControl>
                        <FormLabel className="font-normal">Dark</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="system" />
                        </FormControl>
                        <FormLabel className="font-normal">System</FormLabel>
                      </FormItem>
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
                  <FormLabel>Volume: {field.value?.[0]}%</FormLabel>
                  <FormControl>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={field.value}
                      onValueChange={field.onChange}
                      className="w-full"
                    />
                  </FormControl>
                  <FormDescription>
                    Adjust the notification volume.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Update Profile
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

/**
 * Data Management Example
 * Demonstrates DataTable with complex data and interactions
 */
export function DataManagementExample() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Manage users with sorting, filtering, and actions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={sampleData} />
      </CardContent>
    </Card>
  );
}

/**
 * Navigation and Layout Example
 * Demonstrates Sheet, Accordion, and Command components
 */
export function NavigationLayoutExample() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="space-y-6">
      {/* Sheet Example */}
      <Card>
        <CardHeader>
          <CardTitle>Settings Panel</CardTitle>
          <CardDescription>
            Use Sheet for slide-out panels and settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Open Settings
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Application Settings</SheetTitle>
                <SheetDescription>
                  Configure your application preferences here.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input id="name" value="Pedro Duarte" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right">
                    Username
                  </Label>
                  <Input id="username" value="@peduarte" className="col-span-3" />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </CardContent>
      </Card>

      {/* Accordion Example */}
      <Card>
        <CardHeader>
          <CardTitle>FAQ Section</CardTitle>
          <CardDescription>
            Collapsible content sections using Accordion.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Is it accessible?</AccordionTrigger>
              <AccordionContent>
                Yes. It adheres to the WAI-ARIA design pattern and supports keyboard navigation.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Is it styled?</AccordionTrigger>
              <AccordionContent>
                Yes. It comes with default styles that match the other components and can be customized.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Is it animated?</AccordionTrigger>
              <AccordionContent>
                Yes. It includes smooth animations for opening and closing content sections.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Command Palette Example */}
      <Card>
        <CardHeader>
          <CardTitle>Command Palette</CardTitle>
          <CardDescription>
            Quick actions and search functionality.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Command className="rounded-lg border shadow-md">
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Suggestions">
                <CommandItem>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  <span>Calendar</span>
                </CommandItem>
                <CommandItem>
                  <Users className="mr-2 h-4 w-4" />
                  <span>Search Users</span>
                </CommandItem>
                <CommandItem>
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Search Documents</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Interactive Components Example
 * Demonstrates Popover, Tooltip, Calendar, and Combobox
 */
export function InteractiveComponentsExample() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedFramework, setSelectedFramework] = useState<string>('');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Date and Selection</CardTitle>
          <CardDescription>
            Interactive components for user input and selection.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Calendar */}
          <div>
            <Label className="text-sm font-medium">Select Date</Label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </div>

          {/* Date Picker */}
          <div>
            <Label className="text-sm font-medium">Date Picker</Label>
            <DatePicker />
          </div>

          {/* Combobox */}
          <div>
            <Label className="text-sm font-medium">Framework Selection</Label>
            <Combobox
              options={frameworks}
              value={selectedFramework}
              onValueChange={setSelectedFramework}
              placeholder="Select framework..."
              emptyText="No framework found."
            />
          </div>
        </CardContent>
      </Card>

      {/* Popover and Tooltip Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Contextual Information</CardTitle>
          <CardDescription>
            Popover and Tooltip components for additional context.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">Open Popover</Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Dimensions</h4>
                    <p className="text-sm text-muted-foreground">
                      Set the dimensions for the layer.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="width">Width</Label>
                      <Input id="width" defaultValue="100%" className="col-span-2 h-8" />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="height">Height</Label>
                      <Input id="height" defaultValue="25px" className="col-span-2 h-8" />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Hover for Tooltip</Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This is a helpful tooltip</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Feedback and Alerts Example
 * Demonstrates Alert and Toast components
 */
export function FeedbackExample() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Alerts and Notifications</CardTitle>
          <CardDescription>
            Different types of feedback components.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Alert Examples */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>
              You can add components to your app using the cli.
            </AlertDescription>
          </Alert>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Your session has expired. Please log in again.
            </AlertDescription>
          </Alert>

          {/* Toast Examples */}
          <div className="flex space-x-2">
            <Button
              onClick={() => toast.success('Success!', {
                description: 'Your action was completed successfully.',
              })}
            >
              Success Toast
            </Button>
            <Button
              variant="destructive"
              onClick={() => toast.error('Error!', {
                description: 'Something went wrong. Please try again.',
              })}
            >
              Error Toast
            </Button>
            <Button
              variant="outline"
              onClick={() => toast('Info', {
                description: 'This is an informational message.',
                action: {
                  label: 'Undo',
                  onClick: () => console.log('Undo clicked'),
                },
              })}
            >
              Info Toast with Action
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Toast container */}
      <Toaster />
    </div>
  );
}

/**
 * Complete Example Component
 * Combines multiple components in a realistic application scenario
 */
export default function ComplexComponentsExample() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">shadcn/ui Component Examples</h1>
        <p className="text-muted-foreground">
          Comprehensive examples of complex component usage and patterns.
        </p>
      </div>

      <div className="grid gap-8">
        <ComplexFormExample />
        <DataManagementExample />
        <NavigationLayoutExample />
        <InteractiveComponentsExample />
        <FeedbackExample />
      </div>
    </div>
  );
}