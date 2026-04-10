// src/features/pms/items/components/edit/ItemBarcodesSection.tsx

import React, { useEffect } from "react";
import type { ItemBarcodeCompositeRow } from "../../api/itemBarcodesOwnerApi";
import { AddBarcodeForm, ITEMS_ADD_BARCODE_INPUT_ID } from "../../barcodes-panel/AddBarcodeForm";
import { useItemBarcodesPanelModel } from "../../barcodes-panel/useItemBarcodesPanelModel";

type ItemsBarcodeScannedDetail = { code: string };

function isItemsBarcodeScannedEvent(e: Event): e is CustomEvent<ItemsBarcodeScannedDetail> {
  return e instanceof CustomEvent && typeof (e.detail as ItemsBarcodeScannedDetail | undefined)?.code === "string";
}

export const ItemBarcodesSection: React.FC<{
  itemId: number;
  editingRow?: ItemBarcodeCompositeRow | null;
  reloadToken?: number;
  onSaved?: () => Promise<void> | void;
  onCancelEdit?: () => void;
  disabled?: boolean;
}> = ({
  itemId,
  editingRow,
  reloadToken,
  onSaved,
  onCancelEdit,
  disabled,
}) => {
  const m = useItemBarcodesPanelModel({
    itemId,
    editingRow,
    reloadToken,
    onSaved,
    onCancelEdit,
  });

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
    <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-base font-semibold text-slate-900">条码绑定卡</div>
          <div className="mt-1 text-sm text-slate-500">
            当前商品下，选择一个包装单位，再绑定一条条码。修改也回到这里完成。
          </div>
        </div>

        <div className="rounded bg-slate-100 px-3 py-1 text-xs text-slate-600">
          {m.isEditMode ? "修改模式" : "新增模式"}
        </div>
      </div>

      {m.error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {m.error}
        </div>
      ) : null}

      {m.loading ? (
        <div className="text-sm text-slate-500">条码绑定信息加载中…</div>
      ) : m.uomOptions.length === 0 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          当前商品还没有可用包装。请先在左侧包装卡里保存基础包装 / 新增包装，再回来绑定条码。
        </div>
      ) : null}

      <div className={disabled ? "pointer-events-none opacity-60" : ""}>
        <AddBarcodeForm
          mode={m.isEditMode ? "edit" : "create"}
          inputId={ITEMS_ADD_BARCODE_INPUT_ID}
          newCode={m.newCode}
          selectedUomId={m.selectedUomId}
          uomOptions={m.uomOptions}
          isPrimary={m.isPrimary}
          saving={m.saving}
          canSubmit={!disabled && m.canSubmit}
          onChangeCode={m.setNewCode}
          onChangeSelectedUomId={m.setSelectedUomId}
          onChangeIsPrimary={m.setIsPrimary}
          onSubmit={(e) => void m.handleSubmit(e)}
          onCancelEdit={m.cancelEdit}
        />
      </div>
    </section>
  );
};

export default ItemBarcodesSection;
