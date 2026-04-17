// src/features/wms/inbound/pages/InboundWorkbenchPage.tsx

import React from "react";
import InboundInputCard from "../components/InboundInputCard";
import InboundEventCard from "../components/InboundEventCard";
import { useInboundWorkbenchModel } from "../model/useInboundWorkbenchModel";

const InboundWorkbenchPage: React.FC = () => {
  const m = useInboundWorkbenchModel();
  const { state } = m;

  const purchaseSourceLineMap = new Map(
    m.purchaseSourceLines.map((line) => [line.poLineId, line]),
  );

  return (
    <div className="space-y-6 p-7">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">
          入库工作台
        </h1>
        <p className="text-sm text-slate-500">
          统一承接采购入库、退货入库、其他入库。页面按“上卡输入、下卡事件”组织。
        </p>
      </header>

      <InboundInputCard
        mode={state.mode}
        sourceType={m.derived.sourceType}
        warehouseId={state.warehouseId}
        sourceRef={state.head.sourceRef}
        occurredAt={state.head.occurredAt}
        remark={state.head.remark}
        warehouseOptions={m.warehouseOptions}
        warehouseOptionsLoading={m.warehouseOptionsLoading}
        warehouseOptionsError={m.warehouseOptionsError}
        purchaseOrderOptions={m.purchaseOrderOptions}
        purchaseOrderOptionsLoading={m.purchaseOrderOptionsLoading}
        purchaseOrderOptionsError={m.purchaseOrderOptionsError}
        purchaseSourceLines={m.purchaseSourceLines}
        purchaseSourceLinesLoading={m.purchaseSourceLinesLoading}
        purchaseSourceLinesError={m.purchaseSourceLinesError}
        itemLines={state.lines.map((line) => ({
          localId: line.localId,
          barcode: line.barcode,
          itemId: line.itemId,
          uomId: line.uomId,
        }))}
        lines={state.lines.map((line) => {
          const sourceLine =
            line.poLineId != null
              ? purchaseSourceLineMap.get(line.poLineId) ?? null
              : null;

          return {
            localId: line.localId,
            poLineId: line.poLineId,
            sourceLineNo: sourceLine?.lineNo ?? null,
            sourceItemName: sourceLine?.itemName ?? null,
            sourceItemSku: sourceLine?.itemSku ?? null,
            sourceUomName: sourceLine?.uomName ?? null,
            sourceQtyRemainingInput: sourceLine?.qtyRemainingInput ?? "",
            sourceQtyRemainingBase: sourceLine?.qtyRemainingBase ?? null,
            sourceLineCompletionStatus:
              sourceLine?.lineCompletionStatus ?? null,
            qtyInput: line.qtyInput,
            lotCodeInput: line.lotCodeInput,
            productionDate: line.productionDate,
            expiryDate: line.expiryDate,
            remark: line.remark,
          };
        })}
        submitting={state.submitting}
        submitError={state.submitError}
        onSubmit={() => {
          void m.submitDraft();
        }}
        onModeChange={m.setMode}
        onWarehouseIdChange={m.setWarehouseId}
        onSourceRefChange={(value) => {
          void m.selectPurchaseSourceRef(value);
        }}
        onOccurredAtChange={(value) => m.patchHead({ occurredAt: value })}
        onRemarkChange={(value) => m.patchHead({ remark: value })}
        onLineBarcodeChange={(localId, value) => {
          m.updateLine(localId, { barcode: value });
        }}
        onLineItemIdChange={(localId, value) => {
          m.updateLine(localId, { itemId: value });
        }}
        onLineUomIdChange={(localId, value) => {
          m.updateLine(localId, { uomId: value });
        }}
        onLineQtyInputChange={(localId, value) => {
          m.updateLine(localId, { qtyInput: value });
        }}
        onLineLotCodeInputChange={(localId, value) => {
          m.updateLine(localId, { lotCodeInput: value });
        }}
        onLineProductionDateChange={(localId, value) => {
          m.updateLine(localId, { productionDate: value });
        }}
        onLineExpiryDateChange={(localId, value) => {
          m.updateLine(localId, { expiryDate: value });
        }}
        onLineRemarkChange={(localId, value) => {
          m.updateLine(localId, { remark: value });
        }}
        onAddLine={m.addLine}
        onRemoveLine={(localId) => {
          m.removeLine(localId);
        }}
      />

      <InboundEventCard
        recentItems={state.recentEvents}
        latestEventNo={state.latestEvent?.event.eventNo ?? null}
        latestTraceId={state.latestEvent?.event.traceId ?? null}
        latestLines={state.latestEvent?.lines ?? []}
        loading={m.eventsLoading}
        error={m.eventsError}
        detailLoading={m.eventDetailLoading}
        detailError={m.eventDetailError}
        onLoadRecent={() => {
          void m.loadRecentEvents();
        }}
        onSelectEvent={(eventId) => {
          void m.loadEventDetail(eventId);
        }}
      />
    </div>
  );
};

export default InboundWorkbenchPage;
