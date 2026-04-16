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
  qtyInput: string;
  lotCodeInput: string;
  productionDate: string;
  expiryDate: string;
};

export interface InboundLinesEditorProps {
  lines: InboundEditableLine[];
  onQtyInputChange: (localId: string, value: string) => void;
  onLotCodeInputChange: (localId: string, value: string) => void;
  onProductionDateChange: (localId: string, value: string) => void;
  onExpiryDateChange: (localId: string, value: string) => void;
  onAddLine: () => void;
  onRemoveLine: (localId: string) => void;
}

export const InboundLinesEditor: React.FC<InboundLinesEditorProps> = ({
  lines,
  onQtyInputChange,
  onLotCodeInputChange,
  onProductionDateChange,
  onExpiryDateChange,
  onAddLine,
  onRemoveLine,
}) => {
  return (
    <section className={sectionCls}>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-slate-900">行编辑区</div>
          <div className="text-sm text-slate-500">
            当前这一步只把数量、批次与日期编辑推进到真正的多行渲染。
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" className={btnCls} onClick={onAddLine}>
            新增一行
          </button>
        </div>
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

              <button
                type="button"
                className={btnCls}
                onClick={() => onRemoveLine(line.localId)}
                disabled={lines.length <= 1}
              >
                删除此行
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
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
            </div>
          </section>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-600">
        当前只推进多行草稿编辑；商品识别区仍然只绑定第一行，下一步再继续收口。
      </div>
    </section>
  );
};

export default InboundLinesEditor;
