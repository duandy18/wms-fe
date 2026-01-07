// src/features/operations/inbound/receive-task/usePoReceivePlan.ts

import { useEffect, useMemo, useState } from "react";
import type { PurchaseOrderWithLines } from "../../../purchase-orders/api";

export type PlanRow = {
  poLineId: number;
  itemId: number;
  name: string;
  sku: string;
  spec: string;
  ordered: number;
  received: number;
  remain: number;
};

export function usePoReceivePlan(po: PurchaseOrderWithLines | null) {
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [qtyMap, setQtyMap] = useState<Record<number, string>>({});

  // 切换 PO 时重置
  useEffect(() => {
    setSelected({});
    setQtyMap({});
  }, [po?.id]);

  const rows: PlanRow[] = useMemo(() => {
    if (!po) return [];
    return po.lines.map((l) => {
      const ordered = l.qty_ordered ?? 0;
      const received = l.qty_received ?? 0;
      const remain = Math.max(ordered - received, 0);
      return {
        poLineId: l.id,
        itemId: l.item_id,
        name: l.item_name ?? `商品#${l.item_id}`,
        sku: l.item_sku ?? "",
        spec: l.spec_text ?? "",
        ordered,
        received,
        remain,
      };
    });
  }, [po]);

  function toggleLine(id: number, checked: boolean, remain: number) {
    setSelected((m) => ({ ...m, [id]: checked }));
    if (checked && qtyMap[id] == null) {
      setQtyMap((m) => ({ ...m, [id]: String(remain) }));
    }
  }

  function updateQty(id: number, v: string) {
    setQtyMap((m) => ({ ...m, [id]: v }));
  }

  function validateQty(v: string, remain: number): string | null {
    if (!v) return "请输入数量";
    const n = Number(v);
    if (!Number.isInteger(n)) return "必须为整数";
    if (n <= 0) return "必须大于 0";
    if (n > remain) return "超过剩余应收";
    return null;
  }

  // 是否至少选择了一行
  const hasSelection = useMemo(
    () => Object.values(selected).some(Boolean),
    [selected],
  );

  const planValid = useMemo(() => {
    if (!hasSelection) return false;

    for (const r of rows) {
      if (!selected[r.poLineId]) continue;
      const err = validateQty(qtyMap[r.poLineId] ?? "", r.remain);
      if (err) return false;
    }
    return true;
  }, [rows, selected, qtyMap, hasSelection]);

  function applyDefault() {
    const s: Record<number, boolean> = {};
    const q: Record<number, string> = {};
    for (const r of rows) {
      if (r.remain > 0) {
        s[r.poLineId] = true;
        q[r.poLineId] = String(r.remain);
      }
    }
    setSelected(s);
    setQtyMap(q);
  }

  const selectedIds = useMemo(
    () => Object.keys(selected).filter((k) => selected[Number(k)]).map(Number),
    [selected],
  );

  return {
    rows,
    selected,
    qtyMap,
    selectedIds,
    planValid,
    toggleLine,
    updateQty,
    validateQty,
    applyDefault,
  };
}
