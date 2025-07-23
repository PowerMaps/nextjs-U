"use client";

import { useBreakpoint, useBreakpoints } from "@/lib/hooks/use-breakpoint";
import { ReactNode } from "react";

interface ShowProps {
  above?: "sm" | "md" | "lg" | "xl" | "2xl";
  below?: "sm" | "md" | "lg" | "xl" | "2xl";
  only?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  children: ReactNode;
}

interface HideProps {
  above?: "sm" | "md" | "lg" | "xl" | "2xl";
  below?: "sm" | "md" | "lg" | "xl" | "2xl";
  only?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  children: ReactNode;
}

export function Show({ above, below, only, children }: ShowProps) {
  const breakpoints = useBreakpoints();
  const aboveBreakpoint = useBreakpoint(above || "sm");
  const belowBreakpoint = useBreakpoint(below || "sm");
  
  const isAbove = above ? aboveBreakpoint : true;
  const isBelow = below ? !belowBreakpoint : true;
  const isOnly = only ? breakpoints.current === only : true;

  const shouldShow = isAbove && isBelow && isOnly;

  return shouldShow ? <>{children}</> : null;
}

export function Hide({ above, below, only, children }: HideProps) {
  const breakpoints = useBreakpoints();
  const aboveBreakpoint = useBreakpoint(above || "sm");
  const belowBreakpoint = useBreakpoint(below || "sm");
  
  const isAbove = above ? aboveBreakpoint : false;
  const isBelow = below ? !belowBreakpoint : false;
  const isOnly = only ? breakpoints.current === only : false;

  const shouldHide = isAbove || isBelow || isOnly;

  return shouldHide ? null : <>{children}</>;
}

// Convenience components for common patterns
export function ShowOnMobile({ children }: { children: ReactNode }) {
  return <Show below="md">{children}</Show>;
}

export function ShowOnTablet({ children }: { children: ReactNode }) {
  return <Show above="md" below="lg">{children}</Show>;
}

export function ShowOnDesktop({ children }: { children: ReactNode }) {
  return <Show above="lg">{children}</Show>;
}

export function HideOnMobile({ children }: { children: ReactNode }) {
  return <Hide below="md">{children}</Hide>;
}

export function HideOnTablet({ children }: { children: ReactNode }) {
  return <Hide above="md" below="lg">{children}</Hide>;
}

export function HideOnDesktop({ children }: { children: ReactNode }) {
  return <Hide above="lg">{children}</Hide>;
}