import { cn } from "@/lib/utils/cn";
import { forwardRef } from "react";

interface ResponsiveLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "stack" | "sidebar" | "split" | "centered";
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
}

interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  align?: "start" | "center" | "end" | "stretch";
}

interface SidebarLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  sidebarWidth?: "sm" | "md" | "lg" | "xl";
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  collapsible?: boolean;
}

interface SplitLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  ratio?: "1:1" | "1:2" | "2:1" | "1:3" | "3:1";
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  direction?: "horizontal" | "vertical";
  breakpoint?: "sm" | "md" | "lg" | "xl";
}

const ResponsiveLayout = forwardRef<HTMLDivElement, ResponsiveLayoutProps>(
  ({ className, variant = "stack", gap = "md", align = "stretch", justify = "start", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base layout styles
          {
            "flex flex-col": variant === "stack",
            "flex flex-col lg:flex-row": variant === "sidebar",
            "flex flex-col md:flex-row": variant === "split",
            "flex flex-col items-center justify-center min-h-screen": variant === "centered",
          },
          // Gap variants
          {
            "gap-0": gap === "none",
            "gap-1": gap === "xs",
            "gap-2": gap === "sm",
            "gap-4": gap === "md",
            "gap-6": gap === "lg",
            "gap-8": gap === "xl",
          },
          // Alignment
          {
            "items-start": align === "start",
            "items-center": align === "center",
            "items-end": align === "end",
            "items-stretch": align === "stretch",
          },
          // Justification
          {
            "justify-start": justify === "start",
            "justify-center": justify === "center",
            "justify-end": justify === "end",
            "justify-between": justify === "between",
            "justify-around": justify === "around",
            "justify-evenly": justify === "evenly",
          },
          className
        )}
        {...props}
      />
    );
  }
);

const Stack = forwardRef<HTMLDivElement, StackProps>(
  ({ className, gap = "md", align = "stretch", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col",
          // Gap variants
          {
            "gap-0": gap === "none",
            "gap-1": gap === "xs",
            "gap-2": gap === "sm",
            "gap-4": gap === "md",
            "gap-6": gap === "lg",
            "gap-8": gap === "xl",
          },
          // Alignment
          {
            "items-start": align === "start",
            "items-center": align === "center",
            "items-end": align === "end",
            "items-stretch": align === "stretch",
          },
          className
        )}
        {...props}
      />
    );
  }
);

const SidebarLayout = forwardRef<HTMLDivElement, SidebarLayoutProps>(
  ({ className, sidebarWidth = "md", gap = "md", collapsible = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col lg:flex-row",
          // Gap variants
          {
            "gap-0": gap === "none",
            "gap-1": gap === "xs",
            "gap-2": gap === "sm",
            "gap-4": gap === "md",
            "gap-6": gap === "lg",
            "gap-8": gap === "xl",
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const SidebarContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { width?: "sm" | "md" | "lg" | "xl" }>(
  ({ className, width = "md", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex-shrink-0",
          // Width variants
          {
            "w-full lg:w-48": width === "sm",
            "w-full lg:w-64": width === "md",
            "w-full lg:w-80": width === "lg",
            "w-full lg:w-96": width === "xl",
          },
          className
        )}
        {...props}
      />
    );
  }
);

const MainContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex-1 min-w-0", className)}
        {...props}
      />
    );
  }
);

const SplitLayout = forwardRef<HTMLDivElement, SplitLayoutProps>(
  ({ className, ratio = "1:1", gap = "md", direction = "horizontal", breakpoint = "md", children, ...props }, ref) => {
    const isVertical = direction === "vertical";
    const breakpointClass = {
      "sm": isVertical ? "sm:flex-col" : "sm:flex-row",
      "md": isVertical ? "md:flex-col" : "md:flex-row", 
      "lg": isVertical ? "lg:flex-col" : "lg:flex-row",
      "xl": isVertical ? "xl:flex-col" : "xl:flex-row",
    }[breakpoint];

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col",
          breakpointClass,
          // Gap variants
          {
            "gap-0": gap === "none",
            "gap-1": gap === "xs",
            "gap-2": gap === "sm",
            "gap-4": gap === "md",
            "gap-6": gap === "lg",
            "gap-8": gap === "xl",
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const SplitPanel = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { size?: "auto" | "1" | "2" | "3" }>(
  ({ className, size = "1", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          {
            "flex-auto": size === "auto",
            "flex-1": size === "1",
            "flex-2": size === "2",
            "flex-3": size === "3",
          },
          "min-w-0 min-h-0",
          className
        )}
        {...props}
      />
    );
  }
);

ResponsiveLayout.displayName = "ResponsiveLayout";
Stack.displayName = "Stack";
SidebarLayout.displayName = "SidebarLayout";
SidebarContent.displayName = "SidebarContent";
MainContent.displayName = "MainContent";
SplitLayout.displayName = "SplitLayout";
SplitPanel.displayName = "SplitPanel";

export { 
  ResponsiveLayout, 
  Stack, 
  SidebarLayout, 
  SidebarContent, 
  MainContent, 
  SplitLayout, 
  SplitPanel 
};
export type { 
  ResponsiveLayoutProps, 
  StackProps, 
  SidebarLayoutProps, 
  SplitLayoutProps 
};