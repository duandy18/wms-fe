// src/features/operations/inbound/supplement/panel/useSupplementActions.ts

import type { ShelfLifeUnit } from "../dateUtils";
import { addShelfLife } from "../dateUtils";
import { patchReceiveTaskLineMeta } from "../api";
import { normalizeSaveError } from "./normalizeSaveError";
import type { ReceiveSupplementLine, ViewStatus } from "../types";

function emitInboundSupplementUpdated(detail: { remainingHard: number }) {
  try {
    window.dispatchEvent(
      new CustomEvent("inbound:supplement-updated", {
        detail,
      }),
    );
  } catch {
    // ignore
  }
}

export function useSupplementActions(args: {
  selected: ReceiveSupplementLine | null;
  editBatch: string;
  editProd: string;
  editExp: string;

  hasShelfLife: boolean;
  shelfValue: string;
  shelfUnit: ShelfLifeUnit;

  setSaving: (v: boolean) => void;
  setSaveMsg: (v: string | null) => void;
  setSaveErr: (v: string | null) => void;
  clearSelection: () => void;

  viewStatus: ViewStatus;
  reload: () => Promise<ReceiveSupplementLine[]>;
  setEditExp: (v: string) => void;
}) {
  const {
    selected,
    editBatch,
    editProd,
    editExp,

    hasShelfLife,
    shelfValue,
    shelfUnit,

    setSaving,
    setSaveMsg,
    setSaveErr,
    clearSelection,

    viewStatus,
    reload,
    setEditExp,
  } = args;

  async function saveMeta() {
    setSaveMsg(null);
    setSaveErr(null);

    if (!selected) {
      setSaveErr("未选择任何待补录行。");
      return;
    }

    const b = editBatch.trim();
    const p = editProd.trim();
    const e = editExp.trim();

    if (!b && !p && !e) {
      setSaveErr("请至少填写一项（批次/生产日期/到期日期）。");
      return;
    }

    setSaving(true);
    try {
      await patchReceiveTaskLineMeta({
        taskId: selected.task_id,
        itemId: selected.item_id,
        batch_code: b || null,
        production_date: p || null,
        expiry_date: e || null,
      });

      setSaveMsg("已保存。");
      const rows = await reload();
      clearSelection();

      // 只对“硬阻断清单（MISSING=hard）”回流入库页状态：
      // - remainingHard=0 => 入库页应显示“补录完成”
      // - remainingHard>0 => 入库页应显示“仍有X行需补录”
      if (viewStatus === "MISSING") {
        emitInboundSupplementUpdated({ remainingHard: rows.length });
      }
    } catch (err: unknown) {
      setSaveErr(normalizeSaveError(err));
    } finally {
      setSaving(false);
    }
  }

  async function saveAndNext() {
    await saveMeta();
    // 未来：自动下一条
  }

  function calcExpiryFromProd() {
    setSaveMsg(null);
    setSaveErr(null);

    if (!selected) return;

    if (!hasShelfLife) {
      setSaveErr("该商品未启用保质期管理，无法按保质期推算到期日期。");
      return;
    }

    const prod = editProd.trim();
    const v = shelfValue.trim();
    const n = Number(v);

    if (!prod) {
      setSaveErr("请先填写生产日期。");
      return;
    }
    if (!v || !Number.isFinite(n) || n <= 0) {
      setSaveErr("请先填写有效的保质期数值。");
      return;
    }

    const exp = addShelfLife(prod, Math.floor(n), shelfUnit);
    if (!exp) {
      setSaveErr("推算失败：请检查生产日期格式。");
      return;
    }

    setEditExp(exp);
    setSaveMsg(`已推算到期日期：${exp}（请点击“保存”写入收货行）`);
  }

  return { saveMeta, saveAndNext, calcExpiryFromProd };
}
