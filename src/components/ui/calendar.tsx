// src/components/ui/calendar.tsx
"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { cn } from "../../lib/utils";

import "react-day-picker/dist/style.css";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col space-y-4",
        month: "space-y-4",
        caption: "flex items-center justify-between",
        caption_label: "text-sm font-medium",
        nav: "flex items-center space-x-1",
        nav_button: cn(
          "rounded-md p-1 hover:bg-accent hover:text-accent-foreground",
        ),
        table: "w-full border-collapse space-y-1",
        head_cell:
          "w-9 rounded-md text-[0.8rem] font-normal text-muted-foreground",
        cell:
          "h-9 w-9 p-0 text-center text-sm focus-within:relative focus-within:z-20",
        day: cn(
          "h-9 w-9 rounded-md p-0 font-normal aria-selected:opacity-100",
        ),
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
        day_today: "text-primary dark:text-primary",
        ...classNames,
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
