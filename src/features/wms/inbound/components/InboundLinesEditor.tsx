// src/features/wms/inbound/components/InboundLinesEditor.tsx

import React from "react";

const sectionCls = "rounded-xl border border-slate-200 bg-slate-50 p-4";
const labelCls = "text-xs text-slate-500";
const valueCls = "mt-1 text-sm text-slate-900";
const inputCls =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400";
const btnCls =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50";

export type InboundEditableLine = {
  localId: string;

  poLineId: number | null;
  sourceLineNo: number | null;
  sourceItemName: string | null;
  sourceItemSku: string | null;
  sourceUomName: string | null;
  sourceQtyRemainingInput: string;
  sourceQtyRemainingBase: number | null;
  sourceLineCompletionStatus: string | null;

  qtyInput: string;
  lotCodeInput: string;
  productionDate: string;
  expiryDate: string;
  remark: string;
};

export interface InboundLinesEditorProps {
  isPurchaseMode: boolean;
  lines: InboundEditableLine[];
  onQtyInputChange: (localId: string, value: string) => void;
  onLotCodeInputChange: (localId: string, value: string) => void;
  onProductionDateChange: (localId: string, value: string) => void;
  onExpiryDateChange: (localId: string, value: string) => void;
  onRemarkChange: (localId: string, value: string) => void;
  onAddLine: () => void;
  onRemoveLine: (localId: string) => void;
}

export const InboundLinesEditor: React.FC<InboundLinesEditorProps> = ({
  isPurchaseMode,
  lines,
  onQtyInputChange,
  onLotCodeInputChange,
  onProductionDateChange,
  onExpiryDateChange,
  onRemarkChange,
  onAddLine,
  onRemoveLine,
}) => {
  return (
    <section className={sectionCls}>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-slate-900">行编辑区</div>
          <div className="text-sm text-slate-500">
            {isPurchaseMode
              ? "采购模式下，这里真正承接采购来源行并形成 WMS 执行区；只允许编辑执行字段。"
              : "当前这一步继续承接手工识别结果，并编辑 WMS 执行字段。"}
          </div>
        </div>

        {!isPurchaseMode ? (
          <div className="flex items-center gap-2">
            <button type="button" className={btnCls} onClick={onAddLine}>
              新增一行
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-4">
        <div className={labelCls}>当前草稿行数</div>
        <div className={valueCls}>{lines.length}</div>
      </div>

      <div className="mt-4 space-y-4">
        {lines.map((line, index) => (
          <section
            key={line.localId}
            className="rounded-lg border border-slate-300 bg-white p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-medium text-slate-900">
                第 {index + 1} 行
              </div>

              {!isPurchaseMode ? (
                <button
                  type="button"
                  className={btnCls}
                  onClick={() => onRemoveLine(line.localId)}
                  disabled={lines.length <= 1}
                >
                  删除此行
                </button>
              ) : null}
            </div>

            {isPurchaseMode ? (
              <section className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs font-medium text-slate-700">
                  采购来源摘要
                </div>
                <div className="mt-2 text-sm text-slate-700">
                  来源行：第 {line.sourceLineNo ?? "-"} 行 · po_line_id：
                  {line.poLineId ?? "-"}
                </div>
                <div className="mt-1 text-sm text-slate-700">
                  商品：{line.sourceItemName ?? "暂无"} / SKU：
                  {line.sourceItemSku ?? "暂无"}
                </div>
                <div className="mt-1 text-sm text-slate-700">
                  单位：{line.sourceUomName ?? "暂无"}
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  待收数量：
                  {line.sourceQtyRemainingInput || "待人工换算"}
                  {line.sourceQtyRemainingBase != null
                    ? ` / base：${line.sourceQtyRemainingBase}`
                    : ""}
                </div>
                <div className="mt-1 text-sm text-slate-500">
                  completion 状态：
                  {line.sourceLineCompletionStatus ?? "暂无"}
                </div>
              </section>
            ) : null}

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
              <label>
                <div className={labelCls}>qty_input</div>
                <input
                  className={inputCls}
                  inputMode="numeric"
                  placeholder="例如 10"
                  value={line.qtyInput}
                  onChange={(e) => onQtyInputChange(line.localId, e.target.value)}
                />
              </label>

              <label>
                <div className={labelCls}>lot_code_input</div>
                <input
                  className={inputCls}
                  placeholder="批次号"
                  value={line.lotCodeInput}
                  onChange={(e) =>
                    onLotCodeInputChange(line.localId, e.target.value)
                  }
                />
              </label>

              <label>
                <div className={labelCls}>production_date</div>
                <input
                  className={inputCls}
                  type="date"
                  value={line.productionDate}
                  onChange={(e) =>
                    onProductionDateChange(line.localId, e.target.value)
                  }
                />
              </label>

              <label>
                <div className={labelCls}>expiry_date</div>
                <input
                  className={inputCls}
                  type="date"
                  value={line.expiryDate}
                  onChange={(e) =>
                    onExpiryDateChange(line.localId, e.target.value)
                  }
                />
              </label>

              <label>
                <div className={labelCls}>remark</div>
                <input
                  className={inputCls}
                  placeholder="行备注"
                  value={line.remark}
                  onChange={(e) => onRemarkChange(line.localId, e.target.value)}
                />
              </label>
            </div>
          </section>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-600">
        {isPurchaseMode
          ? "采购模式下：商品、单位、po_line_id 来自采购来源行；本区只编辑 WMS 执行字段。"
          : "非采购模式下：仍允许继续新增/删除行，并通过商品识别区补齐 item / uom。"}
      </div>
    </section>
  );
};

export default InboundLinesEditor;
