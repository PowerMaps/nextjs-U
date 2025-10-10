// Test TypeScript support for shadcn/ui components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form } from "@/components/ui/form";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Calendar } from "@/components/ui/calendar";
import { DatePicker } from "@/components/ui/date-picker";
import { Combobox } from "@/components/ui/combobox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Toaster } from "@/components/ui/sonner";

// Test that all imports are properly typed
const testTypes = () => {
  // These should all have proper TypeScript types
  const button: typeof Button = Button;
  const card: typeof Card = Card;
  const input: typeof Input = Input;
  const label: typeof Label = Label;
  const switchComponent: typeof Switch = Switch;
  const slider: typeof Slider = Slider;
  const radioGroup: typeof RadioGroup = RadioGroup;
  const form: typeof Form = Form;
  const sheet: typeof Sheet = Sheet;
  const accordion: typeof Accordion = Accordion;
  const table: typeof Table = Table;
  const dataTable: typeof DataTable = DataTable;
  const skeleton: typeof Skeleton = Skeleton;
  const popover: typeof Popover = Popover;
  const tooltip: typeof Tooltip = Tooltip;
  const command: typeof Command = Command;
  const breadcrumb: typeof Breadcrumb = Breadcrumb;
  const contextMenu: typeof ContextMenu = ContextMenu;
  const navigationMenu: typeof NavigationMenu = NavigationMenu;
  const toggle: typeof Toggle = Toggle;
  const toggleGroup: typeof ToggleGroup = ToggleGroup;
  const calendar: typeof Calendar = Calendar;
  const datePicker: typeof DatePicker = DatePicker;
  const combobox: typeof Combobox = Combobox;
  const alert: typeof Alert = Alert;
  const toaster: typeof Toaster = Toaster;

  return {
    button, card, input, label, switchComponent, slider, radioGroup, form,
    sheet, accordion, table, dataTable, skeleton, popover, tooltip, command,
    breadcrumb, contextMenu, navigationMenu, toggle, toggleGroup, calendar,
    datePicker, combobox, alert, toaster
  };
};

export default testTypes;