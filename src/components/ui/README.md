# shadcn/ui Component Library

This document describes all the UI components available in the shadcn/ui component library, including the responsive grid system and all newly added components.

## Components Overview

### Container
A responsive container component that provides consistent max-widths and padding across breakpoints.

```tsx
import { Container } from "@/components/ui";

<Container size="xl" padding="md">
  Content goes here
</Container>
```

**Props:**
- `size`: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
- `padding`: "none" | "sm" | "md" | "lg" | "xl"
- `center`: boolean (default: true)

### Grid & GridItem
A flexible grid system that adapts to different screen sizes.

```tsx
import { Grid, GridItem } from "@/components/ui";

<Grid 
  cols={{ 
    default: 1, 
    sm: 2, 
    md: 3, 
    lg: 4 
  }} 
  gap="md"
>
  <GridItem colSpan={{ default: 1, md: 2 }}>
    Spans 2 columns on medium screens and up
  </GridItem>
  <GridItem>Regular item</GridItem>
</Grid>
```

**Grid Props:**
- `cols`: Responsive column configuration
- `rows`: Responsive row configuration
- `gap`: "none" | "xs" | "sm" | "md" | "lg" | "xl"

**GridItem Props:**
- `colSpan`: Responsive column span configuration
- `rowSpan`: Responsive row span configuration

### Layout Components

#### Stack
A simple vertical stack layout with consistent spacing.

```tsx
import { Stack } from "@/components/ui";

<Stack gap="lg" align="center">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Stack>
```

#### SidebarLayout
A responsive sidebar layout that stacks on mobile and sits side-by-side on desktop.

```tsx
import { SidebarLayout, SidebarContent, MainContent } from "@/components/ui";

<SidebarLayout gap="lg">
  <SidebarContent width="md">
    Sidebar content
  </SidebarContent>
  <MainContent>
    Main content area
  </MainContent>
</SidebarLayout>
```

#### SplitLayout
A responsive split layout for two-panel interfaces.

```tsx
import { SplitLayout, SplitPanel } from "@/components/ui";

<SplitLayout gap="lg" breakpoint="md">
  <SplitPanel>Panel 1</SplitPanel>
  <SplitPanel>Panel 2</SplitPanel>
</SplitLayout>
```

### Typography
Responsive typography components with adaptive sizing.

```tsx
import { Typography, Heading, Text } from "@/components/ui";

<Heading level={1}>Responsive Heading</Heading>
<Text responsive>This text scales with screen size</Text>
<Typography variant="h2" size="xl" weight="bold" color="primary">
  Custom typography
</Typography>
```

**Typography Props:**
- `variant`: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "body" | "caption" | "overline" | "subtitle1" | "subtitle2"
- `size`: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl"
- `weight`: "thin" | "light" | "normal" | "medium" | "semibold" | "bold" | "extrabold" | "black"
- `align`: "left" | "center" | "right" | "justify"
- `color`: "default" | "muted" | "primary" | "secondary" | "destructive" | "accent"
- `responsive`: boolean (default: true)

### Responsive Utilities

#### Show/Hide Components
Conditionally render content based on screen size.

```tsx
import { Show, Hide, ShowOnMobile, HideOnDesktop } from "@/components/ui";

<ShowOnMobile>
  This only shows on mobile
</ShowOnMobile>

<Show above="lg">
  This shows on large screens and up
</Show>

<Hide below="md">
  This is hidden on small screens
</Hide>
```

#### Breakpoint Hooks
React hooks for responsive behavior in components.

```tsx
import { useBreakpoint, useBreakpoints } from "@/lib/hooks/use-breakpoint";

function MyComponent() {
  const isLarge = useBreakpoint("lg");
  const breakpoints = useBreakpoints();
  
  return (
    <div>
      {breakpoints.isMdAndUp ? "Desktop view" : "Mobile view"}
    </div>
  );
}
```

## Breakpoints

The system uses the following breakpoints:

- `xs`: < 640px (mobile)
- `sm`: ≥ 640px (large mobile)
- `md`: ≥ 768px (tablet)
- `lg`: ≥ 1024px (desktop)
- `xl`: ≥ 1280px (large desktop)
- `2xl`: ≥ 1536px (extra large desktop)

## Best Practices

1. **Mobile-First**: Always design for mobile first, then enhance for larger screens
2. **Consistent Spacing**: Use the predefined gap sizes for consistent spacing
3. **Semantic HTML**: Use appropriate HTML elements (headings, paragraphs, etc.)
4. **Accessibility**: Ensure proper contrast ratios and keyboard navigation
5. **Performance**: Use responsive utilities to avoid rendering unnecessary content

## Form Components

### Form
React Hook Form integration with Zod validation support.

```tsx
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
});

function MyForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: "" },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

### Switch
A toggle switch component for boolean values.

```tsx
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

<div className="flex items-center space-x-2">
  <Switch id="airplane-mode" />
  <Label htmlFor="airplane-mode">Airplane Mode</Label>
</div>
```

### RadioGroup
A group of radio buttons for single selection.

```tsx
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

<RadioGroup defaultValue="option-one">
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option-one" id="option-one" />
    <Label htmlFor="option-one">Option One</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option-two" id="option-two" />
    <Label htmlFor="option-two">Option Two</Label>
  </div>
</RadioGroup>
```

### Slider
A range slider for numeric input.

```tsx
import { Slider } from "@/components/ui/slider";

<Slider
  defaultValue={[50]}
  max={100}
  min={0}
  step={1}
  className="w-[60%]"
/>
```

### Calendar
A date picker calendar component.

```tsx
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";

function DatePicker() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="rounded-md border"
    />
  );
}
```

### DatePicker
A complete date picker with input and calendar.

```tsx
import { DatePicker } from "@/components/ui/date-picker";

<DatePicker />
```

### Combobox
A searchable select component.

```tsx
import { Combobox } from "@/components/ui/combobox";

const frameworks = [
  { value: "next.js", label: "Next.js" },
  { value: "sveltekit", label: "SvelteKit" },
  { value: "nuxt.js", label: "Nuxt.js" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
];

<Combobox
  options={frameworks}
  placeholder="Select framework..."
  emptyText="No framework found."
/>
```

## Layout Components

### Sheet
A slide-out panel component.

```tsx
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline">Open Sheet</Button>
  </SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Are you absolutely sure?</SheetTitle>
      <SheetDescription>
        This action cannot be undone. This will permanently delete your account.
      </SheetDescription>
    </SheetHeader>
  </SheetContent>
</Sheet>
```

### Accordion
A collapsible content component.

```tsx
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

<Accordion type="single" collapsible className="w-full">
  <AccordionItem value="item-1">
    <AccordionTrigger>Is it accessible?</AccordionTrigger>
    <AccordionContent>
      Yes. It adheres to the WAI-ARIA design pattern.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Is it styled?</AccordionTrigger>
    <AccordionContent>
      Yes. It comes with default styles that match the other components.
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

### Collapsible
A simple collapsible content wrapper.

```tsx
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

<Collapsible>
  <CollapsibleTrigger asChild>
    <Button variant="ghost">Can I use this in my project?</Button>
  </CollapsibleTrigger>
  <CollapsibleContent>
    Yes. Free to use for personal and commercial projects.
  </CollapsibleContent>
</Collapsible>
```

### ScrollArea
A custom scrollable area with styled scrollbars.

```tsx
import { ScrollArea } from "@/components/ui/scroll-area";

<ScrollArea className="h-72 w-48 rounded-md border">
  <div className="p-4">
    {Array.from({ length: 50 }).map((_, i) => (
      <div key={i} className="text-sm">
        Item {i + 1}
      </div>
    ))}
  </div>
</ScrollArea>
```

## Data Display Components

### Table
Semantic HTML table components with consistent styling.

```tsx
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

<Table>
  <TableCaption>A list of your recent invoices.</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead className="w-[100px]">Invoice</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Method</TableHead>
      <TableHead className="text-right">Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="font-medium">INV001</TableCell>
      <TableCell>Paid</TableCell>
      <TableCell>Credit Card</TableCell>
      <TableCell className="text-right">$250.00</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### DataTable
A feature-rich data table with sorting, filtering, and pagination.

```tsx
import { DataTable } from "@/components/ui/data-table";

const columns = [
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
];

const data = [
  {
    id: "1",
    status: "pending",
    email: "m@example.com",
    amount: 100,
  },
];

<DataTable columns={columns} data={data} />
```

### Skeleton
Loading placeholder components.

```tsx
import { Skeleton } from "@/components/ui/skeleton";

<div className="flex items-center space-x-4">
  <Skeleton className="h-12 w-12 rounded-full" />
  <div className="space-y-2">
    <Skeleton className="h-4 w-[250px]" />
    <Skeleton className="h-4 w-[200px]" />
  </div>
</div>
```

### Popover
A floating content container.

```tsx
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

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
```

### Tooltip
Contextual information on hover.

```tsx
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="outline">Hover</Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Add to library</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### HoverCard
Rich content on hover.

```tsx
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

<HoverCard>
  <HoverCardTrigger asChild>
    <Button variant="link">@nextjs</Button>
  </HoverCardTrigger>
  <HoverCardContent className="w-80">
    <div className="flex justify-between space-x-4">
      <div className="space-y-1">
        <h4 className="text-sm font-semibold">@nextjs</h4>
        <p className="text-sm">
          The React Framework – created and maintained by @vercel.
        </p>
      </div>
    </div>
  </HoverCardContent>
</HoverCard>
```

## Navigation Components

### Command
A command palette component.

```tsx
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

<Command>
  <CommandInput placeholder="Type a command or search..." />
  <CommandList>
    <CommandEmpty>No results found.</CommandEmpty>
    <CommandGroup heading="Suggestions">
      <CommandItem>Calendar</CommandItem>
      <CommandItem>Search Emoji</CommandItem>
      <CommandItem>Calculator</CommandItem>
    </CommandGroup>
  </CommandList>
</Command>
```

### Breadcrumb
Navigation breadcrumbs.

```tsx
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/components">Components</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

### ContextMenu
Right-click context menu.

```tsx
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";

<ContextMenu>
  <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
    Right click here
  </ContextMenuTrigger>
  <ContextMenuContent className="w-64">
    <ContextMenuItem>Back</ContextMenuItem>
    <ContextMenuItem>Forward</ContextMenuItem>
    <ContextMenuItem>Reload</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
```

### NavigationMenu
Dropdown navigation menu.

```tsx
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";

<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
          <li className="row-span-3">
            <NavigationMenuLink asChild>
              <a className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md" href="/">
                <div className="mb-2 mt-4 text-lg font-medium">
                  shadcn/ui
                </div>
                <p className="text-sm leading-tight text-muted-foreground">
                  Beautifully designed components built with Radix UI and Tailwind CSS.
                </p>
              </a>
            </NavigationMenuLink>
          </li>
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
```

## Utility Components

### Toggle
A toggle button component.

```tsx
import { Toggle } from "@/components/ui/toggle";

<Toggle aria-label="Toggle italic">
  <Bold className="h-4 w-4" />
</Toggle>
```

### ToggleGroup
A group of toggle buttons.

```tsx
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

<ToggleGroup type="multiple">
  <ToggleGroupItem value="bold" aria-label="Toggle bold">
    <Bold className="h-4 w-4" />
  </ToggleGroupItem>
  <ToggleGroupItem value="italic" aria-label="Toggle italic">
    <Italic className="h-4 w-4" />
  </ToggleGroupItem>
  <ToggleGroupItem value="underline" aria-label="Toggle underline">
    <Underline className="h-4 w-4" />
  </ToggleGroupItem>
</ToggleGroup>
```

## Feedback Components

### Alert
Alert messages with different variants.

```tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

<Alert>
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Your session has expired. Please log in again.
  </AlertDescription>
</Alert>
```

### Sonner (Toast)
Modern toast notifications.

```tsx
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// Add to your app root
<Toaster />

// Use in components
<Button
  onClick={() =>
    toast("Event has been created", {
      description: "Sunday, December 03, 2023 at 9:00 AM",
      action: {
        label: "Undo",
        onClick: () => console.log("Undo"),
      },
    })
  }
>
  Show Toast
</Button>
```

## Installation and Setup

### CLI Configuration
The project is configured with shadcn/ui CLI. You can add new components using:

```bash
npx shadcn@latest add [component-name]
```

### TypeScript Support
All components have full TypeScript support with:
- Proper type definitions
- IntelliSense support
- Generic type parameters where applicable
- Ref forwarding

### Theme Configuration
Components use CSS variables for theming. Customize in `src/styles/globals.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  /* ... more variables */
}
```

## Best Practices

1. **Composition**: Use compound components together (e.g., Card + CardHeader + CardContent)
2. **Accessibility**: All components follow WAI-ARIA guidelines
3. **Responsive**: Components work across all screen sizes
4. **Customization**: Use className prop to customize styling
5. **Performance**: Components are tree-shakeable and optimized

## Examples

For comprehensive examples of all components in action, see the test pages in the application.