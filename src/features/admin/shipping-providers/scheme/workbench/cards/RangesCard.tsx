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
import type { ModuleEditorState } from "../domain/types";

type Props = {
  disabled: boolean;
  moduleState: ModuleEditorState;
  onAddRange: () => void;
  onSaveRanges: () => void;
  onUpdateRangeField: (clientId: string, field: "minKg" | "maxKg", value: string) => void;
  onRemoveRange: (clientId: string) => void;
};

export const RangesCard: React.FC<Props> = ({
  disabled,
  moduleState,
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
          <div className={UI.panelHint}>先配置当前模块的重量段；保存后该模块原矩阵将被清空，需要重新录入。</div>
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
            onClick={onSaveRanges}
            disabled={disabled || moduleState.savingRanges}
          >
            {moduleState.savingRanges ? "保存中…" : "保存重量段"}
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {aliveRanges.map((r, idx) => (
          <div key={r.clientId} className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-5">
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
            <div className="md:col-span-2 flex items-end justify-end">
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

        {aliveRanges.length === 0 ? <div className={UI.emptyText}>当前模块尚未配置重量段。</div> : null}
      </div>
    </div>
  );
};

export default RangesCard;
