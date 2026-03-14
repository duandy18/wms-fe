// src/features/internal-outbound/pages/InternalOutboundPage.tsx
//
// 内部出库 Cockpit（样品 / 内部领用 / 报废等非订单出库）
// -----------------------------------------------------------
// 提供基本操作能力：
//  1) 创建内部出库单（单据头）
//  2) 增加 / 累加明细行
//  3) 查询可用库存（简化版）
//  4) 确认出库
//
// 说明：
//  - 不接扫码链路，只提供最小可用 Cockpit；
//  - 批次为空时后端自动走 FEFO；
//  - 本页面已从 operations/ship 域中独立出来，归入 internal-outbound 独立业务域。

import React from "react";
import PageTitle from "@/components/ui/PageTitle";
import { ItemSelectorDialog } from "@/features/common/ItemSelectorDialog";

import { useInternalOutboundController } from "../useInternalOutboundController";
import { InternalOutboundHeaderForm } from "../components/InternalOutboundHeaderForm";
import { InternalOutboundLinesSection } from "../components/InternalOutboundLinesSection";

export const InternalOutboundPage: React.FC = () => {
  const c = useInternalOutboundController();

  return (
    <div className="space-y-4">
      <PageTitle title="内部出库" />

      {c.error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {c.error}
        </div>
      )}

      <InternalOutboundHeaderForm
        doc={c.doc}
        disabled={c.disabled}
        warehouseId={c.warehouseId}
        onWarehouseIdChange={(v) => {
          c.setWarehouseId(v);
          const parsedItem = Number(c.itemIdInput);
          if (parsedItem) void c.loadStockHint(v, parsedItem);
        }}
        docType={c.docType}
        onDocTypeChange={c.setDocType}
        recipientName={c.recipientName}
        onRecipientNameChange={c.setRecipientName}
        recipientType={c.recipientType}
        onRecipientTypeChange={c.setRecipientType}
        recipientNote={c.recipientNote}
        onRecipientNoteChange={c.setRecipientNote}
        docNote={c.docNote}
        onDocNoteChange={c.setDocNote}
        docTypes={c.DOC_TYPES}
        onCreate={c.createDoc}
      />

      {c.doc && (
        <InternalOutboundLinesSection
          doc={c.doc}
          disabled={c.disabled}
          itemIdInput={c.itemIdInput}
          onItemIdInputChange={c.setItemIdInput}
          onItemIdBlur={c.handleItemIdBlur}
          selectedItemName={c.selectedItemName}
          qtyInput={c.qtyInput}
          onQtyInputChange={c.setQtyInput}
          batchCodeInput={c.batchCodeInput}
          onBatchCodeInputChange={c.setBatchCodeInput}
          uomInput={c.uomInput}
          onUomInputChange={c.setUomInput}
          lineNoteInput={c.lineNoteInput}
          onLineNoteInputChange={c.setLineNoteInput}
          stockHint={c.stockHint}
          onOpenItemSelector={() => c.setItemSelectorOpen(true)}
          onAddLine={c.addLine}
          onConfirm={c.confirmDoc}
        />
      )}

      <ItemSelectorDialog
        open={c.itemSelectorOpen}
        onClose={() => c.setItemSelectorOpen(false)}
        onSelect={c.handleSelectItem}
      />
    </div>
  );
};

export default InternalOutboundPage;
