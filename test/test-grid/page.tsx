import { Container, Grid, GridItem, Typography } from "@/components/ui";

export default function TestGridPage() {
  return (
    <Container size="xl" className="py-8">
      <Typography variant="h1" className="mb-8">
        Grid System Test
      </Typography>
      
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
          <GridItem key={i} className="bg-secondary p-4 rounded">
            <Typography variant="body">Item {i + 1}</Typography>
          </GridItem>
        ))}
      </Grid>
    </Container>
  );
}