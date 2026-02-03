// src/features/operations/outbound-pick/PickTaskCommitPanel.tsx
//
// 提交出库 Panel（内容模块）：
// - 显示平台/店铺
// - allow_diff 开关
// - 最后扫码确认：必须输入/扫码 订单确认码（WMS）才允许 commit（防误操作）
//
// 说明：
// - 确认码：WMS:ORDER:v1:{platform}:{shop_id}:{ext_order_no}
// - 后端会强制校验 handoff_code 与 task.ref(ORD:...) 一致

import React, { useMemo, useState } from "react";
import type { PickTask } from "./pickTasksApi";
import { buildWmsOrderConfirmCodeFromTaskRef } from "./pickTasksCockpitUtils";

type Props = {
  task: PickTask | null;
  allowDiff: boolean;
  onChangeAllowDiff: (v: boolean) => void;
  committing: boolean;
  commitError: string | null;
  platform: string;
  shopId: string;
  onCommit: (handoffCode: string) => void;
};

export const PickTaskCommitPanel: React.FC<Props> = ({
  task,
  allowDiff,
  onChangeAllowDiff,
  committing,
  commitError,
  platform,
  shopId,
  onCommit,
}) => {
  const [handoffCode, setHandoffCode] = useState("");

  const expected = useMemo(() => {
    if (!task) return "";
    const wms = buildWmsOrderConfirmCodeFromTaskRef(task.ref ?? null);
    return wms ?? `PICKTASK:${task.id}`;
  }, [task]);

  const okToCommit = useMemo(() => {
    if (!task) return false;
    const v = handoffCode.trim();
    if (!v) return false;
    return v === expected;
  }, [handoffCode, expected, task]);

  if (!task) {
    return <div className="text-xs text-slate-500">请先选择一条拣货任务。</div>;
  }

  return (
    <div className="space-y-3">
      <div className="text-[11px] text-slate-600 space-y-1">
        <div>
          platform:
          <span className="font-mono ml-1">{platform}</span> · shop:
          <span className="font-mono ml-1">{shopId}</span>
        </div>

        <div>
          allow_diff:
          <label className="inline-flex items-center ml-1 gap-1">
            <input
              type="checkbox"
              checked={allowDiff}
              onChange={(e) => onChangeAllowDiff(e.target.checked)}
            />
            <span className="text-[11px] text-slate-600">
              允许存在差异时仍然 commit（谨慎勾选）
            </span>
          </label>
        </div>
      </div>

      {/* 最后扫码确认 */}
      <div className="space-y-1">
        <div className="text-[11px] text-slate-600">订单确认码（WMS / 扫码枪输入）</div>
        <input
          value={handoffCode}
          onChange={(e) => setHandoffCode(e.target.value)}
          placeholder={`请扫码：${expected}`}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs outline-none focus:ring-2 focus:ring-slate-300"
        />
        <div className="text-[11px] text-slate-500">
          必须扫入 <span className="font-mono">{expected}</span> 才允许提交（防误操作）。
        </div>
      </div>

      <button
        type="button"
        disabled={committing || !okToCommit}
        onClick={() => onCommit(handoffCode)}
        className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white disabled:opacity-60"
      >
        {committing ? "提交中…" : "扫码确认并出库（commit）"}
      </button>

      {commitError && <div className="text-[11px] text-red-600 mt-1">{commitError}</div>}
    </div>
  );
};
