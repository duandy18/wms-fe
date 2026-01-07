// src/features/operations/inbound/manual/useInboundManualReceiveModel.ts

import { useEffect, useMemo, useState } from "react";
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

function computeQtyForLine(line: ReceiveTaskLine, raw: string): number | null {
  const scanned = line.scanned_qty ?? 0;
  const remaining =
    line.expected_qty != null ? (line.expected_qty ?? 0) - scanned : 0;

  // 空输入：默认“填剩余”
  if (raw.trim() === "") {
    return remaining > 0 ? remaining : null;
  }

  // 非空：必须是正整数
  return parsePositiveInt(raw);
}

export function useInboundManualReceiveModel(c: InboundCockpitController) {
  const task = c.currentTask;

  const [qtyInputs, setQtyInputs] = useState<QtyInputMap>({});
  const [error, setError] = useState<string | null>(null);

  const [savingItemId, setSavingItemId] = useState<number | null>(null);
  const [savingAll, setSavingAll] = useState<boolean>(false);

  const lines: ReceiveTaskLine[] = useMemo(() => (task ? task.lines : []), [task]);

  // ✅ 当任务切换时，清空本地输入，并同步清空 controller 草稿
  useEffect(() => {
    setQtyInputs({});
    setError(null);
    c.setManualDraft({ dirty: false, touchedLines: 0, totalQty: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task?.id]);

  const handleQtyChange = (itemId: number, value: string) => {
    setQtyInputs((prev) => ({ ...prev, [itemId]: value }));
  };

  // ✅ 草稿（只统计用户真实输入的行，用于 commit 前硬阻断）
  const draft = useMemo(() => {
    let touchedLines = 0;
    let totalQty = 0;

    for (const l of lines) {
      const raw = (qtyInputs[l.item_id] ?? "").trim();
      if (!raw) continue;

      const qty = parsePositiveInt(raw);
      if (qty != null && qty > 0) {
        touchedLines += 1;
        totalQty += qty;
      }
    }

    const dirty = Object.values(qtyInputs).some((v) => (v ?? "").trim() !== "");
    return { dirty, touchedLines, totalQty };
  }, [lines, qtyInputs]);

  // ✅ 上报草稿到 controller，让 commit 卡可见
  useEffect(() => {
    c.setManualDraft(draft);
  }, [c, draft]);

  // 批量记录预览：沿用“空输入默认剩余应收”的逻辑（用于效率）
  const prepared = useMemo(() => {
    const items: Array<{ line: ReceiveTaskLine; qty: number }> = [];

    for (const l of lines) {
      const raw = qtyInputs[l.item_id] ?? "";
      const qty = computeQtyForLine(l, raw);
      if (qty != null && qty > 0) items.push({ line: l, qty });
    }

    return items;
  }, [lines, qtyInputs]);

  const preview = useMemo(() => {
    let touchedLines = 0;
    let totalQty = 0;

    for (const it of prepared) {
      touchedLines += 1;
      totalQty += it.qty;
    }

    return { touchedLines, totalQty };
  }, [prepared]);

  const handleReceive = async (line: ReceiveTaskLine) => {
    setError(null);

    if (savingAll) {
      setError("正在批量记录中，请稍候…");
      return;
    }

    const raw = qtyInputs[line.item_id] ?? "";
    const qty = computeQtyForLine(line, raw);

    if (qty == null || qty <= 0) {
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

  const handleReceiveBatch = async () => {
    setError(null);

    if (!task) {
      setError("尚未绑定收货任务，无法批量记录。");
      return;
    }
    if (savingItemId != null || savingAll) return;

    if (prepared.length === 0) {
      setError("没有可记录的行：请先填写“本次”数量，或保持为空以默认填充剩余应收。");
      return;
    }

    setSavingAll(true);
    try {
      for (const it of prepared) {
        await c.manualReceiveLine(it.line.item_id, it.qty);

        setQtyInputs((prev) => {
          const next = { ...prev };
          delete next[it.line.item_id];
          return next;
        });
      }
    } catch (e: unknown) {
      const err = e as ApiErrorShape;
      setError(err?.message ?? "批量记录失败（已记录部分行）");
    } finally {
      setSavingAll(false);
    }
  };

  return {
    task,
    lines,

    qtyInputs,
    error,
    savingItemId,
    savingAll,

    preview,
    draft,

    handleQtyChange,
    handleReceive,
    handleReceiveBatch,
  };
}
