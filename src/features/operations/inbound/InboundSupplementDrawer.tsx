// src/features/operations/inbound/InboundSupplementDrawer.tsx
// 收货补录抽屉（嵌入 /inbound）
// 说明：只做展示与关闭，不接业务

import React from "react";
import { ReceiveSupplementPanel, type SupplementSourceType } from "./ReceiveSupplementPanel";

export const InboundSupplementDrawer: React.FC<{
  open: boolean;
  initialSourceType: SupplementSourceType;
  taskId?: number | null; // ✅ 本次任务口径（可选）
  onClose: () => void;
}> = ({ open, initialSourceType, taskId, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-label="关闭补录抽屉"
      />

      {/* panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-[980px] bg-slate-50 shadow-xl border-l border-slate-200 overflow-auto">
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-800">收货补录</div>
            <div className="text-[11px] text-slate-500">
              仅在此处编辑批次 / 生产日期 / 到期日期
              {taskId ? <span className="ml-2">（本次任务 #{taskId}）</span> : null}
            </div>
          </div>

          <button
            type="button"
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
            onClick={onClose}
          >
            关闭
          </button>
        </div>

        <div className="p-4">
          <ReceiveSupplementPanel
            initialSourceType={initialSourceType}
            taskId={taskId ?? null}
            showTitle={false}
            compact={true}
          />
        </div>
      </div>
    </div>
  );
};
