// src/features/wms/inbound/components/InboundItemEntrySection.tsx

import React from "react";

const sectionCls = "rounded-xl border border-slate-200 bg-slate-50 p-4";
const labelCls = "text-xs text-slate-500";
const inputCls =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400";

export type InboundItemEditableLine = {
  localId: string;
  barcode: string | null;
  itemId: number | null;
  uomId: number | null;
};

export interface InboundItemEntrySectionProps {
  lines: InboundItemEditableLine[];
  onBarcodeChange: (localId: string, value: string | null) => void;
  onItemIdChange: (localId: string, value: number | null) => void;
  onUomIdChange: (localId: string, value: number | null) => void;
}

export const InboundItemEntrySection: React.FC<InboundItemEntrySectionProps> = ({
  lines,
  onBarcodeChange,
  onItemIdChange,
  onUomIdChange,
}) => {
  return (
    <section className={sectionCls}>
      <div className="space-y-1">
        <div className="text-sm font-semibold text-slate-900">商品识别区</div>
        <div className="text-sm text-slate-500">
          当前这一步只把 barcode / itemId / uomId 推进到真正的多行渲染。
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {lines.map((line, index) => (
          <section
            key={line.localId}
            className="rounded-lg border border-slate-300 bg-white p-4"
          >
            <div className="text-sm font-medium text-slate-900">
              第 {index + 1} 行
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <label>
                <div className={labelCls}>barcode</div>
                <input
                  className={inputCls}
                  placeholder="扫码或输入条码"
                  value={line.barcode ?? ""}
                  onChange={(e) => {
                    const raw = e.target.value.trim();
                    onBarcodeChange(line.localId, raw ? raw : null);
                  }}
                />
              </label>

              <label>
                <div className={labelCls}>item_id</div>
                <input
                  className={inputCls}
                  inputMode="numeric"
                  placeholder="例如 1"
                  value={line.itemId ?? ""}
                  onChange={(e) => {
                    const raw = e.target.value.trim();
                    onItemIdChange(line.localId, raw ? Number(raw) : null);
                  }}
                />
              </label>

              <label>
                <div className={labelCls}>uom_id</div>
                <input
                  className={inputCls}
                  inputMode="numeric"
                  placeholder="例如 1"
                  value={line.uomId ?? ""}
                  onChange={(e) => {
                    const raw = e.target.value.trim();
                    onUomIdChange(line.localId, raw ? Number(raw) : null);
                  }}
                />
              </label>
            </div>
          </section>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-600">
        当前只推进多行草稿录入，不做商品解析，不做条码探测，不推导 qty_base。
      </div>
    </section>
  );
};

export default InboundItemEntrySection;
