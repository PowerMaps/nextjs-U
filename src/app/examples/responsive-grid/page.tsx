import { ResponsiveGridExample } from "@/components/examples";
import { Heading } from "@/components/ui";

export default function ResponsiveGridPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <Heading level={1} className="mb-4">
            Responsive Grid System
          </Heading>
          <p className="text-muted-foreground text-lg">
            Comprehensive examples of the responsive grid system components
          </p>
        </div>
        
        <ResponsiveGridExample />
      </div>
    </div>
  );
}