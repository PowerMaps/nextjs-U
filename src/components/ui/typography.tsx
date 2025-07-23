import { cn } from "@/lib/utils/cn";
import { forwardRef } from "react";

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "body" | "caption" | "overline" | "subtitle1" | "subtitle2";
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl";
  weight?: "thin" | "light" | "normal" | "medium" | "semibold" | "bold" | "extrabold" | "black";
  align?: "left" | "center" | "right" | "justify";
  color?: "default" | "muted" | "primary" | "secondary" | "destructive" | "accent";
  responsive?: boolean;
  as?: keyof JSX.IntrinsicElements;
}

const Typography = forwardRef<HTMLElement, TypographyProps>(
  ({ 
    className, 
    variant = "body", 
    size, 
    weight, 
    align = "left", 
    color = "default", 
    responsive = true,
    as,
    ...props 
  }, ref) => {
    // Determine the HTML element to render
    const getElement = () => {
      if (as) return as;
      
      switch (variant) {
        case "h1": return "h1";
        case "h2": return "h2";
        case "h3": return "h3";
        case "h4": return "h4";
        case "h5": return "h5";
        case "h6": return "h6";
        case "caption": return "span";
        case "overline": return "span";
        case "subtitle1": return "h6";
        case "subtitle2": return "h6";
        default: return "p";
      }
    };

    // Get variant-specific classes
    const getVariantClasses = () => {
      if (size) return ""; // If size is explicitly set, don't apply variant classes
      
      const baseClasses = {
        h1: responsive 
          ? "text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight" 
          : "text-4xl font-bold tracking-tight",
        h2: responsive 
          ? "text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight" 
          : "text-3xl font-semibold tracking-tight",
        h3: responsive 
          ? "text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold tracking-tight" 
          : "text-2xl font-semibold tracking-tight",
        h4: responsive 
          ? "text-base sm:text-lg md:text-xl lg:text-2xl font-semibold tracking-tight" 
          : "text-xl font-semibold tracking-tight",
        h5: responsive 
          ? "text-sm sm:text-base md:text-lg lg:text-xl font-medium tracking-tight" 
          : "text-lg font-medium tracking-tight",
        h6: responsive 
          ? "text-xs sm:text-sm md:text-base lg:text-lg font-medium tracking-tight" 
          : "text-base font-medium tracking-tight",
        body: responsive 
          ? "text-sm sm:text-base leading-relaxed" 
          : "text-base leading-relaxed",
        caption: responsive 
          ? "text-xs sm:text-sm text-muted-foreground" 
          : "text-sm text-muted-foreground",
        overline: responsive 
          ? "text-xs sm:text-sm font-medium uppercase tracking-wider text-muted-foreground" 
          : "text-sm font-medium uppercase tracking-wider text-muted-foreground",
        subtitle1: responsive 
          ? "text-sm sm:text-base font-medium" 
          : "text-base font-medium",
        subtitle2: responsive 
          ? "text-xs sm:text-sm font-medium text-muted-foreground" 
          : "text-sm font-medium text-muted-foreground",
      };
      
      return baseClasses[variant];
    };

    // Get size classes when explicitly set
    const getSizeClasses = () => {
      if (!size) return "";
      
      if (responsive) {
        const responsiveSizes = {
          xs: "text-xs sm:text-sm",
          sm: "text-sm sm:text-base",
          base: "text-base sm:text-lg",
          lg: "text-lg sm:text-xl",
          xl: "text-xl sm:text-2xl",
          "2xl": "text-2xl sm:text-3xl",
          "3xl": "text-3xl sm:text-4xl",
          "4xl": "text-4xl sm:text-5xl",
          "5xl": "text-5xl sm:text-6xl",
          "6xl": "text-6xl sm:text-7xl",
        };
        return responsiveSizes[size];
      }
      
      return `text-${size}`;
    };

    const Element = getElement() as any;

    return (
      <Element
        ref={ref}
        className={cn(
          // Base styles
          "antialiased",
          
          // Variant or size classes
          getVariantClasses(),
          getSizeClasses(),
          
          // Weight
          weight && {
            "font-thin": weight === "thin",
            "font-light": weight === "light",
            "font-normal": weight === "normal",
            "font-medium": weight === "medium",
            "font-semibold": weight === "semibold",
            "font-bold": weight === "bold",
            "font-extrabold": weight === "extrabold",
            "font-black": weight === "black",
          },
          
          // Alignment
          {
            "text-left": align === "left",
            "text-center": align === "center",
            "text-right": align === "right",
            "text-justify": align === "justify",
          },
          
          // Color variants
          {
            "text-foreground": color === "default",
            "text-muted-foreground": color === "muted",
            "text-primary": color === "primary",
            "text-secondary-foreground": color === "secondary",
            "text-destructive": color === "destructive",
            "text-accent-foreground": color === "accent",
          },
          
          className
        )}
        {...props}
      />
    );
  }
);

// Convenience components for common use cases
const Heading = forwardRef<HTMLHeadingElement, Omit<TypographyProps, "variant"> & { level: 1 | 2 | 3 | 4 | 5 | 6 }>(
  ({ level, ...props }, ref) => {
    const variant = `h${level}` as TypographyProps["variant"];
    return <Typography ref={ref} variant={variant} {...props} />;
  }
);

const Text = forwardRef<HTMLParagraphElement, Omit<TypographyProps, "variant">>(
  (props, ref) => {
    return <Typography ref={ref} variant="body" {...props} />;
  }
);

const Caption = forwardRef<HTMLSpanElement, Omit<TypographyProps, "variant">>(
  (props, ref) => {
    return <Typography ref={ref} variant="caption" {...props} />;
  }
);

const Subtitle = forwardRef<HTMLHeadingElement, Omit<TypographyProps, "variant"> & { level?: 1 | 2 }>(
  ({ level = 1, ...props }, ref) => {
    const variant = `subtitle${level}` as TypographyProps["variant"];
    return <Typography ref={ref} variant={variant} {...props} />;
  }
);

Typography.displayName = "Typography";
Heading.displayName = "Heading";
Text.displayName = "Text";
Caption.displayName = "Caption";
Subtitle.displayName = "Subtitle";

export { Typography, Heading, Text, Caption, Subtitle };
export type { TypographyProps };