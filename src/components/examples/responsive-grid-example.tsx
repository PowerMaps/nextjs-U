"use client";

import { 
  Container, 
  Grid, 
  GridItem, 
  Stack, 
  SidebarLayout, 
  SidebarContent, 
  MainContent,
  SplitLayout,
  SplitPanel,
  Typography,
  Heading,
  Text,
  Show,
  Hide,
  ShowOnMobile,
  HideOnMobile
} from "@/components/ui";
import { useBreakpoints } from "@/lib/hooks/use-breakpoint";

export function ResponsiveGridExample() {
  const breakpoints = useBreakpoints();

  return (
    <div className="space-y-12 p-6">
      {/* Current Breakpoint Indicator */}
      <Container size="xl">
        <div className="bg-primary/10 p-4 rounded-lg">
          <Heading level={3}>Current Breakpoint: {breakpoints.current}</Heading>
          <Text color="muted">Resize the window to see responsive behavior</Text>
        </div>
      </Container>

      {/* Container Examples */}
      <section>
        <Container size="xl">
          <Heading level={2} className="mb-6">Container Examples</Heading>
          
          <Stack gap="lg">
            <Container size="sm" className="bg-secondary p-4 rounded">
              <Text>Small Container (max-w-sm)</Text>
            </Container>
            
            <Container size="md" className="bg-secondary p-4 rounded">
              <Text>Medium Container (max-w-md)</Text>
            </Container>
            
            <Container size="lg" className="bg-secondary p-4 rounded">
              <Text>Large Container (max-w-lg)</Text>
            </Container>
            
            <Container size="xl" className="bg-secondary p-4 rounded">
              <Text>Extra Large Container (max-w-xl)</Text>
            </Container>
          </Stack>
        </Container>
      </section>

      {/* Grid Examples */}
      <section>
        <Container size="xl">
          <Heading level={2} className="mb-6">Responsive Grid Examples</Heading>
          
          {/* Basic Grid */}
          <div className="mb-8">
            <Heading level={3} className="mb-4">Basic Responsive Grid</Heading>
            <Grid 
              cols={{ 
                default: 1, 
                sm: 2, 
                md: 3, 
                lg: 4 
              }} 
              gap="md"
            >
              {Array.from({ length: 8 }, (_, i) => (
                <GridItem key={i} className="bg-accent p-4 rounded">
                  <Text>Item {i + 1}</Text>
                </GridItem>
              ))}
            </Grid>
          </div>

          {/* Grid with Spanning Items */}
          <div className="mb-8">
            <Heading level={3} className="mb-4">Grid with Column Spans</Heading>
            <Grid cols={{ default: 1, md: 4 }} gap="md">
              <GridItem 
                colSpan={{ default: 1, md: 2 }} 
                className="bg-primary/20 p-4 rounded"
              >
                <Text>Spans 2 columns on md+</Text>
              </GridItem>
              
              <GridItem className="bg-secondary p-4 rounded">
                <Text>Regular item</Text>
              </GridItem>
              
              <GridItem className="bg-secondary p-4 rounded">
                <Text>Regular item</Text>
              </GridItem>
              
              <GridItem 
                colSpan={{ default: 1, md: 4 }} 
                className="bg-accent p-4 rounded"
              >
                <Text>Full width on md+</Text>
              </GridItem>
            </Grid>
          </div>
        </Container>
      </section>

      {/* Layout Examples */}
      <section>
        <Container size="xl">
          <Heading level={2} className="mb-6">Layout Examples</Heading>
          
          {/* Sidebar Layout */}
          <div className="mb-8">
            <Heading level={3} className="mb-4">Sidebar Layout</Heading>
            <SidebarLayout gap="lg" className="min-h-[300px]">
              <SidebarContent width="md" className="bg-secondary p-4 rounded">
                <Heading level={4}>Sidebar</Heading>
                <Text color="muted">This sidebar stacks on mobile and sits beside content on desktop</Text>
              </SidebarContent>
              
              <MainContent className="bg-accent p-4 rounded">
                <Heading level={4}>Main Content</Heading>
                <Text>This is the main content area that takes up the remaining space.</Text>
              </MainContent>
            </SidebarLayout>
          </div>

          {/* Split Layout */}
          <div className="mb-8">
            <Heading level={3} className="mb-4">Split Layout</Heading>
            <SplitLayout gap="lg" breakpoint="md" className="min-h-[200px]">
              <SplitPanel className="bg-primary/20 p-4 rounded">
                <Heading level={4}>Panel 1</Heading>
                <Text>Equal width panel</Text>
              </SplitPanel>
              
              <SplitPanel className="bg-secondary p-4 rounded">
                <Heading level={4}>Panel 2</Heading>
                <Text>Equal width panel</Text>
              </SplitPanel>
            </SplitLayout>
          </div>
        </Container>
      </section>

      {/* Typography Examples */}
      <section>
        <Container size="xl">
          <Heading level={2} className="mb-6">Responsive Typography</Heading>
          
          <Stack gap="lg">
            <div>
              <Typography variant="h1" responsive>
                Responsive H1 Heading
              </Typography>
              <Text color="muted">This heading scales with screen size</Text>
            </div>
            
            <div>
              <Typography variant="h2" responsive>
                Responsive H2 Heading
              </Typography>
              <Text color="muted">Smaller on mobile, larger on desktop</Text>
            </div>
            
            <div>
              <Typography variant="body" responsive>
                This is responsive body text that adjusts its size based on the screen size. 
                It's smaller on mobile devices and larger on desktop screens for optimal readability.
              </Typography>
            </div>
            
            <div>
              <Typography variant="caption" responsive>
                Responsive caption text that scales appropriately
              </Typography>
            </div>
          </Stack>
        </Container>
      </section>

      {/* Responsive Visibility Examples */}
      <section>
        <Container size="xl">
          <Heading level={2} className="mb-6">Responsive Visibility</Heading>
          
          <Stack gap="md">
            <ShowOnMobile>
              <div className="bg-destructive/20 p-4 rounded">
                <Text>📱 This only shows on mobile devices</Text>
              </div>
            </ShowOnMobile>
            
            <HideOnMobile>
              <div className="bg-primary/20 p-4 rounded">
                <Text>🖥️ This is hidden on mobile devices</Text>
              </div>
            </HideOnMobile>
            
            <Show above="lg">
              <div className="bg-accent p-4 rounded">
                <Text>💻 This only shows on large screens and up</Text>
              </div>
            </Show>
            
            <Hide above="md">
              <div className="bg-secondary p-4 rounded">
                <Text>📱 This is hidden on medium screens and up</Text>
              </div>
            </Hide>
          </Stack>
        </Container>
      </section>

      {/* Complex Layout Example */}
      <section>
        <Container size="2xl">
          <Heading level={2} className="mb-6">Complex Responsive Layout</Heading>
          
          <Grid 
            cols={{ 
              default: 1, 
              lg: 12 
            }} 
            gap="lg"
          >
            {/* Header */}
            <GridItem 
              colSpan={{ default: 1, lg: 12 }} 
              className="bg-primary/20 p-6 rounded"
            >
              <Heading level={3}>Dashboard Header</Heading>
              <Text color="muted">Full width header section</Text>
            </GridItem>
            
            {/* Sidebar */}
            <GridItem 
              colSpan={{ default: 1, lg: 3 }} 
              className="bg-secondary p-6 rounded"
            >
              <Heading level={4}>Navigation</Heading>
              <Stack gap="sm" className="mt-4">
                <Text>Dashboard</Text>
                <Text>Analytics</Text>
                <Text>Settings</Text>
              </Stack>
            </GridItem>
            
            {/* Main Content */}
            <GridItem 
              colSpan={{ default: 1, lg: 6 }} 
              className="bg-accent p-6 rounded"
            >
              <Heading level={4}>Main Content</Heading>
              <Text className="mt-2">
                This is the primary content area that adapts to different screen sizes.
                On mobile, it stacks vertically. On desktop, it uses a 12-column grid system.
              </Text>
            </GridItem>
            
            {/* Sidebar */}
            <GridItem 
              colSpan={{ default: 1, lg: 3 }} 
              className="bg-muted p-6 rounded"
            >
              <Heading level={4}>Sidebar</Heading>
              <Text className="mt-2">Additional information or widgets</Text>
            </GridItem>
          </Grid>
        </Container>
      </section>
    </div>
  );
}