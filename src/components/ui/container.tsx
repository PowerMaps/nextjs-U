import { cn } from "@/lib/utils/cn";
import { forwardRef } from "react";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  center?: boolean;
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = "xl", padding = "md", center = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "w-full",
          center && "mx-auto",
          // Size variants
          {
            "max-w-sm": size === "sm",
            "max-w-md": size === "md", 
            "max-w-lg": size === "lg",
            "max-w-xl": size === "xl",
            "max-w-2xl": size === "2xl",
            "max-w-none": size === "full",
          },
          // Padding variants
          {
            "px-0": padding === "none",
            "px-4": padding === "sm",
            "px-6": padding === "md",
            "px-8": padding === "lg",
            "px-12": padding === "xl",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Container.displayName = "Container";

export { Container };
export type { ContainerProps };