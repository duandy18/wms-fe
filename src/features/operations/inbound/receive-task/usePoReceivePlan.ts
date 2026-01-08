// src/features/operations/inbound/receive-task/usePoReceivePlan.ts

import { useEffect, useMemo, useRef, useState } from "react";
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

  // ✅ PO 刷新版本：同一 po.id 下，只要 “已收/应收”变化，就视为新一轮计划（清空勾选/数量）
  const poRevKey = useMemo(() => {
    if (!po) return "";
    const parts = (po.lines ?? []).map((l) => {
      const ordered = l.qty_ordered ?? 0;
      const received = l.qty_received ?? 0;
      return `${l.id}:${ordered}:${received}`;
    });
    return `${po.id}|${parts.join("|")}`;
  }, [po]);

  const lastRevRef = useRef<string>("");

  // 切换 PO 时重置
  useEffect(() => {
    setSelected({});
    setQtyMap({});
    lastRevRef.current = poRevKey;
  }, [po?.id, poRevKey]);

  // ✅ 同一 PO 刷新（qty_received 等变化）也要重置：提交完成后必须“干净”
  useEffect(() => {
    if (!po) return;
    if (!lastRevRef.current) {
      lastRevRef.current = poRevKey;
      return;
    }
    if (lastRevRef.current !== poRevKey) {
      setSelected({});
      setQtyMap({});
      lastRevRef.current = poRevKey;
    }
  }, [poRevKey, po]);

  const rows: PlanRow[] = useMemo(() => {
    if (!po) return [];

    // ✅ “采购计划未完成清单”：只保留 remain > 0 的行
    return (po.lines ?? [])
      .map((l) => {
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
      })
      .filter((r) => r.remain > 0);
  }, [po]);

  function validateQty(v: string, remain: number): string | null {
    if (!v) return "请输入数量";
    const n = Number(v);
    if (!Number.isInteger(n)) return "必须为整数";
    if (n <= 0) return "必须大于 0";
    if (n > remain) return "超过剩余应收";
    return null;
  }

  // ✅ PO 刷新后对齐（但不做“自动勾选”）：只做安全修正
  useEffect(() => {
    const rowMap = new Map<number, PlanRow>();
    for (const r of rows) rowMap.set(r.poLineId, r);

    setSelected((prev) => {
      const next: Record<number, boolean> = {};
      for (const k of Object.keys(prev)) {
        const id = Number(k);
        if (!prev[id]) continue;
        const r = rowMap.get(id);
        if (!r) continue;
        next[id] = true;
      }
      return next;
    });

    setQtyMap((prev) => {
      const next: Record<number, string> = {};
      for (const k of Object.keys(prev)) {
        const id = Number(k);
        const r = rowMap.get(id);
        if (!r) continue;

        const raw = String(prev[id] ?? "").trim();
        const err = validateQty(raw, r.remain);

        if (selected[id]) {
          next[id] = err ? String(r.remain) : raw;
        }
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  function toggleLine(id: number, checked: boolean, remain: number) {
    if (remain <= 0) return;

    setSelected((m) => ({ ...m, [id]: checked }));

    if (checked) {
      // ✅ 勾选即覆盖填充 remain（不允许沿用旧值）
      setQtyMap((m) => ({ ...m, [id]: String(remain) }));
    } else {
      // ✅ 取消勾选：清除该行数量（防残留）
      setQtyMap((m) => {
        const next = { ...m };
        delete next[id];
        return next;
      });
    }
  }

  function updateQty(id: number, v: string) {
    setQtyMap((m) => ({ ...m, [id]: v }));
  }

  // 是否至少选择了一行
  const hasSelection = useMemo(() => Object.values(selected).some(Boolean), [selected]);

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
      s[r.poLineId] = true;
      q[r.poLineId] = String(r.remain);
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
