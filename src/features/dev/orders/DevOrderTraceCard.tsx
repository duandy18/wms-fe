// src/features/dev/orders/DevOrderTraceCard.tsx
import React from "react";
import { TraceTimeline } from "../../diagnostics/trace/TraceTimeline";
import type { TraceEvent } from "../../diagnostics/trace/types";

export const DevOrderTraceCard: React.FC<{
  events: TraceEvent[];
  focusRef: string | null;
}> = ({ events, focusRef }) => {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <TraceTimeline events={events} focusRef={focusRef} />
    </div>
  );
};
