// src/components/ui/command.tsx
"use client"

import * as React from "react"
import { Dialog, DialogContent } from "./dialog"
import { cn } from "../../lib/utils"

const Command = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground", className)}
      {...props}
    />
  )
)
Command.displayName = "Command"

export { Command }
