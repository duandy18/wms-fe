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
  ordered_case: number;
  received_case: number;
  remain_case: number;
  case_uom: string;

  // ✅ 快照解释器（Phase2 第一公民）
  case_ratio_snapshot: number; // 1采购单位=多少最小单位（>=1；无则为 1）

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

function baseUomLabel(line: PurchaseOrderDetailLine): string {
  const baseUom = String((line as { base_uom?: string | null }).base_uom ?? "").trim();
  if (baseUom) return baseUom;

  // ✅ 新合同：uom_snapshot（事实单位快照）
  const snap = String((line as { uom_snapshot?: string | null }).uom_snapshot ?? "").trim();
  if (snap) return snap;

  // ✅ enrich fallback（不属于旧字段，允许）
  const uom = String((line as { uom?: string | null }).uom ?? "").trim();
  if (uom) return uom;

  return "最小单位";
}

function caseRatioSnapshot(line: PurchaseOrderDetailLine): number {
  const ratio = safeInt((line as { case_ratio_snapshot?: number | null }).case_ratio_snapshot, 0);
  return ratio > 0 ? ratio : 1;
}

function caseUomSnapshot(line: PurchaseOrderDetailLine): string {
  const snap = String((line as { case_uom_snapshot?: string | null }).case_uom_snapshot ?? "").trim();
  return snap || "采购单位";
}

function deriveOrderedCase(line: PurchaseOrderDetailLine, orderedBase: number, ratio: number): number {
  // ✅ 主线：输入痕迹 qty_ordered_case_input
  const caseInput = (line as { qty_ordered_case_input?: number | null }).qty_ordered_case_input;
  if (caseInput != null) return safeInt(caseInput, 0);

  const r = ratio > 0 ? ratio : 1;
  const base = safeInt(orderedBase, 0);
  if (r > 1 && base > 0 && base % r === 0) {
    return Math.floor(base / r);
  }

  // 保守兜底：倍率=1 时，case 与 base 等价
  if (r === 1) return base;

  // 否则不给“瞎猜的件数”
  return 0;
}

function baseToCaseQty(baseQty: number, ratio: number): number {
  const r = ratio > 0 ? ratio : 1;
  const q = safeInt(baseQty, 0);
  return Math.floor(q / r);
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

  // ✅ 变更检测：以 base 事实 + 快照解释器为 key
  const poRevKey = useMemo(() => {
    if (!po) return "";
    const parts = (po.lines ?? []).map((l) => {
      const ratio = caseRatioSnapshot(l);
      const caseInput = (l as { qty_ordered_case_input?: number | null }).qty_ordered_case_input;
      const caseUom = caseUomSnapshot(l);
      const orderedBase = safeInt((l as { qty_ordered_base?: number | null }).qty_ordered_base, 0);
      const receivedBase = safeInt((l as { qty_received_base?: number | null }).qty_received_base, 0);
      const remainBase = safeInt((l as { qty_remaining_base?: number | null }).qty_remaining_base, 0);
      return `${l.id}:${orderedBase}:${receivedBase}:${remainBase}:${ratio}:${caseInput ?? "N"}:${caseUom}`;
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
        const ordered_base = safeInt((l as { qty_ordered_base?: number | null }).qty_ordered_base, 0);
        const received_base = safeInt((l as { qty_received_base?: number | null }).qty_received_base, 0);
        const remain_base = safeInt((l as { qty_remaining_base?: number | null }).qty_remaining_base, 0);

        const ratio = caseRatioSnapshot(l);
        const base_uom = baseUomLabel(l);
        const case_uom = caseUomSnapshot(l);

        const ordered_case = deriveOrderedCase(l, ordered_base, ratio);
        const received_case = baseToCaseQty(received_base, ratio);
        const remain_case = Math.max(ordered_case - received_case, 0);

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

          ordered_case,
          received_case,
          remain_case,
          case_uom,

          case_ratio_snapshot: ratio,

          has_shelf_life: Boolean((l as { has_shelf_life?: boolean | null }).has_shelf_life ?? false),
          shelf_life_value:
            (l as { shelf_life_value?: number | null }).shelf_life_value == null
              ? null
              : Number((l as { shelf_life_value?: number | null }).shelf_life_value),
          shelf_life_unit:
            (l as { shelf_life_unit?: string | null }).shelf_life_unit == null
              ? null
              : String((l as { shelf_life_unit?: string | null }).shelf_life_unit),
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
