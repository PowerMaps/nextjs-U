import { ResponsiveGridExample } from "@/components/examples";
import { Heading } from "@/components/ui";

export default function ResponsiveGridPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 mx-auto">
        <div className="mb-8 text-center">
          <Heading level={1} className="mb-4">
            Responsive Grid System
          </Heading>
          <p className="text-lg text-muted-foreground">
            Comprehensive examples of the responsive grid system components
          </p>
        </div>

        <ResponsiveGridExample />
      </div>
    </div>
  );
}
