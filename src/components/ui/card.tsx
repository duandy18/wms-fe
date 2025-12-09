// src/components/ui/card.tsx
import React from "react";
import { cn } from "../../lib/utils";

/**
 * Card 基础容器
 */
export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function Card({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn("rounded-2xl border bg-white shadow-sm", className)}
      {...props}
    />
  );
});

/**
 * CardHeader 区域
 */
export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function CardHeader({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn("p-4 border-b space-y-1", className)}
      {...props}
    />
  );
});

/**
 * CardContent 区域
 */
export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function CardContent({ className, ...props }, ref) {
  return (
    <div ref={ref} className={cn("p-4", className)} {...props} />
  );
});

/**
 * CardFooter 区域
 */
export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function CardFooter({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn("p-4 border-t flex items-center", className)}
      {...props}
    />
  );
});
