// Layout and Grid Components
export { Container } from "./container";
export type { ContainerProps } from "./container";

export { Grid, GridItem } from "./grid";
export type { GridProps, GridItemProps } from "./grid";

export { 
  ResponsiveLayout, 
  Stack, 
  SidebarLayout, 
  SidebarContent, 
  MainContent, 
  SplitLayout, 
  SplitPanel 
} from "./responsive-layout";
export type { 
  ResponsiveLayoutProps, 
  StackProps, 
  SidebarLayoutProps, 
  SplitLayoutProps 
} from "./responsive-layout";

// Typography Components
export { Typography, Heading, Text, Caption, Subtitle } from "./typography";
export type { TypographyProps } from "./typography";

// Responsive Utilities
export { 
  Show, 
  Hide, 
  ShowOnMobile, 
  ShowOnTablet, 
  ShowOnDesktop, 
  HideOnMobile, 
  HideOnTablet, 
  HideOnDesktop 
} from "./responsive";

// Core UI Components
export { Button } from "./button";
export type { ButtonProps } from "./button";

export { Badge } from "./badge";
export type { BadgeProps } from "./badge";

export { Avatar, AvatarImage, AvatarFallback } from "./avatar";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from "./card";

export { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "./dialog";

export { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup
} from "./dropdown-menu";

export { Input } from "./input";
export type { InputProps } from "./input";

export { Label } from "./label";

export { Textarea } from "./textarea";

export { Checkbox } from "./checkbox";

export { 
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton
} from "./select";

export { Separator } from "./separator";

export { Progress } from "./progress";

export { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";

export { Toast, ToastAction, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "./toast";
export { Toaster } from "./toaster";
export { useToast, toast } from "./use-toast";

// Form Components (newly added)
export {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
  useFormField
} from "./form";

export { Switch } from "./switch";

export { RadioGroup, RadioGroupItem } from "./radio-group";

export { Slider } from "./slider";

export { Calendar } from "./calendar";

export { DatePicker } from "./date-picker";

export { Combobox, MultiCombobox } from "./combobox";
export type { ComboboxOption } from "./combobox";

// Layout Components (newly added)
export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription
} from "./sheet";

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from "./accordion";

export {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent
} from "./collapsible";

export { ScrollArea, ScrollBar } from "./scroll-area";

// Data Display Components (newly added)
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption
} from "./table";

export { DataTable } from "./data-table";

export { Skeleton } from "./skeleton";

export {
  Popover,
  PopoverTrigger,
  PopoverContent
} from "./popover";

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from "./tooltip";

export {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent
} from "./hover-card";

// Navigation Components (newly added)
export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator
} from "./command";

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis
} from "./breadcrumb";

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup
} from "./context-menu";

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle
} from "./navigation-menu";

// Utility Components (newly added)
export { Toggle } from "./toggle";
export type { ToggleProps } from "./toggle";

export { ToggleGroup, ToggleGroupItem } from "./toggle-group";

// Feedback Components (newly added)
export { Alert, AlertDescription, AlertTitle } from "./alert";

export { 
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel
} from "./alert-dialog";

export { Toaster as SonnerToaster } from "./sonner";

// Platform-specific Components
export { OfflineIndicator } from "./offline-indicator";