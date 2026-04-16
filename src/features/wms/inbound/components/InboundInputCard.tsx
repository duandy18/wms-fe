// src/features/wms/inbound/components/InboundInputCard.tsx

import React from "react";
import InboundModeSelector from "./InboundModeSelector";
import InboundSourceSection from "./InboundSourceSection";
import InboundPurchaseSourceLinesPanel from "./InboundPurchaseSourceLinesPanel";
import InboundItemEntrySection, { type InboundItemEditableLine } from "./InboundItemEntrySection";
import InboundLinesEditor, { type InboundEditableLine } from "./InboundLinesEditor";
import type {
  InboundWarehouseOption,
  PurchaseOrderCompletionLoadedLine,
  PurchaseOrderSourceOption,
} from "../api/inboundWorkbenchApi";
import type { InboundMode } from "../types";

const cardCls = "rounded-2xl border border-slate-200 bg-white p-5";
const btnCls =
  "rounded-lg border border-slate-900 bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50";

export interface InboundInputCardProps {
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

  purchaseSourceLines: PurchaseOrderCompletionLoadedLine[];
  purchaseSourceLinesLoading: boolean;
  purchaseSourceLinesError: string | null;

  itemLines: InboundItemEditableLine[];
  lines: InboundEditableLine[];

  submitting: boolean;
  submitError: string | null;
  onSubmit: () => void;

  onModeChange: (mode: InboundMode) => void;
  onWarehouseIdChange: (value: number | null) => void;
  onSourceRefChange: (value: string | null) => void;
  onOccurredAtChange: (value: string | null) => void;
  onRemarkChange: (value: string) => void;

  onLineBarcodeChange: (localId: string, value: string | null) => void;
  onLineItemIdChange: (localId: string, value: number | null) => void;
  onLineUomIdChange: (localId: string, value: number | null) => void;

  onLineQtyInputChange: (localId: string, value: string) => void;
  onLineLotCodeInputChange: (localId: string, value: string) => void;
  onLineProductionDateChange: (localId: string, value: string) => void;
  onLineExpiryDateChange: (localId: string, value: string) => void;

  onAddLine: () => void;
  onRemoveLine: (localId: string) => void;
}

export const InboundInputCard: React.FC<InboundInputCardProps> = ({
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
  purchaseSourceLines,
  purchaseSourceLinesLoading,
  purchaseSourceLinesError,
  itemLines,
  lines,
  submitting,
  submitError,
  onSubmit,
  onModeChange,
  onWarehouseIdChange,
  onSourceRefChange,
  onOccurredAtChange,
  onRemarkChange,
  onLineBarcodeChange,
  onLineItemIdChange,
  onLineUomIdChange,
  onLineQtyInputChange,
  onLineLotCodeInputChange,
  onLineProductionDateChange,
  onLineExpiryDateChange,
  onAddLine,
  onRemoveLine,
}) => {
  const isPurchaseMode = mode === "PURCHASE";

  return (
    <section className={cardCls}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="text-base font-semibold text-slate-900">
            入库输入卡
          </div>
          <div className="text-sm text-slate-500">
            这一张卡继续收口为：模式选择、来源区、采购来源行、商品识别区、行编辑区。
          </div>
        </div>

        <InboundModeSelector value={mode} onChange={onModeChange} />
      </div>

      <div className="mt-5 space-y-4">
        <InboundSourceSection
          mode={mode}
          sourceType={sourceType}
          warehouseId={warehouseId}
          sourceRef={sourceRef}
          occurredAt={occurredAt}
          remark={remark}
          warehouseOptions={warehouseOptions}
          warehouseOptionsLoading={warehouseOptionsLoading}
          warehouseOptionsError={warehouseOptionsError}
          purchaseOrderOptions={purchaseOrderOptions}
          purchaseOrderOptionsLoading={purchaseOrderOptionsLoading}
          purchaseOrderOptionsError={purchaseOrderOptionsError}
          onWarehouseIdChange={onWarehouseIdChange}
          onSourceRefChange={onSourceRefChange}
          onOccurredAtChange={onOccurredAtChange}
          onRemarkChange={onRemarkChange}
        />

        {isPurchaseMode ? (
          <InboundPurchaseSourceLinesPanel
            sourceRef={sourceRef}
            lines={purchaseSourceLines}
            loading={purchaseSourceLinesLoading}
            error={purchaseSourceLinesError}
          />
        ) : null}

        <InboundItemEntrySection
          lines={itemLines}
          onBarcodeChange={onLineBarcodeChange}
          onItemIdChange={onLineItemIdChange}
          onUomIdChange={onLineUomIdChange}
        />
        <InboundLinesEditor
          lines={lines}
          onQtyInputChange={onLineQtyInputChange}
          onLotCodeInputChange={onLineLotCodeInputChange}
          onProductionDateChange={onLineProductionDateChange}
          onExpiryDateChange={onLineExpiryDateChange}
          onAddLine={onAddLine}
          onRemoveLine={onRemoveLine}
        />
      </div>

      {submitError ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {submitError}
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-end">
        <button
          type="button"
          className={btnCls}
          onClick={onSubmit}
          disabled={submitting}
        >
          {submitting ? "提交中…" : "提交入库"}
        </button>
      </div>
    </section>
  );
};

export default InboundInputCard;
