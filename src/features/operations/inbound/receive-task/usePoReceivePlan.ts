// src/features/operations/inbound/receive-task/usePoReceivePlan.ts

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PurchaseOrderDetail, PurchaseOrderDetailLine } from "../../../purchase-orders/api";

export type PlanRow = {
  poLineId: number;
  itemId: number;
  name: string;
  sku: string;
  spec: string;

  // ✅ 主口径：最小单位（base）
  ordered_base: number;
  received_base: number;
  remain_base: number;
  base_uom: string;

  // ✅ 辅助口径：采购单位（用于括号解释；不参与事实比较）
  ordered_purchase: number;
  received_purchase: number;
  remain_purchase: number;
  purchase_uom: string;

  units_per_case: number; // 1采购单位=多少最小单位

  // ✅ 保质期策略（来自详情态行）
  has_shelf_life: boolean;
  shelf_life_value: number | null;
  shelf_life_unit: string | null;
};

function safeInt(v: unknown, fallback: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.trunc(n);
}

function unitsPerCase(line: PurchaseOrderDetailLine): number {
  const n = safeInt(line.units_per_case, 1);
  return n > 0 ? n : 1;
}

function baseUomLabel(line: PurchaseOrderDetailLine): string {
  const a = (line.base_uom ?? "").trim();
  if (a) return a;
  const b = (line.uom ?? "").trim();
  if (b) return b;
  return "最小单位";
}

function purchaseUomLabel(line: PurchaseOrderDetailLine): string {
  const p = (line.purchase_uom ?? "").trim();
  return p || "采购单位";
}

function baseToPurchaseQty(line: PurchaseOrderDetailLine, baseQty: number): number {
  const upc = unitsPerCase(line);
  const q = safeInt(baseQty, 0);
  return Math.floor(q / upc);
}

function normalizeBatch(v: string): string {
  return (v ?? "").trim();
}

function normalizeDateStr(v: string): string {
  return (v ?? "").trim();
}

function requiresExpiryExplicit(row: PlanRow): boolean {
  if (!row.has_shelf_life) return false;
  if (row.shelf_life_value == null) return true;
  if (!row.shelf_life_unit || !String(row.shelf_life_unit).trim()) return true;
  return false;
}

export function usePoReceivePlan(po: PurchaseOrderDetail | null) {
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [qtyMap, setQtyMap] = useState<Record<number, string>>({});

  // ✅ Phase 3：创建任务阶段输入批次/生产日期/到期日期（必要时）
  const [batchMap, setBatchMap] = useState<Record<number, string>>({});
  const [prodMap, setProdMap] = useState<Record<number, string>>({});
  const [expMap, setExpMap] = useState<Record<number, string>>({});

  const poRevKey = useMemo(() => {
    if (!po) return "";
    const parts = (po.lines ?? []).map((l) => {
      const upc = l.units_per_case ?? 1;
      return `${l.id}:${l.qty_ordered_base}:${l.qty_received_base}:${l.qty_remaining_base}:${upc}`;
    });
    return `${po.id}|${parts.join("|")}`;
  }, [po]);

  const lastRevRef = useRef<string>("");

  useEffect(() => {
    setSelected({});
    setQtyMap({});
    setBatchMap({});
    setProdMap({});
    setExpMap({});
    lastRevRef.current = poRevKey;
  }, [po?.id, poRevKey]);

  useEffect(() => {
    if (!po) return;
    if (!lastRevRef.current) {
      lastRevRef.current = poRevKey;
      return;
    }
    if (lastRevRef.current !== poRevKey) {
      setSelected({});
      setQtyMap({});
      setBatchMap({});
      setProdMap({});
      setExpMap({});
      lastRevRef.current = poRevKey;
    }
  }, [poRevKey, po]);

  const rows: PlanRow[] = useMemo(() => {
    if (!po) return [];

    return (po.lines ?? [])
      .map((l) => {
        const ordered_purchase = safeInt(l.qty_ordered, 0);

        const ordered_base = safeInt(l.qty_ordered_base, 0);
        const received_base = safeInt(l.qty_received_base, 0);
        const remain_base = safeInt(l.qty_remaining_base, 0);

        const upc = unitsPerCase(l);
        const base_uom = baseUomLabel(l);
        const purchase_uom = purchaseUomLabel(l);

        const received_purchase = baseToPurchaseQty(l, received_base);
        const remain_purchase = Math.max(ordered_purchase - received_purchase, 0);

        return {
          poLineId: l.id,
          itemId: l.item_id,
          name: l.item_name ?? `商品#${l.item_id}`,
          sku: l.item_sku ?? "",
          spec: l.spec_text ?? "",

          ordered_base,
          received_base,
          remain_base,
          base_uom,

          ordered_purchase,
          received_purchase,
          remain_purchase,
          purchase_uom,

          units_per_case: upc,

          has_shelf_life: Boolean(l.has_shelf_life ?? false),
          shelf_life_value: l.shelf_life_value == null ? null : Number(l.shelf_life_value),
          shelf_life_unit: l.shelf_life_unit == null ? null : String(l.shelf_life_unit),
        };
      })
      .filter((r) => r.remain_base > 0);
  }, [po]);

  const validateQty = useCallback((v: string, remain_base: number): string | null => {
    if (!v) return "请输入数量";
    const n = Number(v);
    if (!Number.isInteger(n)) return "必须为整数";
    if (n <= 0) return "必须大于 0";
    if (n > remain_base) return "超过剩余应收";
    return null;
  }, []);

  const validateMeta = useCallback(
    (row: PlanRow): { batch?: string; prod?: string; exp?: string } | null => {
      if (!row.has_shelf_life) return null;

      const batch = normalizeBatch(batchMap[row.poLineId] ?? "");
      const prod = normalizeDateStr(prodMap[row.poLineId] ?? "");
      const exp = normalizeDateStr(expMap[row.poLineId] ?? "");

      const out: { batch?: string; prod?: string; exp?: string } = {};
      if (!batch) out.batch = "批次必填";
      if (!prod) out.prod = "生产日期必填";
      if (requiresExpiryExplicit(row) && !exp) out.exp = "到期日期必填（无法推算）";

      return Object.keys(out).length > 0 ? out : null;
    },
    [batchMap, prodMap, expMap],
  );

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
        const err = validateQty(raw, r.remain_base);

        if (selected[id]) {
          next[id] = err ? String(r.remain_base) : raw;
        }
      }
      return next;
    });

    setBatchMap((prev) => {
      const next: Record<number, string> = {};
      for (const k of Object.keys(prev)) {
        const id = Number(k);
        if (!selected[id]) continue;
        if (!rowMap.has(id)) continue;
        next[id] = prev[id];
      }
      return next;
    });
    setProdMap((prev) => {
      const next: Record<number, string> = {};
      for (const k of Object.keys(prev)) {
        const id = Number(k);
        if (!selected[id]) continue;
        if (!rowMap.has(id)) continue;
        next[id] = prev[id];
      }
      return next;
    });
    setExpMap((prev) => {
      const next: Record<number, string> = {};
      for (const k of Object.keys(prev)) {
        const id = Number(k);
        if (!selected[id]) continue;
        if (!rowMap.has(id)) continue;
        next[id] = prev[id];
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, validateQty]);

  function toggleLine(id: number, checked: boolean, remain_base: number) {
    if (remain_base <= 0) return;

    setSelected((m) => ({ ...m, [id]: checked }));

    if (checked) {
      setQtyMap((m) => ({ ...m, [id]: String(remain_base) }));
    } else {
      setQtyMap((m) => {
        const next = { ...m };
        delete next[id];
        return next;
      });
      setBatchMap((m) => {
        const next = { ...m };
        delete next[id];
        return next;
      });
      setProdMap((m) => {
        const next = { ...m };
        delete next[id];
        return next;
      });
      setExpMap((m) => {
        const next = { ...m };
        delete next[id];
        return next;
      });
    }
  }

  function updateQty(id: number, v: string) {
    setQtyMap((m) => ({ ...m, [id]: v }));
  }
  function updateBatch(id: number, v: string) {
    setBatchMap((m) => ({ ...m, [id]: v }));
  }
  function updateProd(id: number, v: string) {
    setProdMap((m) => ({ ...m, [id]: v }));
  }
  function updateExp(id: number, v: string) {
    setExpMap((m) => ({ ...m, [id]: v }));
  }

  const hasSelection = useMemo(() => Object.values(selected).some(Boolean), [selected]);

  const planValid = useMemo(() => {
    if (!hasSelection) return false;

    for (const r of rows) {
      if (!selected[r.poLineId]) continue;

      const errQty = validateQty(qtyMap[r.poLineId] ?? "", r.remain_base);
      if (errQty) return false;

      const errMeta = validateMeta(r);
      if (errMeta) return false;
    }
    return true;
  }, [rows, selected, qtyMap, hasSelection, validateQty, validateMeta]);

  function applyDefault() {
    const s: Record<number, boolean> = {};
    const q: Record<number, string> = {};
    for (const r of rows) {
      s[r.poLineId] = true;
      q[r.poLineId] = String(r.remain_base);
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
    batchMap,
    prodMap,
    expMap,
    selectedIds,
    planValid,
    toggleLine,
    updateQty,
    updateBatch,
    updateProd,
    updateExp,
    validateQty,
    validateMeta,
    applyDefault,
  };
}
