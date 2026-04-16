// src/features/wms/inbound/components/InboundSourceSection.tsx

import React from "react";
import type { InboundWarehouseOption, PurchaseOrderSourceOption } from "../api/inboundWorkbenchApi";
import type { InboundMode } from "../types";

const sectionCls = "rounded-xl border border-slate-200 bg-slate-50 p-4";
const labelCls = "text-xs text-slate-500";
const inputCls =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400";

export interface InboundSourceSectionProps {
  mode: InboundMode;
  sourceType: string;
  warehouseId: number | null;
  sourceRef: string | null;
  occurredAt: string | null;
  remark: string;

  warehouseOptions: InboundWarehouseOption[];
  warehouseOptionsLoading: boolean;
  warehouseOptionsError: string | null;

  purchaseOrderOptions: PurchaseOrderSourceOption[];
  purchaseOrderOptionsLoading: boolean;
  purchaseOrderOptionsError: string | null;

  onWarehouseIdChange: (value: number | null) => void;
  onSourceRefChange: (value: string | null) => void;
  onOccurredAtChange: (value: string | null) => void;
  onRemarkChange: (value: string) => void;
}

function modeHint(mode: InboundMode): string {
  switch (mode) {
    case "PURCHASE":
      return "采购模块提供采购单来源下拉；WMS 页面只消费来源合同，不自行拼采购语义。";
    case "RETURN":
      return "退货入库来源区后续接退货单读面；本步先不展开。";
    case "OTHER":
    default:
      return "其他入库暂保留手工来源号；后续按业务再细分。";
  }
}

export const InboundSourceSection: React.FC<InboundSourceSectionProps> = ({
  mode,
  sourceType,
  warehouseId,
  sourceRef,
  occurredAt,
  remark,
  warehouseOptions,
  warehouseOptionsLoading,
  warehouseOptionsError,
  purchaseOrderOptions,
  purchaseOrderOptionsLoading,
  purchaseOrderOptionsError,
  onWarehouseIdChange,
  onSourceRefChange,
  onOccurredAtChange,
  onRemarkChange,
}) => {
  const isPurchaseMode = mode === "PURCHASE";

  return (
    <section className={sectionCls}>
      <div className="space-y-1">
        <div className="text-sm font-semibold text-slate-900">来源区</div>
        <div className="text-sm text-slate-500">
          这一块负责承接业务来源，不再围绕 receive-task 组织页面。
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <label>
          <div className={labelCls}>仓库</div>
          <select
            className={inputCls}
            value={warehouseId != null ? String(warehouseId) : ""}
            disabled={warehouseOptionsLoading}
            onChange={(e) => {
              const raw = e.target.value.trim();
              onWarehouseIdChange(raw ? Number(raw) : null);
            }}
          >
            <option value="">
              {warehouseOptionsLoading ? "仓库加载中…" : "请选择仓库"}
            </option>
            {warehouseOptions.map((item) => (
              <option key={item.id} value={String(item.id)}>
                {item.label}
              </option>
            ))}
          </select>
          {warehouseOptionsError ? (
            <div className="mt-2 text-sm text-red-600">
              仓库加载失败：{warehouseOptionsError}
            </div>
          ) : null}
        </label>

        <label>
          <div className={labelCls}>source_type</div>
          <input
            className={`${inputCls} bg-slate-100`}
            value={sourceType}
            readOnly
          />
        </label>

        {isPurchaseMode ? (
          <label>
            <div className={labelCls}>采购单号</div>
            <select
              className={inputCls}
              value={sourceRef ?? ""}
              disabled={purchaseOrderOptionsLoading || warehouseId == null}
              onChange={(e) => {
                const raw = e.target.value.trim();
                onSourceRefChange(raw ? raw : null);
              }}
            >
              <option value="">
                {warehouseId == null
                  ? "请先选择仓库"
                  : purchaseOrderOptionsLoading
                    ? "采购单加载中…"
                    : "请选择采购单"}
              </option>
              {purchaseOrderOptions.map((item) => (
                <option key={item.poId} value={item.poNo}>
                  {item.label}
                </option>
              ))}
            </select>
            {purchaseOrderOptionsError ? (
              <div className="mt-2 text-sm text-red-600">
                采购来源加载失败：{purchaseOrderOptionsError}
              </div>
            ) : null}
          </label>
        ) : (
          <label>
            <div className={labelCls}>source_ref</div>
            <input
              className={inputCls}
              placeholder="退货单号 / 手工来源号"
              value={sourceRef ?? ""}
              onChange={(e) => {
                const raw = e.target.value.trim();
                onSourceRefChange(raw ? raw : null);
              }}
            />
          </label>
        )}

        <label>
          <div className={labelCls}>occurred_at</div>
          <input
            className={inputCls}
            type="datetime-local"
            value={occurredAt ?? ""}
            onChange={(e) => {
              const raw = e.target.value.trim();
              onOccurredAtChange(raw ? raw : null);
            }}
          />
        </label>
      </div>

      <label className="mt-4 block">
        <div className={labelCls}>remark</div>
        <textarea
          className={`${inputCls} min-h-[88px] resize-y`}
          placeholder="备注"
          value={remark}
          onChange={(e) => onRemarkChange(e.target.value)}
        />
      </label>

      <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-600">
        {modeHint(mode)}
      </div>
    </section>
  );
};

export default InboundSourceSection;
