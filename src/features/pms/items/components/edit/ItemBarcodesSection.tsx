// src/features/pms/items/components/edit/ItemBarcodesSection.tsx

import React, { useEffect } from "react";
import { useItemBarcodesPanelModel } from "../../barcodes-panel/useItemBarcodesPanelModel";
import { BarcodesTable } from "../../barcodes-panel/BarcodesTable";
import { AddBarcodeForm, ITEMS_ADD_BARCODE_INPUT_ID } from "../../barcodes-panel/AddBarcodeForm";

type ItemsBarcodeScannedDetail = { code: string };

function isItemsBarcodeScannedEvent(e: Event): e is CustomEvent<ItemsBarcodeScannedDetail> {
  return e instanceof CustomEvent && typeof (e.detail as ItemsBarcodeScannedDetail | undefined)?.code === "string";
}

export const ItemBarcodesSection: React.FC<{ itemId: number; disabled?: boolean }> = ({ itemId, disabled }) => {
  const m = useItemBarcodesPanelModel({ itemId, disableClosePanel: true });

  useEffect(() => {
    function onScanned(e: Event) {
      if (!isItemsBarcodeScannedEvent(e)) return;
      const code = e.detail.code.trim();
      if (!code) return;

      m.setNewCode(code);

      requestAnimationFrame(() => {
        const el = document.getElementById(ITEMS_ADD_BARCODE_INPUT_ID);
        if (el instanceof HTMLInputElement) {
          el.focus();
          el.select();
        }
      });
    }

    window.addEventListener("items:barcode-scanned", onScanned as EventListener);
    return () => window.removeEventListener("items:barcode-scanned", onScanned as EventListener);
  }, [m]);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-base font-semibold">条码管理</div>
        <div className="text-[12px] text-slate-500">一个商品，一个单位，一行条码</div>
      </div>

      {m.error ? <div className="text-base text-red-600">{m.error}</div> : null}

      {m.loading ? (
        <div className="text-base text-slate-600">条码加载中…</div>
      ) : m.rows.length === 0 ? (
        <div className="text-base text-slate-600">当前商品尚未配置条码。</div>
      ) : (
        <BarcodesTable
          rows={m.rows}
          onSetPrimary={(id) => void m.handleSetPrimary(id)}
          onDelete={(id) => void m.handleDelete(id)}
        />
      )}

      <div className={disabled ? "opacity-60 pointer-events-none" : ""}>
        <AddBarcodeForm
          inputId={ITEMS_ADD_BARCODE_INPUT_ID}
          newCode={m.newCode}
          selectedUomId={m.selectedUomId}
          uomOptions={m.uomOptions}
          saving={m.saving}
          canSubmit={!disabled && m.canSubmit}
          onChangeCode={m.setNewCode}
          onChangeSelectedUomId={m.setSelectedUomId}
          onSubmit={(e) => void m.handleAdd(e)}
        />
      </div>
    </section>
  );
};

export default ItemBarcodesSection;
