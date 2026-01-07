// src/features/operations/inbound/ReceiveSupplementPanel.tsx

import React, { useState } from "react";
import PageTitle from "../../../components/ui/PageTitle";
import { SupplementFilters } from "./supplement/SupplementFilters";
import { SupplementList } from "./supplement/SupplementList";
import { SupplementEditor } from "./supplement/SupplementEditor";
import type { ReceiveSupplementLine, SupplementSourceType, ViewStatus } from "./supplement/types";
import { useReceiveSupplements } from "./supplement/useReceiveSupplements";

import { useSupplementSelection } from "./supplement/panel/useSupplementSelection";
import { useItemShelfLifePolicy } from "./supplement/panel/useItemShelfLifePolicy";
import { useSupplementActions } from "./supplement/panel/useSupplementActions";

export type { SupplementSourceType } from "./supplement/types";

export const ReceiveSupplementPanel: React.FC<{
  initialSourceType?: SupplementSourceType;
  taskId?: number | null; // ✅ 作业入口：仅显示本次任务相关
  showTitle?: boolean;
  compact?: boolean;
}> = ({ initialSourceType = "PURCHASE", taskId = null, showTitle = true, compact = false }) => {
  const [sourceType, setSourceType] = useState<SupplementSourceType>(initialSourceType);
  const [status, setStatus] = useState<ViewStatus>("MISSING");
  const [keyword, setKeyword] = useState<string>("");

  const { loading, loadErr, items, reload } = useReceiveSupplements({
    sourceType,
    status,
    keyword,
    warehouseId: 1,
    taskId,
  });

  const sel = useSupplementSelection();

  // ✅ 商品主数据：只读加载（不提供写入口）
  const policy = useItemShelfLifePolicy(sel.selected?.item_id ?? null);

  // ✅ 推算逻辑仍可用：仅依赖只读 policy 值
  const actions = useSupplementActions({
    selected: sel.selected,
    editBatch: sel.editBatch,
    editProd: sel.editProd,
    editExp: sel.editExp,

    hasShelfLife: policy.hasShelfLife,
    shelfValue: policy.shelfValue,
    shelfUnit: policy.shelfUnit,

    setSaving: sel.setSaving,
    setSaveMsg: sel.setSaveMsg,
    setSaveErr: sel.setSaveErr,
    clearSelection: sel.clearSelection,

    viewStatus: status,
    reload,
    setEditExp: sel.setEditExp,
  });

  const wrapCls = compact ? "space-y-4" : "p-6 space-y-6";

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
        taskId={taskId}
        onChangeSourceType={(v) => {
          setSourceType(v);
          sel.clearSelection();
          sel.clearMessages();
        }}
        onChangeStatus={(v) => {
          setStatus(v);
          sel.clearSelection();
          sel.clearMessages();
        }}
        onChangeKeyword={setKeyword}
      />

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-6 items-start">
        <SupplementList
          items={items}
          selectedKey={sel.selectedKey}
          onSelect={(key: string, row: ReceiveSupplementLine) => sel.onSelect(key, row)}
        />

        <div className={sel.saving ? "pointer-events-none opacity-70" : ""}>
          <SupplementEditor
            selected={sel.selected}
            editBatch={sel.editBatch}
            editProd={sel.editProd}
            editExp={sel.editExp}
            saveMsg={sel.saveMsg}
            saveErr={sel.saveErr}
            onChangeBatch={sel.setEditBatch}
            onChangeProd={sel.setEditProd}
            onChangeExp={sel.setEditExp}
            onSave={() => void actions.saveMeta()}
            onSaveAndNext={() => void actions.saveAndNext()}
            policyLoading={policy.policyLoading}
            policyErr={policy.policyErr}
            hasShelfLife={policy.hasShelfLife}
            shelfValue={policy.shelfValue}
            shelfUnit={policy.shelfUnit}
            onCalcExpiryFromProd={actions.calcExpiryFromProd}
          />
          {sel.saving ? <div className="mt-2 text-xs text-slate-500">保存中…</div> : null}
        </div>
      </div>
    </div>
  );
};
