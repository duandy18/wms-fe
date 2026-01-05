// src/features/operations/inbound/manual/useInboundManualReceiveModel.ts

import { useMemo, useState } from "react";
import type { InboundCockpitController } from "../types";
import type { ReceiveTaskLine } from "../../../receive-tasks/api";

type QtyInputMap = Record<number, string>;

type ApiErrorShape = {
  message?: string;
};

function safeName(line: ReceiveTaskLine): string {
  return line.item_name ?? line.item_sku ?? "该商品";
}

function parsePositiveInt(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n)) return null;
  const i = Math.floor(n);
  if (i <= 0) return null;
  return i;
}

export function useInboundManualReceiveModel(c: InboundCockpitController) {
  const task = c.currentTask;

  const [qtyInputs, setQtyInputs] = useState<QtyInputMap>({});
  const [error, setError] = useState<string | null>(null);
  const [savingItemId, setSavingItemId] = useState<number | null>(null);

  const lines: ReceiveTaskLine[] = useMemo(() => (task ? task.lines : []), [task]);

  const handleQtyChange = (itemId: number, value: string) => {
    setQtyInputs((prev) => ({ ...prev, [itemId]: value }));
  };

  const preview = useMemo(() => {
    // “本次摘要”只用于展示，不影响任何业务逻辑
    let touchedLines = 0;
    let totalQty = 0;

    for (const l of lines) {
      const raw = qtyInputs[l.item_id] ?? "";
      const scanned = l.scanned_qty ?? 0;
      const remaining =
        l.expected_qty != null ? (l.expected_qty ?? 0) - scanned : 0;

      // 空输入：默认“填剩余”（与你现有 handleReceive 行为保持一致）
      const qty = raw.trim()
        ? parsePositiveInt(raw)
        : remaining > 0
        ? remaining
        : null;

      if (qty && qty > 0) {
        touchedLines += 1;
        totalQty += qty;
      }
    }

    return { touchedLines, totalQty };
  }, [lines, qtyInputs]);

  const handleReceive = async (line: ReceiveTaskLine) => {
    setError(null);

    const raw = qtyInputs[line.item_id] ?? "";
    const scanned = line.scanned_qty ?? 0;
    const remaining =
      line.expected_qty != null ? (line.expected_qty ?? 0) - scanned : 0;

    let qty: number;
    if (raw.trim() === "") {
      qty = remaining > 0 ? remaining : 0;
    } else {
      qty = Number(raw.trim());
    }

    if (!Number.isFinite(qty) || Math.floor(qty) !== qty || qty <= 0) {
      setError(`「${safeName(line)}」的本次收货数量必须为正整数。`);
      return;
    }

    setSavingItemId(line.item_id);
    try {
      await c.manualReceiveLine(line.item_id, qty);

      setQtyInputs((prev) => {
        const next = { ...prev };
        delete next[line.item_id];
        return next;
      });
    } catch (e: unknown) {
      const err = e as ApiErrorShape;
      setError(err?.message ?? "记录本次收货失败");
    } finally {
      setSavingItemId(null);
    }
  };

  return {
    task,
    lines,

    qtyInputs,
    error,
    savingItemId,

    preview,

    handleQtyChange,
    handleReceive,
  };
}
