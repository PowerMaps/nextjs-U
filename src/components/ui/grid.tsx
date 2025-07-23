import { cn } from "@/lib/utils/cn";
import { forwardRef } from "react";

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    "2xl"?: number;
  };
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  rows?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    "2xl"?: number;
  };
}

interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  colSpan?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    "2xl"?: number;
  };
  rowSpan?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    "2xl"?: number;
  };
}

const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols, gap = "md", rows, ...props }, ref) => {
    const getColsClasses = () => {
      if (!cols) return "grid-cols-1";
      
      const classes = [];
      
      if (cols.default) classes.push(`grid-cols-${cols.default}`);
      if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
      if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
      if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
      if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);
      if (cols["2xl"]) classes.push(`2xl:grid-cols-${cols["2xl"]}`);
      
      return classes.join(" ") || "grid-cols-1";
    };

    const getRowsClasses = () => {
      if (!rows) return "";
      
      const classes = [];
      
      if (rows.default) classes.push(`grid-rows-${rows.default}`);
      if (rows.sm) classes.push(`sm:grid-rows-${rows.sm}`);
      if (rows.md) classes.push(`md:grid-rows-${rows.md}`);
      if (rows.lg) classes.push(`lg:grid-rows-${rows.lg}`);
      if (rows.xl) classes.push(`xl:grid-rows-${rows.xl}`);
      if (rows["2xl"]) classes.push(`2xl:grid-rows-${rows["2xl"]}`);
      
      return classes.join(" ");
    };

    return (
      <div
        ref={ref}
        className={cn(
          "grid",
          getColsClasses(),
          getRowsClasses(),
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
      />
    );
  }
);

const GridItem = forwardRef<HTMLDivElement, GridItemProps>(
  ({ className, colSpan, rowSpan, ...props }, ref) => {
    const getColSpanClasses = () => {
      if (!colSpan) return "";
      
      const classes = [];
      
      if (colSpan.default) classes.push(`col-span-${colSpan.default}`);
      if (colSpan.sm) classes.push(`sm:col-span-${colSpan.sm}`);
      if (colSpan.md) classes.push(`md:col-span-${colSpan.md}`);
      if (colSpan.lg) classes.push(`lg:col-span-${colSpan.lg}`);
      if (colSpan.xl) classes.push(`xl:col-span-${colSpan.xl}`);
      if (colSpan["2xl"]) classes.push(`2xl:col-span-${colSpan["2xl"]}`);
      
      return classes.join(" ");
    };

    const getRowSpanClasses = () => {
      if (!rowSpan) return "";
      
      const classes = [];
      
      if (rowSpan.default) classes.push(`row-span-${rowSpan.default}`);
      if (rowSpan.sm) classes.push(`sm:row-span-${rowSpan.sm}`);
      if (rowSpan.md) classes.push(`md:row-span-${rowSpan.md}`);
      if (rowSpan.lg) classes.push(`lg:row-span-${rowSpan.lg}`);
      if (rowSpan.xl) classes.push(`xl:row-span-${rowSpan.xl}`);
      if (rowSpan["2xl"]) classes.push(`2xl:row-span-${rowSpan["2xl"]}`);
      
      return classes.join(" ");
    };

    return (
      <div
        ref={ref}
        className={cn(
          getColSpanClasses(),
          getRowSpanClasses(),
          className
        )}
        {...props}
      />
    );
  }
);

Grid.displayName = "Grid";
GridItem.displayName = "GridItem";

export { Grid, GridItem };
export type { GridProps, GridItemProps };