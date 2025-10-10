"use client";

import React from 'react';
import { useTheme } from 'next-themes';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Switch,
  RadioGroup,
  RadioGroupItem,
  Label,
  Slider,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
  Skeleton,
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
} from '@/components/ui';

export default function ThemeTestPage() {
  const { theme, setTheme } = useTheme();
  const [sliderValue, setSliderValue] = React.useState([50]);
  const [switchValue, setSwitchValue] = React.useState(false);
  const [radioValue, setRadioValue] = React.useState('option1');
  const [toggleValue, setToggleValue] = React.useState(false);

  return (
    <TooltipProvider>
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Theme Compatibility Test</h1>
          <div className="flex items-center space-x-2">
            <Label htmlFor="theme-toggle">Dark Mode</Label>
            <Switch
              id="theme-toggle"
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Form Components */}
          <Card>
            <CardHeader>
              <CardTitle>Form Components</CardTitle>
              <CardDescription>Testing form-related components</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Switch Component</Label>
                <Switch
                  checked={switchValue}
                  onCheckedChange={setSwitchValue}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Radio Group</Label>
                <RadioGroup value={radioValue} onValueChange={setRadioValue}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option1" id="option1" />
                    <Label htmlFor="option1">Option 1</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option2" id="option2" />
                    <Label htmlFor="option2">Option 2</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label>Slider</Label>
                <Slider
                  value={sliderValue}
                  onValueChange={setSliderValue}
                  max={100}
                  step={1}
                />
                <p className="text-sm text-muted-foreground">Value: {sliderValue[0]}</p>
              </div>
            </CardContent>
          </Card>

          {/* Layout Components */}
          <Card>
            <CardHeader>
              <CardTitle>Layout Components</CardTitle>
              <CardDescription>Testing layout-related components</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger>Accordion Item 1</AccordionTrigger>
                  <AccordionContent>
                    This is the content for accordion item 1. It should adapt to the current theme.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Accordion Item 2</AccordionTrigger>
                  <AccordionContent>
                    This is the content for accordion item 2.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Data Display */}
          <Card>
            <CardHeader>
              <CardTitle>Data Display</CardTitle>
              <CardDescription>Testing data display components</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Loading Skeletons</Label>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Table</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Item 1</TableCell>
                      <TableCell>
                        <Badge variant="default">Active</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Item 2</TableCell>
                      <TableCell>
                        <Badge variant="secondary">Inactive</Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <Card>
            <CardHeader>
              <CardTitle>Navigation</CardTitle>
              <CardDescription>Testing navigation components</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Breadcrumb</Label>
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/test">Test</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                      <span>Theme</span>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </CardContent>
          </Card>

          {/* Utility Components */}
          <Card>
            <CardHeader>
              <CardTitle>Utility Components</CardTitle>
              <CardDescription>Testing utility components</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Toggle</Label>
                <Toggle
                  pressed={toggleValue}
                  onPressedChange={setToggleValue}
                >
                  Toggle Me
                </Toggle>
              </div>
              
              <div className="space-y-2">
                <Label>Toggle Group</Label>
                <ToggleGroup type="single" defaultValue="center">
                  <ToggleGroupItem value="left">Left</ToggleGroupItem>
                  <ToggleGroupItem value="center">Center</ToggleGroupItem>
                  <ToggleGroupItem value="right">Right</ToggleGroupItem>
                </ToggleGroup>
              </div>
            </CardContent>
          </Card>

          {/* Feedback Components */}
          <Card>
            <CardHeader>
              <CardTitle>Feedback Components</CardTitle>
              <CardDescription>Testing feedback components</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTitle>Information</AlertTitle>
                <AlertDescription>
                  This alert should adapt to the current theme colors.
                </AlertDescription>
              </Alert>
              
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  This is a destructive alert variant.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Elements */}
        <Card>
          <CardHeader>
            <CardTitle>Interactive Elements</CardTitle>
            <CardDescription>Testing interactive components with tooltips</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="default">Default Button</Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This is a default button</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="secondary">Secondary Button</Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This is a secondary button</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Outline Button</Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This is an outline button</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="destructive">Destructive Button</Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This is a destructive button</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardContent>
        </Card>

        {/* Theme Variables Display */}
        <Card>
          <CardHeader>
            <CardTitle>Theme Variables</CardTitle>
            <CardDescription>Visual representation of theme colors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="h-12 bg-background border rounded"></div>
                <p className="text-xs">background</p>
              </div>
              <div className="space-y-2">
                <div className="h-12 bg-primary rounded"></div>
                <p className="text-xs">primary</p>
              </div>
              <div className="space-y-2">
                <div className="h-12 bg-secondary rounded"></div>
                <p className="text-xs">secondary</p>
              </div>
              <div className="space-y-2">
                <div className="h-12 bg-muted rounded"></div>
                <p className="text-xs">muted</p>
              </div>
              <div className="space-y-2">
                <div className="h-12 bg-accent rounded"></div>
                <p className="text-xs">accent</p>
              </div>
              <div className="space-y-2">
                <div className="h-12 bg-destructive rounded"></div>
                <p className="text-xs">destructive</p>
              </div>
              <div className="space-y-2">
                <div className="h-12 bg-card border rounded"></div>
                <p className="text-xs">card</p>
              </div>
              <div className="space-y-2">
                <div className="h-12 bg-popover border rounded"></div>
                <p className="text-xs">popover</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}