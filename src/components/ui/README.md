# Responsive Grid System

This document describes the responsive grid system components implemented for the modern UI.

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

## Examples

See `/app/examples/responsive-grid` for comprehensive examples of all components in action.