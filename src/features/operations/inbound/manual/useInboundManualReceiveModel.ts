// src/features/operations/inbound/manual/useInboundManualReceiveModel.ts

import { useMemo, useState } from "react";
import type { InboundCockpitController } from "../types";
import type { ReceiveTaskLine } from "../../../receive-tasks/api";

type QtyInputMap = Record<number, string>;

type ApiErrorShape = {
  message?: string;
};

export function useInboundManualReceiveModel(c: InboundCockpitController) {
  const task = c.currentTask;

  const [qtyInputs, setQtyInputs] = useState<QtyInputMap>({});
  const [error, setError] = useState<string | null>(null);
  const [savingItemId, setSavingItemId] = useState<number | null>(null);

  const lines: ReceiveTaskLine[] = useMemo(() => (task ? task.lines : []), [task]);

  const handleQtyChange = (itemId: number, value: string) => {
    setQtyInputs((prev) => ({ ...prev, [itemId]: value }));
  };

  const handleReceive = async (line: ReceiveTaskLine) => {
    setError(null);

    const raw = qtyInputs[line.item_id] ?? "";
    const trimmed = raw.trim();

    const scanned = line.scanned_qty ?? 0;
    const baseRemaining = line.expected_qty != null ? (line.expected_qty ?? 0) - scanned : 0;

    let qty: number;
    if (trimmed === "") {
      qty = baseRemaining > 0 ? baseRemaining : 0;
    } else {
      qty = Number(trimmed);
    }

    if (!Number.isFinite(qty) || qty <= 0) {
      setError(`行 item_id=${line.item_id} 的本次收货数量必须为正整数。`);
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
      setError(err?.message ?? "行收货失败");
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

    handleQtyChange,
    handleReceive,
  };
}
