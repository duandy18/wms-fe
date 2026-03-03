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

const ItemEditorContainer: React.FC = () => {
  const selectedItem = useItemsStore((s) => s.selectedItem);
  const setSelectedItem = useItemsStore((s) => s.setSelectedItem);
  const primaryBarcodes = useItemsStore((s) => s.primaryBarcodes);
  const loadItems = useItemsStore((s) => s.loadItems);

  const scannedBarcode = useItemsStore((s) => s.scannedBarcode);

  const { suppliers, supLoading, supError } = useSuppliersOptions();

  const selectedPrimaryBarcode = selectedItem ? primaryBarcodes[selectedItem.id] ?? "" : "";

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

  useEffect(() => {
    if (!selectedItem) return;
    const el = document.getElementById(EDITOR_ANCHOR_ID);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
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

  /**
   * ✅ 终态：扫码直接写入表单（产品码/箱码），不再投递到“条码管理面板”
   * 规则：
   * - 优先填产品码（item_barcode）
   * - 若产品码已有，再填箱码（case_barcode）
   * - 两个都已有则忽略（避免意外覆盖）
   */
  const handleScan = useCallback(
    (code: string) => {
      if (vm.saving) return;
      const trimmed = code.trim();
      if (!trimmed) return;

      // 先滚到编辑器
      const anchor = document.getElementById(EDITOR_ANCHOR_ID);
      if (anchor) anchor.scrollIntoView({ behavior: "smooth", block: "start" });

      const curItem = vm.form.barcodes.item_barcode.trim();
      const curCase = vm.form.barcodes.case_barcode.trim();

      if (!curItem) {
        vm.setForm({
          ...vm.form,
          barcodes: { ...vm.form.barcodes, item_barcode: trimmed },
        });
        if (vm.mode === "create") focusCreateBarcodeInput();
        return;
      }

      if (!curCase) {
        vm.setForm({
          ...vm.form,
          barcodes: { ...vm.form.barcodes, case_barcode: trimmed },
        });
        return;
      }

      // 两个都已有，不覆盖
    },
    [focusCreateBarcodeInput, vm],
  );

  useGlobalBarcodeScan({
    enabled: true,
    onScan: handleScan,
  });

  useEffect(() => {
    if (vm.saving) return;
    if (!scannedBarcode || !scannedBarcode.trim()) return;

    // create/edit 都统一走 handleScan（终态：扫码写入表单字段）
    handleScan(scannedBarcode);
  }, [handleScan, scannedBarcode, vm.saving]);

  return (
    <section id={EDITOR_ANCHOR_ID} className="rounded-xl border border-slate-200 bg-white p-6 space-y-6">
      <ItemEditorForm vm={vm} />
    </section>
  );
};

export default ItemEditorContainer;
export { CREATE_BARCODE_INPUT_ID };
