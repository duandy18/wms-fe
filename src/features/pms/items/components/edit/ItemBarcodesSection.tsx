import React from "react";
import type { ItemBarcodeCompositeRow } from "../../api/itemBarcodesOwnerApi";
import { AddBarcodeForm } from "../../barcodes-panel/AddBarcodeForm";
import { useItemBarcodesPanelModel } from "../../barcodes-panel/useItemBarcodesPanelModel";

export const ItemBarcodesSection: React.FC<{
  itemId: number;
  editingRow?: ItemBarcodeCompositeRow | null;
  reloadToken?: number;
  scannedCode?: string | null;
  onScannedCodeConsumed?: () => void;
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

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-base font-semibold text-slate-900">包装单位和条码绑定</div>
          <div className="mt-1 text-sm text-slate-500">
            条码绑定到具体包装单位。请先选择包装单位，再在条码输入框中录入或直接扫码。
          </div>
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
          当前商品还没有可用包装。请先在包装单位卡里保存基础包装 / 新增包装，再回来绑定条码。
        </div>
      ) : null}

      <div className={disabled ? "pointer-events-none opacity-60" : ""}>
        <AddBarcodeForm
          mode={m.isEditMode ? "edit" : "create"}
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
