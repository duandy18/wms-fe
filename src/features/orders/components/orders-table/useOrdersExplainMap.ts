// src/features/orders/components/orders-table/useOrdersExplainMap.ts
import { useEffect, useMemo, useRef, useState } from "react";

import type { OrderSummary, WarehouseOption } from "../../api/index";
import type { OrderWarehouseAvailabilityResponse } from "../../api/types";
import { fetchOrderWarehouseAvailability } from "../../api/client";

type ExplainState = {
  loading: boolean;
  error: string | null;
  data: OrderWarehouseAvailabilityResponse | null;
};

function uniqPositiveInts(ids: number[]) {
  const out: number[] = [];
  const seen = new Set<number>();
  for (const x of ids) {
    const n = Number(x);
    if (!Number.isFinite(n) || n <= 0) continue;
    if (seen.has(n)) continue;
    seen.add(n);
    out.push(n);
  }
  return out;
}

/**
 * 列表页 Explain 拉取（按订单 id 缓存）：
 * - rows 变化时，为当前列表订单缺失项补齐 explain
 * - 并发限流，避免一次性 N 请求打爆
 */
export function useOrdersExplainMap(args: {
  rows: OrderSummary[];
  warehouses: WarehouseOption[];
  enabled?: boolean;
  concurrency?: number;
}) {
  const enabled = args.enabled !== false;
  const concurrency = Math.max(1, Number(args.concurrency ?? 6) || 6);

  const warehouseIds = useMemo(() => {
    // 候选仓：active != false
    return uniqPositiveInts((args.warehouses || []).filter((w) => w.active !== false).map((w) => w.id));
  }, [args.warehouses]);

  const orderIds = useMemo(() => {
    return uniqPositiveInts((args.rows || []).map((r) => r.id));
  }, [args.rows]);

  const [map, setMap] = useState<Record<number, ExplainState>>({});

  // 用 ref 存任务队列，避免 useEffect 里重复 enqueue
  const queueRef = useRef<number[]>([]);
  const runningRef = useRef(0);
  const inFlightRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!enabled) return;

    // 只对“当前列表订单”补齐
    const missing: number[] = [];
    for (const oid of orderIds) {
      const st = map[oid];
      if (st?.data || st?.loading) continue;
      missing.push(oid);
    }
    if (!missing.length) return;

    // 入队（去重）
    const q = queueRef.current;
    const exists = new Set(q);
    for (const oid of missing) {
      if (!exists.has(oid) && !inFlightRef.current.has(oid)) q.push(oid);
    }

    const pump = () => {
      if (!enabled) return;
      while (runningRef.current < concurrency && queueRef.current.length > 0) {
        const oid = queueRef.current.shift()!;
        if (inFlightRef.current.has(oid)) continue;

        inFlightRef.current.add(oid);
        runningRef.current += 1;

        setMap((prev) => ({
          ...prev,
          [oid]: { loading: true, error: null, data: prev[oid]?.data ?? null },
        }));

        void (async () => {
          try {
            const r = await fetchOrderWarehouseAvailability({
              orderId: oid,
              warehouseIds,
            });
            if (r.ok !== true) {
              setMap((prev) => ({ ...prev, [oid]: { loading: false, error: "explain 返回 ok!=true", data: null } }));
            } else {
              setMap((prev) => ({ ...prev, [oid]: { loading: false, error: null, data: r } }));
            }
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "加载 explain 失败";
            setMap((prev) => ({ ...prev, [oid]: { loading: false, error: msg, data: null } }));
          } finally {
            inFlightRef.current.delete(oid);
            runningRef.current -= 1;
            pump();
          }
        })();
      }
    };

    pump();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, concurrency, orderIds.join(","), warehouseIds.join(",")]);

  return {
    explainMap: map,
    explainWarehouseIds: warehouseIds,
  };
}
