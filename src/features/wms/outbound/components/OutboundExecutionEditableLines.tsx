import React from "react";

export interface OutboundExecutionEditableLine {
  key: number;
  refLabel: string;
  itemId: number;
  plannedQty: number;
  barcodeValue: string;
  qtyValue: string;
  hint: string;
}

type Props = {
  refLabelName: string;
  lines: OutboundExecutionEditableLine[];
  emptyText: string;
  onChangeBarcode: (key: number, value: string) => void;
  onResolveBarcode: (key: number) => void;
  onChangeQty: (key: number, value: string) => void;
};

const OutboundExecutionEditableLines: React.FC<Props> = ({
  refLabelName,
  lines,
  emptyText,
  onChangeBarcode,
  onResolveBarcode,
  onChangeQty,
}) => {
  if (lines.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {lines.map((line) => (
        <div
          key={line.key}
          className="rounded-xl border border-slate-200 bg-slate-50 p-4"
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <div className="text-xs text-slate-500">{refLabelName}</div>
              <div className="text-sm font-mono text-slate-900">
                {line.refLabel}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500">item_id</div>
              <div className="text-sm font-mono text-slate-900">
                {line.itemId}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500">需求/申请数量</div>
              <div className="text-sm font-mono text-slate-900">
                {line.plannedQty}
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_140px]">
            <div>
              <div className="mb-1 text-xs text-slate-500">扫码条码</div>
              <div className="flex gap-2">
                <input
                  className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
                  value={line.barcodeValue}
                  onChange={(e) => onChangeBarcode(line.key, e.target.value)}
                  placeholder="请输入或扫码条码"
                />
                <button
                  type="button"
                  className="rounded-md border border-slate-300 px-3 py-2 text-xs hover:bg-white"
                  onClick={() => onResolveBarcode(line.key)}
                >
                  识别
                </button>
              </div>
            </div>

            <div>
              <div className="mb-1 text-xs text-slate-500">本次出库</div>
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-right text-sm"
                value={line.qtyValue}
                onChange={(e) => onChangeQty(line.key, e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="mt-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
            {line.hint}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OutboundExecutionEditableLines;
