// src/features/operations/inbound/ReceiveSupplementPanel.tsx

import React, { useState } from "react";
import PageTitle from "../../../components/ui/PageTitle";
import { SupplementFilters } from "./supplement/SupplementFilters";
import { SupplementList } from "./supplement/SupplementList";
import { SupplementEditor } from "./supplement/SupplementEditor";
import type { ReceiveSupplementLine, SupplementSourceType, ViewStatus } from "./supplement/types";
import { useReceiveSupplements } from "./supplement/useReceiveSupplements";
import { patchReceiveTaskLineMeta } from "./supplement/api";

export type { SupplementSourceType } from "./supplement/types";

function normalizeSaveError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err ?? "");
  const msg = raw || "保存失败";

  // 后端明确的错误文案：任务已入库不能改
  if (msg.includes("任务已入库") || msg.includes("COMMITTED")) {
    return "该收货任务已入库，不能再修改批次/日期。";
  }
  if (msg.includes("ReceiveTask not found")) {
    return "收货任务不存在（可能已被删除或无权限）。";
  }
  if (msg.includes("ReceiveTaskLine not found")) {
    return "收货任务行不存在（可能已被删除或数据已变化）。";
  }
  if (msg.includes("mode must be hard or soft")) {
    return "补录清单模式参数不合法（hard/soft）。";
  }

  return msg;
}

export const ReceiveSupplementPanel: React.FC<{
  initialSourceType?: SupplementSourceType;
  showTitle?: boolean;
  compact?: boolean;
}> = ({ initialSourceType = "PURCHASE", showTitle = true, compact = false }) => {
  const [sourceType, setSourceType] = useState<SupplementSourceType>(initialSourceType);
  const [status, setStatus] = useState<ViewStatus>("MISSING");
  const [keyword, setKeyword] = useState<string>("");

  const { loading, loadErr, items, reload } = useReceiveSupplements({
    sourceType,
    status,
    keyword,
    warehouseId: 1,
  });

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selected, setSelected] = useState<ReceiveSupplementLine | null>(null);

  const [editBatch, setEditBatch] = useState<string>("");
  const [editProd, setEditProd] = useState<string>("");
  const [editExp, setEditExp] = useState<string>("");

  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const wrapCls = compact ? "space-y-4" : "p-6 space-y-6";

  function onSelect(key: string, row: ReceiveSupplementLine) {
    setSelectedKey(key);
    setSelected(row);

    setEditBatch(row.batch_code ?? "");
    setEditProd(row.production_date ?? "");
    setEditExp(row.expiry_date ?? "");

    setSaveMsg(null);
    setSaveErr(null);
  }

  async function handleSave() {
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
      // 后端返回 ReceiveTaskOut（前端 ReceiveTask），我们接住但这里不强依赖它刷新 UI
      await patchReceiveTaskLineMeta({
        taskId: selected.task_id,
        itemId: selected.item_id,
        batch_code: b || null,
        production_date: p || null,
        expiry_date: e || null,
      });

      setSaveMsg("已保存。");
      await reload();

      // 保存后：如果该行已不再阻断，会从列表中消失；清空选中态更清晰
      setSelectedKey(null);
      setSelected(null);
    } catch (e: unknown) {
      setSaveErr(normalizeSaveError(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveAndNext() {
    await handleSave();
    // 未来：可实现自动选中下一条；当前先不做，避免语义混乱
  }

  return (
    <div className={wrapCls}>
      {showTitle ? (
        <PageTitle title="收货补录" description="集中补齐批次 / 生产日期 / 到期日期（独立工作站）。" />
      ) : null}

      <SupplementFilters
        sourceType={sourceType}
        status={status}
        keyword={keyword}
        loading={loading}
        loadErr={loadErr}
        count={items.length}
        onChangeSourceType={(v) => {
          setSourceType(v);
          setSelectedKey(null);
          setSelected(null);
          setSaveMsg(null);
          setSaveErr(null);
        }}
        onChangeStatus={(v) => {
          setStatus(v);
          setSelectedKey(null);
          setSelected(null);
          setSaveMsg(null);
          setSaveErr(null);
        }}
        onChangeKeyword={setKeyword}
      />

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-6 items-start">
        <SupplementList items={items} selectedKey={selectedKey} onSelect={onSelect} />

        <div className={saving ? "pointer-events-none opacity-70" : ""}>
          <SupplementEditor
            selected={selected}
            editBatch={editBatch}
            editProd={editProd}
            editExp={editExp}
            saveMsg={saveMsg}
            saveErr={saveErr}
            onChangeBatch={setEditBatch}
            onChangeProd={setEditProd}
            onChangeExp={setEditExp}
            onSave={() => void handleSave()}
            onSaveAndNext={() => void handleSaveAndNext()}
          />
          {saving ? (
            <div className="mt-2 text-xs text-slate-500">保存中…</div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
