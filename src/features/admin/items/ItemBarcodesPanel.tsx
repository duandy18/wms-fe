// src/features/admin/items/ItemBarcodesPanel.tsx
//
// 条码管理面板（单层卡片版）
// - 去掉外圈（外圈由 ItemsPage 删除）
// - 未选中商品时：保留引导说明（字号放大）
// - 有明确“关闭”按钮：无输入也能退出
// - 字号整体放大 2 倍

import React from "react";
import { useItemBarcodesPanelModel } from "./barcodes-panel/useItemBarcodesPanelModel";
import { PanelHeader } from "./barcodes-panel/PanelHeader";
import { EmptyHint } from "./barcodes-panel/EmptyHint";
import { BarcodesTable } from "./barcodes-panel/BarcodesTable";
import { AddBarcodeForm } from "./barcodes-panel/AddBarcodeForm";

export const ItemBarcodesPanel: React.FC = () => {
  const m = useItemBarcodesPanelModel();

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
      <PanelHeader onClose={m.closePanel} />

      {!m.hasSelection ? (
        <EmptyHint />
      ) : (
        <>
          {m.error ? <div className="text-lg text-red-600">{m.error}</div> : null}

          {m.loading ? (
            <div className="text-lg text-slate-600">条码加载中…</div>
          ) : m.barcodes.length === 0 ? (
            <div className="text-lg text-slate-600">当前商品尚未配置条码。</div>
          ) : (
            <BarcodesTable
              barcodes={m.barcodes}
              onSetPrimary={(id) => void m.handleSetPrimary(id)}
              onDelete={(id) => void m.handleDelete(id)}
            />
          )}

          <AddBarcodeForm
            newCode={m.newCode}
            newKind={m.newKind}
            saving={m.saving}
            canSubmit={m.canSubmit}
            onChangeCode={m.setNewCode}
            onChangeKind={m.setNewKind}
            onSubmit={(e) => void m.handleAdd(e)}
          />
        </>
      )}
    </section>
  );
};

export default ItemBarcodesPanel;
