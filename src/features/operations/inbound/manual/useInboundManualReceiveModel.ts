// src/features/operations/inbound/manual/useInboundManualReceiveModel.ts

import { useEffect, useMemo, useState } from "react";
import type { InboundCockpitController } from "../types";
import type { ReceiveTaskLine } from "../../../receive-tasks/api";

import { fetchReceiveSupplements } from "../supplement/api";
import type { ReceiveSupplementLine } from "../supplement/types";

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

function computeQtyForLine(raw: string): number | null {
  // ✅ 空输入：不记录
  if (raw.trim() === "") return null;
  return parsePositiveInt(raw);
}

type MissingByItemId = Record<number, string[]>;

function buildMissingByItemId(rows: ReceiveSupplementLine[]): MissingByItemId {
  const m: MissingByItemId = {};
  for (const r of rows) {
    const itemId = Number(r.item_id);
    if (!Number.isFinite(itemId) || itemId <= 0) continue;
    const fields = Array.isArray(r.missing_fields) ? r.missing_fields : [];
    m[itemId] = fields;
  }
  return m;
}

export function useInboundManualReceiveModel(c: InboundCockpitController) {
  const task = c.currentTask;

  const [qtyInputs, setQtyInputs] = useState<QtyInputMap>({});
  const [error, setError] = useState<string | null>(null);

  const [savingItemId, setSavingItemId] = useState<number | null>(null);
  const [savingAll, setSavingAll] = useState<boolean>(false);

  const lines: ReceiveTaskLine[] = useMemo(() => (task ? task.lines : []), [task]);

  // ===== 补录提示（以“商品主数据口径”的后端 supplements 为准） =====
  const [suppLoading, setSuppLoading] = useState(false);
  const [suppErr, setSuppErr] = useState<string | null>(null);
  const [hardMissingByItemId, setHardMissingByItemId] = useState<MissingByItemId>({});
  const [softMissingByItemId, setSoftMissingByItemId] = useState<MissingByItemId>({});

  const taskId = task?.id ?? null;

  async function reloadSupplements() {
    if (!taskId) {
      setHardMissingByItemId({});
      setSoftMissingByItemId({});
      return;
    }

    setSuppLoading(true);
    setSuppErr(null);
    try {
      const [hardRows, softRows] = await Promise.all([
        fetchReceiveSupplements({
          sourceType: "PURCHASE",
          warehouseId: task?.warehouse_id ?? 1,
          taskId,
          mode: "hard",
          limit: 500,
        }),
        fetchReceiveSupplements({
          sourceType: "PURCHASE",
          warehouseId: task?.warehouse_id ?? 1,
          taskId,
          mode: "soft",
          limit: 500,
        }),
      ]);

      setHardMissingByItemId(buildMissingByItemId(hardRows));
      setSoftMissingByItemId(buildMissingByItemId(softRows));
    } catch (e: unknown) {
      setHardMissingByItemId({});
      setSoftMissingByItemId({});
      const msg = e instanceof Error ? e.message : "加载补录提示失败";
      setSuppErr(msg);
    } finally {
      setSuppLoading(false);
    }
  }

  useEffect(() => {
    setQtyInputs({});
    setError(null);
    c.setManualDraft({ dirty: false, touchedLines: 0, totalQty: 0 });

    setHardMissingByItemId({});
    setSoftMissingByItemId({});
    setSuppErr(null);
    setSuppLoading(false);

    void reloadSupplements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task?.id]);

  const handleQtyChange = (itemId: number, value: string) => {
    setQtyInputs((prev) => ({ ...prev, [itemId]: value }));
  };

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

  useEffect(() => {
    c.setManualDraft(draft);
  }, [c, draft]);

  const prepared = useMemo(() => {
    const items: Array<{ line: ReceiveTaskLine; qty: number }> = [];
    for (const l of lines) {
      const raw = qtyInputs[l.item_id] ?? "";
      const qty = computeQtyForLine(raw);
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
    const qty = computeQtyForLine(raw);

    if (qty == null || qty <= 0) {
      setError(`「${safeName(line)}」的本次收货数量必须为正整数（空输入不会记录）。`);
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

      // ✅ 数量事实更新后，同步刷新补录提示（避免“刚记录却不提示/提示不消失”）
      await reloadSupplements();
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
      setError("没有可记录的行：请先在“本次”列填写数量后再批量记录。");
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

      await reloadSupplements();
    } catch (e: unknown) {
      const err = e as ApiErrorShape;
      setError(err?.message ?? "批量记录失败（已记录部分行）");
    } finally {
      setSavingAll(false);
    }
  };

  const supplementCounts = useMemo(() => {
    const hardCount = Object.keys(hardMissingByItemId).length;
    const softCount = Object.keys(softMissingByItemId).length;
    return { hardCount, softCount };
  }, [hardMissingByItemId, softMissingByItemId]);

  return {
    task,
    taskId,
    lines,

    qtyInputs,
    error,
    savingItemId,
    savingAll,

    preview,
    draft,

    // ✅ supplements（主数据口径）
    suppLoading,
    suppErr,
    hardMissingByItemId,
    softMissingByItemId,
    supplementCounts,
    reloadSupplements,

    handleQtyChange,
    handleReceive,
    handleReceiveBatch,
  };
}
