// src/features/admin/items/editor/ItemEditorContainer.tsx

import React, { useCallback, useEffect } from "react";
import { useItemsStore } from "../itemsStore";
import { useSuppliersOptions } from "../create/useSuppliersOptions";
import { EMPTY_FORM } from "../create/types";
import useItemEditor from "./useItemEditor";
import type { ItemEditorVm } from "./useItemEditor";
import ItemEditorForm from "./ItemEditorForm";
import useGlobalBarcodeScan from "./useGlobalBarcodeScan";

const EDITOR_ANCHOR_ID = "items-editor";
const CREATE_BARCODE_INPUT_ID = "items-create-barcode-input";
const BARCODE_SCANNED_EVENT = "items:barcode-scanned";

type ItemsBarcodeScannedDetail = { code: string };

const ItemEditorContainer: React.FC = () => {
  const selectedItem = useItemsStore((s) => s.selectedItem);
  const setSelectedItem = useItemsStore((s) => s.setSelectedItem);
  const primaryBarcodes = useItemsStore((s) => s.primaryBarcodes);
  const loadItems = useItemsStore((s) => s.loadItems);

  const scannedBarcode = useItemsStore((s) => s.scannedBarcode);

  const { suppliers, supLoading, supError } = useSuppliersOptions();

  const selectedPrimaryBarcode =
    selectedItem ? primaryBarcodes[selectedItem.id] ?? "" : "";

  // ✅ Hook 必须在组件内部调用
  const vm: ItemEditorVm = useItemEditor({
    selectedItem,
    selectedPrimaryBarcode,
    suppliers,
    supLoading,
    supError,
    emptyForm: { ...EMPTY_FORM },
    onAfterSaved: async () => {
      await loadItems();
    },
    onResetToCreate: () => setSelectedItem(null),
  });

  // 编辑时滚动到顶部
  useEffect(() => {
    if (!selectedItem) return;
    const el = document.getElementById(EDITOR_ANCHOR_ID);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedItem]);

  const focusCreateBarcodeInput = useCallback(() => {
    requestAnimationFrame(() => {
      const el = document.getElementById(CREATE_BARCODE_INPUT_ID);
      if (el instanceof HTMLInputElement) {
        el.focus();
        el.select();
      }
    });
  }, []);

  const dispatchBarcodeToEditSection = useCallback((code: string) => {
    const detail: ItemsBarcodeScannedDetail = { code };
    window.dispatchEvent(new CustomEvent<ItemsBarcodeScannedDetail>(BARCODE_SCANNED_EVENT, { detail }));
  }, []);

  const handleScan = useCallback(
    (code: string) => {
      if (vm.saving) return;
      const trimmed = code.trim();
      if (!trimmed) return;

      // 无论在哪：先滚动到编辑器，让用户知道“我接管了扫码”
      const anchor = document.getElementById(EDITOR_ANCHOR_ID);
      if (anchor) {
        anchor.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      if (vm.mode === "create") {
        vm.setForm({ ...vm.form, barcode: trimmed });
        focusCreateBarcodeInput();
        return;
      }

      // edit 模式：把条码投递给条码区块（新增条码输入框）
      dispatchBarcodeToEditSection(trimmed);
    },
    [dispatchBarcodeToEditSection, focusCreateBarcodeInput, vm],
  );

  // 1) 全局扫码：强制捕获 → 聚焦条码框（create or edit）
  useGlobalBarcodeScan({
    enabled: true,
    onScan: handleScan,
  });

  // 2) URL / store 带入 scannedBarcode：create mode 且当前 barcode 为空时，自动回填一次
  useEffect(() => {
    if (vm.saving) return;
    if (!scannedBarcode || !scannedBarcode.trim()) return;

    if (vm.mode === "create") {
      if (vm.form.barcode.trim()) return;
      handleScan(scannedBarcode);
      return;
    }

    // edit 模式：也允许 URL 带入后直接投递到条码区块
    handleScan(scannedBarcode);
  }, [handleScan, scannedBarcode, vm.form.barcode, vm.mode, vm.saving]);

  return (
    <section
      id={EDITOR_ANCHOR_ID}
      className="rounded-xl border border-slate-200 bg-white p-6 space-y-6"
    >
      <ItemEditorForm vm={vm} />
    </section>
  );
};

export default ItemEditorContainer;
export { CREATE_BARCODE_INPUT_ID };
