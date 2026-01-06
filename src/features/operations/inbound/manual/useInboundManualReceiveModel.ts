// src/features/operations/inbound/manual/useInboundManualReceiveModel.ts

import { useEffect, useMemo, useRef, useState } from "react";
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

  // ✅ 仅在任务切换时初始化一次：默认填“剩余应收”（新任务=expected_qty）
  const initializedTaskIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!task) {
      initializedTaskIdRef.current = null;
      setQtyInputs({});
      return;
    }

    if (initializedTaskIdRef.current === task.id) return;

    initializedTaskIdRef.current = task.id;

    setQtyInputs((prev) => {
      // 如果已有用户输入（理论上 task 切换时 prev 会是空，但我们仍做保护）
      const next: QtyInputMap = { ...prev };

      for (const l of task.lines ?? []) {
        const expected = l.expected_qty ?? 0;
        const scanned = l.scanned_qty ?? 0;
        const remaining = Math.max(expected - scanned, 0);

        // 只有在该行还没被用户输入过时才填默认值
        if (next[l.item_id] == null) {
          // remaining 为 0 的行不默认填，避免误点产生 0/无意义提示
          if (remaining > 0) next[l.item_id] = String(remaining);
        }
      }

      return next;
    });

    setError(null);
  }, [task?.id]); // eslint-disable-line react-hooks/exhaustive-deps

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

      // 空输入：默认“填剩余”（与 handleReceive 行为保持一致）
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
