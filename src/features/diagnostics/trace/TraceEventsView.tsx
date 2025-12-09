// src/features/diagnostics/trace/TraceEventsView.tsx
//
// TraceEventsView：Trace 事件视图模块
// - 接收 traceId / warehouseId / focusRef 作为 props
// - 内部负责：调用 fetchTrace、管理 loading/error/viewMode/sourceFilter/data

import React, { useEffect, useMemo, useState } from "react";
import { fetchTrace } from "./api";
import type { TraceEvent, TraceResponse } from "./types";
import { TraceTimeline } from "./TraceTimeline";
import { TraceHeader } from "./TraceHeader";
import { TraceFilters, type ViewMode } from "./TraceFilters";
import {
  TraceSourceFilter,
  type SourceFilter,
} from "./TraceSourceFilter";
import {
  TraceGroupedView,
  type GroupedByRef,
} from "./TraceGroupedView";

type Props = {
  traceId: string;
  warehouseId: string;
  focusRef?: string | null;
  onChangeTraceId: (v: string) => void;
  onChangeWarehouseId: (v: string) => void;
  /** 初次挂载时是否自动根据 traceId 调用一次查询（来源于 URL） */
  autoRunOnMount?: boolean;
};

export const TraceEventsView: React.FC<Props> = ({
  traceId,
  warehouseId,
  focusRef,
  onChangeTraceId,
  onChangeWarehouseId,
  autoRunOnMount = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TraceResponse | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>("timeline");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("ALL");
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const baseEvents: TraceEvent[] = useMemo(
    () => data?.events ?? [],
    [data],
  );

  const sources = useMemo(() => {
    const set = new Set<string>();
    for (const e of baseEvents) {
      if (e.source) set.add(e.source);
    }
    return Array.from(set).sort();
  }, [baseEvents]);

  const filteredEvents = useMemo(() => {
    if (sourceFilter === "ALL") return baseEvents;
    return baseEvents.filter((e) => e.source === sourceFilter);
  }, [baseEvents, sourceFilter]);

  const groupedByRef: GroupedByRef[] = useMemo(() => {
    const map = new Map<string, TraceEvent[]>();
    for (const e of filteredEvents) {
      const key = e.ref || "(无 ref)";
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(e);
    }

    const groups: GroupedByRef[] = [];
    for (const [ref, evs] of map.entries()) {
      const sorted = [...evs].sort((a, b) => {
        const ta =
          a.ts instanceof Date
            ? a.ts.getTime()
            : typeof a.ts === "string"
            ? Date.parse(a.ts)
            : 0;
        const tb =
          b.ts instanceof Date
            ? b.ts.getTime()
            : typeof b.ts === "string"
            ? Date.parse(b.ts)
            : 0;
        return ta - tb;
      });
      groups.push({ ref, events: sorted });
    }

    groups.sort((a, b) => a.ref.localeCompare(b.ref));
    return groups;
  }, [filteredEvents]);

  async function handleQuery() {
    setError(null);
    setData(null);
    setExpanded({});

    const tid = traceId.trim();
    if (!tid) {
      setError("trace_id 必填");
      return;
    }

    setLoading(true);
    try {
      const widRaw = warehouseId.trim();
      const wid = widRaw ? Number(widRaw) : undefined;
      const res = await fetchTrace(tid, wid);

      res.events.sort((a, b) => {
        const ta =
          a.ts instanceof Date
            ? a.ts.getTime()
            : typeof a.ts === "string"
            ? Date.parse(a.ts)
            : 0;
        const tb =
          b.ts instanceof Date
            ? b.ts.getTime()
            : typeof b.ts === "string"
            ? Date.parse(b.ts)
            : 0;
        return ta - tb;
      });

      setData(res);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "查询失败";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleToggleExpand(idx: number) {
    setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }));
  }

  const formatTs = (ts: string | Date | null): string => {
    if (!ts) return "-";
    if (ts instanceof Date) {
      return ts.toISOString().replace("T", " ").replace("Z", "");
    }
    return ts.replace("T", " ").replace("Z", "");
  };

  const metaText =
    data && data.events
      ? `共 ${data.events.length} 条事件 · trace_id: ${data.trace_id}${
          data.warehouse_id != null ? ` · 仓过滤: ${data.warehouse_id}` : ""
        }${focusRef ? ` · focus_ref: ${focusRef}` : ""}`
      : null;

  useEffect(() => {
    if (autoRunOnMount && traceId.trim()) {
      void handleQuery();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <TraceHeader />

      <TraceFilters
        traceId={traceId}
        warehouseId={warehouseId}
        viewMode={viewMode}
        loading={loading}
        error={error}
        metaText={metaText}
        onChangeTraceId={onChangeTraceId}
        onChangeWarehouseId={onChangeWarehouseId}
        onChangeViewMode={setViewMode}
        onSubmit={() => {
          void handleQuery();
        }}
      />

      <TraceSourceFilter
        sources={sources}
        value={sourceFilter}
        onChange={setSourceFilter}
      />

      {viewMode === "timeline" ? (
        <TraceTimeline
          events={filteredEvents}
          focusRef={focusRef ?? undefined}
        />
      ) : (
        <TraceGroupedView
          groups={groupedByRef}
          expanded={expanded}
          onToggle={handleToggleExpand}
          formatTs={formatTs}
          focusRef={focusRef ?? undefined}
        />
      )}
    </div>
  );
};
