// src/features/operations/inbound/tabs/ReturnReceiveTab.tsx

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { InboundCockpitController } from "../types";
import { InboundTabShell } from "./InboundTabShell";
import { SupplementLink } from "../SupplementLink";

export const ReturnReceiveTab: React.FC<{ c: InboundCockpitController }> = ({
  c,
}) => {
  const navigate = useNavigate();
  const [returnTaskIdInput, setReturnTaskIdInput] = useState<string>("");

  const canGo = useMemo(() => {
    const n = Number(returnTaskIdInput);
    return Number.isFinite(n) && n > 0;
  }, [returnTaskIdInput]);

  const left = (
    <div className="space-y-4">
      <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
        <h2 className="text-sm font-semibold text-slate-800">退货收货（任务驱动）</h2>
        <div className="text-sm text-slate-700">
          本页只处理「退货任务」语义，不复用采购收货任务/采购单逻辑。
        </div>
        <div className="text-xs text-slate-500">
          批次/日期补录统一走「<SupplementLink source="return">收货补录</SupplementLink>」。
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-800">打开退货任务</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="flex flex-col gap-1">
            <label className="text-slate-600">退货任务号</label>
            <input
              className="border rounded-md px-2 py-1 text-xs"
              value={returnTaskIdInput}
              onChange={(e) => setReturnTaskIdInput(e.target.value)}
              placeholder="例如：123"
              inputMode="numeric"
            />
            <div className="text-[11px] text-slate-500">
              退货收货不进入采购收货驾驶舱流程，统一从退货任务进入。
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!canGo}
            className="rounded-md bg-slate-900 px-4 py-2 text-xs font-medium text-white disabled:opacity-60"
            onClick={() => navigate(`/return-tasks/${Number(returnTaskIdInput)}`)}
          >
            打开退货任务
          </button>

          <span className="text-[11px] text-slate-500">
            当前采购收货任务（如果有）：{c.currentTask ? `#${c.currentTask.id}` : "未绑定"}
          </span>
        </div>
      </section>
    </div>
  );

  const right = (
    <div className="space-y-4">
      <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
        <h2 className="text-sm font-semibold text-slate-800">快捷入口</h2>
        <div className="text-sm text-slate-700">
          需要补录批次/日期？直接去：
          <span className="ml-2">
            <SupplementLink source="return">收货补录</SupplementLink>
          </span>
        </div>
        <div className="text-xs text-slate-500">
          退货收货与采购收货语义不同：主对象是退货任务；数量口径是“计划/已处理/差异”。
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
        <h2 className="text-sm font-semibold text-slate-800">说明</h2>
        <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
          <li>主对象是退货任务（ReturnTask），不是采购单/收货任务。</li>
          <li>本 Tab 仅负责导航与语义边界，具体作业在退货任务页完成。</li>
          <li>批次/日期编辑只在「收货补录」页面出现。</li>
        </ul>
      </section>
    </div>
  );

  return <InboundTabShell left={left} right={right} />;
};
