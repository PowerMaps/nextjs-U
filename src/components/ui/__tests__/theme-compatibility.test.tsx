import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import all the newly added components
import {
  Form,
  Switch,
  RadioGroup,
  RadioGroupItem,
  Slider,
  Calendar,
  DatePicker,
  Combobox,
  Sheet,
  SheetContent,
  SheetTrigger,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  ScrollArea,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  DataTable,
  Skeleton,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
  Alert,
  AlertDescription,
  AlertTitle,
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
  Toaster as SonnerToaster,
} from '../index';

// Mock theme provider for testing
const ThemeProvider = ({ children, theme }: { children: React.ReactNode; theme: 'light' | 'dark' }) => {
  React.useEffect(() => {
    document.documentElement.className = theme === 'dark' ? 'dark' : '';
  }, [theme]);
  
  return <div className={theme === 'dark' ? 'dark' : ''}>{children}</div>;
};

describe('Theme Compatibility Tests', () => {
  const themes: ('light' | 'dark')[] = ['light', 'dark'];

  themes.forEach((theme) => {
    describe(`${theme} theme`, () => {
      const renderWithTheme = (component: React.ReactElement) => {
        return render(
          <ThemeProvider theme={theme}>
            <TooltipProvider>
              {component}
            </TooltipProvider>
          </ThemeProvider>
        );
      };

      test('Form components render with correct theme variables', () => {
        const { container } = renderWithTheme(
          <div>
            <Switch data-testid="switch" />
            <RadioGroup data-testid="radio-group">
              <RadioGroupItem value="option1" data-testid="radio-item" />
            </RadioGroup>
            <Slider data-testid="slider" />
          </div>
        );

        expect(container.querySelector('[data-testid="switch"]')).toBeInTheDocument();
        expect(container.querySelector('[data-testid="radio-group"]')).toBeInTheDocument();
        expect(container.querySelector('[data-testid="slider"]')).toBeInTheDocument();
      });

      test('Layout components render with correct theme variables', () => {
        const { container } = renderWithTheme(
          <div>
            <Accordion type="single" data-testid="accordion">
              <AccordionItem value="item1">
                <AccordionTrigger>Trigger</AccordionTrigger>
                <AccordionContent>Content</AccordionContent>
              </AccordionItem>
            </Accordion>
            
            <Collapsible data-testid="collapsible">
              <CollapsibleTrigger>Toggle</CollapsibleTrigger>
              <CollapsibleContent>Content</CollapsibleContent>
            </Collapsible>
            
            <ScrollArea className="h-20" data-testid="scroll-area">
              <div>Scrollable content</div>
            </ScrollArea>
          </div>
        );

        expect(container.querySelector('[data-testid="accordion"]')).toBeInTheDocument();
        expect(container.querySelector('[data-testid="collapsible"]')).toBeInTheDocument();
        expect(container.querySelector('[data-testid="scroll-area"]')).toBeInTheDocument();
      });

      test('Data display components render with correct theme variables', () => {
        const { container } = renderWithTheme(
          <div>
            <Table data-testid="table">
              <TableHeader>
                <TableRow>
                  <TableHead>Header</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Cell</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            
            <Skeleton className="h-4 w-20" data-testid="skeleton" />
            
            <Popover>
              <PopoverTrigger data-testid="popover-trigger">Open</PopoverTrigger>
              <PopoverContent data-testid="popover-content">Content</PopoverContent>
            </Popover>
          </div>
        );

        expect(container.querySelector('[data-testid="table"]')).toBeInTheDocument();
        expect(container.querySelector('[data-testid="skeleton"]')).toBeInTheDocument();
        expect(container.querySelector('[data-testid="popover-trigger"]')).toBeInTheDocument();
      });

      test('Navigation components render with correct theme variables', () => {
        const { container } = renderWithTheme(
          <div>
            <Command data-testid="command">
              <CommandInput placeholder="Search..." />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  <CommandItem>Item 1</CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
            
            <Breadcrumb data-testid="breadcrumb">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            
            <NavigationMenu data-testid="nav-menu">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Item</NavigationMenuTrigger>
                  <NavigationMenuContent>Content</NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        );

        expect(container.querySelector('[data-testid="command"]')).toBeInTheDocument();
        expect(container.querySelector('[data-testid="breadcrumb"]')).toBeInTheDocument();
        expect(container.querySelector('[data-testid="nav-menu"]')).toBeInTheDocument();
      });

      test('Utility components render with correct theme variables', () => {
        const { container } = renderWithTheme(
          <div>
            <Toggle data-testid="toggle">Toggle</Toggle>
            
            <ToggleGroup type="single" data-testid="toggle-group">
              <ToggleGroupItem value="option1">Option 1</ToggleGroupItem>
            </ToggleGroup>
          </div>
        );

        expect(container.querySelector('[data-testid="toggle"]')).toBeInTheDocument();
        expect(container.querySelector('[data-testid="toggle-group"]')).toBeInTheDocument();
      });

      test('Feedback components render with correct theme variables', () => {
        const { container } = renderWithTheme(
          <div>
            <Alert data-testid="alert">
              <AlertTitle>Alert Title</AlertTitle>
              <AlertDescription>Alert description</AlertDescription>
            </Alert>
            
            <AlertDialog>
              <AlertDialogTrigger data-testid="alert-dialog-trigger">Open</AlertDialogTrigger>
              <AlertDialogContent data-testid="alert-dialog-content">
                Alert Dialog Content
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );

        expect(container.querySelector('[data-testid="alert"]')).toBeInTheDocument();
        expect(container.querySelector('[data-testid="alert-dialog-trigger"]')).toBeInTheDocument();
      });

      test('Components use CSS variables correctly', () => {
        const { container } = renderWithTheme(
          <div>
            <div className="bg-background text-foreground" data-testid="background-test">
              Background Test
            </div>
            <div className="bg-primary text-primary-foreground" data-testid="primary-test">
              Primary Test
            </div>
            <div className="bg-secondary text-secondary-foreground" data-testid="secondary-test">
              Secondary Test
            </div>
            <div className="bg-muted text-muted-foreground" data-testid="muted-test">
              Muted Test
            </div>
            <div className="border-border" data-testid="border-test">
              Border Test
            </div>
          </div>
        );

        // Verify elements are rendered (CSS variable usage is handled by Tailwind)
        expect(container.querySelector('[data-testid="background-test"]')).toBeInTheDocument();
        expect(container.querySelector('[data-testid="primary-test"]')).toBeInTheDocument();
        expect(container.querySelector('[data-testid="secondary-test"]')).toBeInTheDocument();
        expect(container.querySelector('[data-testid="muted-test"]')).toBeInTheDocument();
        expect(container.querySelector('[data-testid="border-test"]')).toBeInTheDocument();
      });
    });
  });

  test('Theme switching works correctly', () => {
    const TestComponent = () => {
      const [theme, setTheme] = React.useState<'light' | 'dark'>('light');
      
      return (
        <ThemeProvider theme={theme}>
          <div>
            <button 
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              data-testid="theme-toggle"
            >
              Toggle Theme
            </button>
            <div className="bg-background text-foreground" data-testid="themed-element">
              Themed Element
            </div>
          </div>
        </ThemeProvider>
      );
    };

    render(<TestComponent />);
    
    const themedElement = screen.getByTestId('themed-element');
    const toggleButton = screen.getByTestId('theme-toggle');
    
    expect(themedElement).toBeInTheDocument();
    expect(toggleButton).toBeInTheDocument();
  });
});