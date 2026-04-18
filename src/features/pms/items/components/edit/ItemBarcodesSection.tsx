import React, { useEffect } from "react";
import { ScanConsole } from "../../../../../shared/scan/ui/ScanConsole";
import type { ItemBarcodeCompositeRow } from "../../api/itemBarcodesOwnerApi";
import { AddBarcodeForm, ITEMS_ADD_BARCODE_INPUT_ID } from "../../barcodes-panel/AddBarcodeForm";
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
  scannedCode,
  onScannedCodeConsumed,
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

  function focusBarcodeInput() {
    requestAnimationFrame(() => {
      const el = document.getElementById(ITEMS_ADD_BARCODE_INPUT_ID);
      if (el instanceof HTMLInputElement) {
        el.focus();
        el.select();
      }
    });
  }

  async function handleScanFill(codeRaw: string): Promise<void> {
    const code = codeRaw.trim();
    if (!code) return;

    m.setNewCode(code);
    focusBarcodeInput();
  }

  useEffect(() => {
    const code = (scannedCode ?? "").trim();
    if (!code) return;

    m.setNewCode(code);
    focusBarcodeInput();
    onScannedCodeConsumed?.();
  }, [scannedCode, onScannedCodeConsumed, m]);

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-base font-semibold text-slate-900">包装单位和条码绑定</div>
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

      {!disabled ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="mb-2 text-sm font-semibold text-slate-900">扫码带入条码</div>
          <div className="mb-3 text-xs text-slate-500">
            这里的扫码只负责把原始条码带入绑定输入框，不直接保存，也不走 WMS 扫码作业链。
          </div>

          <ScanConsole
            title="扫码带入绑定码"
            placeholder="请在此处扫码要绑定的条码"
            modeLabel="PMS 条码绑定"
            scanMode="auto"
            onScan={handleScanFill}
          />
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
