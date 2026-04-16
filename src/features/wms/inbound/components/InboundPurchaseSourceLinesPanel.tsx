// src/features/wms/inbound/components/InboundPurchaseSourceLinesPanel.tsx

import React from "react";
import type { PurchaseOrderCompletionLoadedLine } from "../api/inboundWorkbenchApi";

const sectionCls = "rounded-xl border border-slate-200 bg-slate-50 p-4";

export interface InboundPurchaseSourceLinesPanelProps {
  sourceRef: string | null;
  lines: PurchaseOrderCompletionLoadedLine[];
  loading: boolean;
  error: string | null;
}

export const InboundPurchaseSourceLinesPanel: React.FC<
  InboundPurchaseSourceLinesPanelProps
> = ({
  sourceRef,
  lines,
  loading,
  error,
}) => {
  return (
    <section className={sectionCls}>
      <div className="space-y-1">
        <div className="text-sm font-semibold text-slate-900">采购来源行</div>
        <div className="text-sm text-slate-500">
          这里展示当前选中采购单的待收入库行；下方商品识别区与行编辑区只是承接这些行形成 WMS 入库草稿。
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-600">
        当前采购单：{sourceRef ?? "未选择"}
      </div>

      {error ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-4 space-y-3">
        {loading ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-600">
            正在加载采购来源行…
          </div>
        ) : !sourceRef ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-600">
            请先选择采购单号。
          </div>
        ) : lines.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-600">
            当前采购单没有可入库剩余行。
          </div>
        ) : (
          lines.map((line) => (
            <section
              key={line.poLineId}
              className="rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-700"
            >
              <div className="font-medium text-slate-900">
                第 {line.lineNo} 行 · po_line_id：{line.poLineId}
              </div>
              <div className="mt-1 text-slate-600">
                商品：{line.itemName ?? "暂无"} / SKU：{line.itemSku ?? "暂无"}
              </div>
              <div className="mt-1 text-slate-600">
                单位：{line.uomName ?? "暂无"}（uom_id：{line.uomId}）
              </div>
              <div className="mt-1 text-slate-500">
                剩余待收：{line.qtyRemainingInput || "待人工换算"} / base：{line.qtyRemainingBase}
              </div>
              <div className="mt-1 text-slate-500">
                状态：{line.lineCompletionStatus}
                {line.lastReceivedAt ? ` · 最近收货：${line.lastReceivedAt}` : ""}
              </div>
            </section>
          ))
        )}
      </div>
    </section>
  );
};

export default InboundPurchaseSourceLinesPanel;
