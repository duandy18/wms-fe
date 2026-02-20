// src/features/admin/items/components/edit/ItemBarcodesSection.tsx

import React from "react";
import { useItemBarcodesPanelModel } from "../../barcodes-panel/useItemBarcodesPanelModel";
import { BarcodesTable } from "../../barcodes-panel/BarcodesTable";
import { AddBarcodeForm } from "../../barcodes-panel/AddBarcodeForm";

export const ItemBarcodesSection: React.FC<{ itemId: number; disabled?: boolean }> = ({ itemId, disabled }) => {
  const m = useItemBarcodesPanelModel({ itemId, disableClosePanel: true });

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-base font-semibold">条码管理</div>
        <div className="text-[12px] text-slate-500">新增/设为主/删除</div>
      </div>

      {m.error ? <div className="text-base text-red-600">{m.error}</div> : null}

      {m.loading ? (
        <div className="text-base text-slate-600">条码加载中…</div>
      ) : m.barcodes.length === 0 ? (
        <div className="text-base text-slate-600">当前商品尚未配置条码。</div>
      ) : (
        <BarcodesTable
          barcodes={m.barcodes}
          onSetPrimary={(id) => void m.handleSetPrimary(id)}
          onDelete={(id) => void m.handleDelete(id)}
        />
      )}

      <div className={disabled ? "opacity-60 pointer-events-none" : ""}>
        <AddBarcodeForm
          newCode={m.newCode}
          newKind={m.newKind}
          saving={m.saving}
          canSubmit={!disabled && m.canSubmit}
          onChangeCode={m.setNewCode}
          onChangeKind={m.setNewKind}
          onSubmit={(e) => void m.handleAdd(e)}
        />
      </div>
    </section>
  );
};

export default ItemBarcodesSection;
