// src/components/ui/use-popover.ts
import * as React from "react"

export function usePopover() {
  const [open, setOpen] = React.useState(false)
  const toggle = () => setOpen((v) => !v)
  const close = () => setOpen(false)
  return { open, setOpen, toggle, close }
}
