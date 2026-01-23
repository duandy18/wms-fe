// src/features/orders/components/orders-table/useOrdersTableDetail.ts
import { useCallback, useMemo, useState } from "react";

import type { OrderFacts, OrderSummary, OrderView, WarehouseOption } from "../../api/index";
import type { OrderWarehouseAvailabilityResponse } from "../../api/types";
import { fetchOrderFacts, fetchOrderView, fetchOrderWarehouseAvailability } from "../../api/client";

export type OrderFactsItem = {
  item_id: number;
  qty_ordered: number;
  qty_shipped: number;
  qty_returned: number;
  qty_remaining_refundable: number;
};

function toNumber(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function toOrderFactsItem(x: unknown): OrderFactsItem | null {
  if (!x || typeof x !== "object") return null;
  const r = x as Record<string, unknown>;
  const item_id = toNumber(r["item_id"]);
  if (item_id <= 0) return null;
  return {
    item_id,
    qty_ordered: toNumber(r["qty_ordered"]),
    qty_shipped: toNumber(r["qty_shipped"]),
    qty_returned: toNumber(r["qty_returned"]),
    qty_remaining_refundable: toNumber(r["qty_remaining_refundable"]),
  };
}

function getFactsItemsFromOrderFacts(of: OrderFacts | null): OrderFactsItem[] {
  if (!of) return [];
  const rec = of as unknown as Record<string, unknown>;
  const items = rec["items"];
  if (!Array.isArray(items)) return [];
  const out: OrderFactsItem[] = [];
  for (const x of items) {
    const it = toOrderFactsItem(x);
    if (it) out.push(it);
  }
  return out;
}

export function useOrdersTableDetail(args: { warehouses: WarehouseOption[] }) {
  const [selectedRow, setSelectedRow] = useState<OrderSummary | null>(null);

  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [detailView, setDetailView] = useState<OrderView | null>(null);
  const [detailFacts, setDetailFacts] = useState<OrderFacts | null>(null);

  const [availLoading, setAvailLoading] = useState(false);
  const [availError, setAvailError] = useState<string | null>(null);
  const [availResp, setAvailResp] = useState<OrderWarehouseAvailabilityResponse | null>(null);

  const candidateWarehouseIds = useMemo(() => {
    return (args.warehouses || [])
      .filter((w) => w.active !== false)
      .map((w) => Number(w.id))
      .filter((x) => Number.isFinite(x) && x > 0);
  }, [args.warehouses]);

  const close = useCallback(() => {
    setSelectedRow(null);

    setDetailView(null);
    setDetailFacts(null);
    setDetailError(null);
    setDetailLoading(false);

    setAvailResp(null);
    setAvailError(null);
    setAvailLoading(false);
  }, []);

  const load = useCallback(
    async (row: OrderSummary) => {
      setSelectedRow(row);

      setDetailLoading(true);
      setDetailError(null);
      setDetailView(null);
      setDetailFacts(null);

      setAvailLoading(true);
      setAvailError(null);
      setAvailResp(null);

      try {
        const [ov, of] = await Promise.all([
          fetchOrderView({ platform: row.platform, shopId: row.shop_id, extOrderNo: row.ext_order_no }),
          fetchOrderFacts({ platform: row.platform, shopId: row.shop_id, extOrderNo: row.ext_order_no }),
        ]);

        setDetailView(ov);
        setDetailFacts(of);

        const ar = await fetchOrderWarehouseAvailability({
          orderId: row.id,
          warehouseIds: candidateWarehouseIds,
        });

        if (ar.ok !== true) {
          setAvailError("加载履约对照失败（后端未返回 ok=true）");
          setAvailResp(null);
        } else {
          setAvailResp(ar);
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "加载订单详情失败";
        setDetailError(msg);
      } finally {
        setDetailLoading(false);
        setAvailLoading(false);
      }
    },
    [candidateWarehouseIds],
  );

  const factsItems = useMemo<OrderFactsItem[]>(() => {
    return getFactsItemsFromOrderFacts(detailFacts);
  }, [detailFacts]);

  const totals = useMemo(() => {
    if (!factsItems.length) return { ordered: 0, shipped: 0, returned: 0, remaining: 0 };
    return factsItems.reduce(
      (acc, f) => {
        acc.ordered += f.qty_ordered;
        acc.shipped += f.qty_shipped;
        acc.returned += f.qty_returned;
        acc.remaining += f.qty_remaining_refundable;
        return acc;
      },
      { ordered: 0, shipped: 0, returned: 0, remaining: 0 },
    );
  }, [factsItems]);

  return {
    selectedRow,
    detailLoading,
    detailError,
    detailView,

    factsItems,
    totals,

    availLoading,
    availError,
    availResp,

    load,
    close,
  };
}
