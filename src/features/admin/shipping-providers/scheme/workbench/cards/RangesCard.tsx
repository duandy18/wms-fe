// src/features/admin/shipping-providers/scheme/workbench/cards/RangesCard.tsx
//
// 分拆说明：
// - 从 PricingWorkbenchPanel.tsx 中拆出。
// - 当前只负责“重量段配置”卡片 UI。
// - 当前不负责：
//   1) ranges 状态来源
//   2) ranges 保存实现
//   3) matrix 清空后的后续联动逻辑
// - 协作关系：
//   - 父层由 ../PricingWorkbenchPanel 传入 moduleState 与动作回调
//   - 真实保存逻辑位于 ../usePricingWorkbench
// - 维护约束：
//   - 本文件保持为卡片展示层，不承载 hook、API、mapper 逻辑。

import React from "react";
import { UI } from "../../ui";
import SuccessBar from "../SuccessBar";
import type { ModuleEditorState, PricingMode } from "../domain/types";

type Props = {
  disabled: boolean;
  moduleState: ModuleEditorState;
  errorMessage: string | null;
  successMessage: string | null;
  onAddRange: () => void;
  onSaveRanges: () => Promise<boolean>;
  onUpdateRangeField: (
    clientId: string,
    field: "minKg" | "maxKg" | "defaultPricingMode",
    value: string,
  ) => void;
  onRemoveRange: (clientId: string) => void;
};

const PRICING_MODE_OPTIONS: Array<{ value: PricingMode; label: string }> = [
  { value: "flat", label: "固定价格" },
  { value: "step_over", label: "首重+续重每公斤" },
  { value: "linear_total", label: "面单费+总重每公斤" },
  { value: "manual_quote", label: "人工报价" },
];

export const RangesCard: React.FC<Props> = ({
  disabled,
  moduleState,
  errorMessage,
  successMessage,
  onAddRange,
  onSaveRanges,
  onUpdateRangeField,
  onRemoveRange,
}) => {
  const aliveRanges = moduleState.ranges.filter((r) => !r.isDeleted);

  return (
    <div className={UI.cardTight}>
      <div className={UI.headerRow}>
        <div>
          <div className={UI.panelTitle}>1）重量段配置</div>
          <div className={UI.panelHint}>
            先配置重量段和默认收费模式；保存后价格矩阵会清空，需要重新录入。
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={UI.btnNeutralSm}
            onClick={onAddRange}
            disabled={disabled || moduleState.savingRanges}
          >
            新增重量段
          </button>
          <button
            type="button"
            className={UI.btnPrimaryGreen}
            onClick={() => void onSaveRanges()}
            disabled={disabled || moduleState.savingRanges}
          >
            {moduleState.savingRanges ? "保存中…" : "保存重量段"}
          </button>
        </div>
      </div>

      <div className="mt-3">
        <SuccessBar msg={successMessage} onClose={() => undefined} />
      </div>

      {errorMessage ? (
        <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">
          {errorMessage}
        </div>
      ) : null}

      <div className="mt-4 space-y-3">
        {aliveRanges.map((r, idx) => (
          <div
            key={r.clientId}
            className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-6"
          >
            <div>
              <div className={UI.tinyHelpText}>序号</div>
              <div className="mt-2 text-sm font-semibold text-slate-700">{idx + 1}</div>
            </div>

            <div>
              <label className={UI.tinyHelpText}>最小重量（kg）</label>
              <input
                className={UI.inputBase}
                value={r.minKg}
                disabled={disabled || moduleState.savingRanges}
                onChange={(e) => onUpdateRangeField(r.clientId, "minKg", e.target.value)}
              />
            </div>

            <div>
              <label className={UI.tinyHelpText}>最大重量（kg，空=无上限）</label>
              <input
                className={UI.inputBase}
                value={r.maxKg}
                disabled={disabled || moduleState.savingRanges}
                onChange={(e) => onUpdateRangeField(r.clientId, "maxKg", e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className={UI.tinyHelpText}>默认收费模式</label>
              <select
                className={UI.inputBase}
                value={r.defaultPricingMode}
                disabled={disabled || moduleState.savingRanges}
                onChange={(e) => onUpdateRangeField(r.clientId, "defaultPricingMode", e.target.value)}
              >
                {PRICING_MODE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end justify-end">
              <button
                type="button"
                className={UI.btnDangerSm}
                onClick={() => onRemoveRange(r.clientId)}
                disabled={disabled || moduleState.savingRanges}
              >
                删除
              </button>
            </div>
          </div>
        ))}

        {aliveRanges.length === 0 ? <div className={UI.emptyText}>当前尚未配置重量段。</div> : null}
      </div>
    </div>
  );
};

export default RangesCard;
