// src/features/pms/items/barcodes-panel/useItemBarcodesPanelModel.ts

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createItemBarcode,
  fetchItemBarcodeRows,
  setPrimaryBarcode,
  updateItemBarcode,
  type ItemBarcodeCompositeRow,
} from "../api/itemBarcodesOwnerApi";
import { fetchItemUoms, type ItemUom } from "../api/itemUomsOwnerApi";
import { getErrorMessage } from "./errors";

export type BarcodeUomOption = {
  id: number;
  label: string;
  ratio_to_base: number;
  is_base: boolean;
  is_purchase_default: boolean;
};

type UseItemBarcodesPanelModelArgs = {
  itemId: number;
  editingRow?: ItemBarcodeCompositeRow | null;
  reloadToken?: number;
  onSaved?: () => Promise<void> | void;
  onCancelEdit?: () => void;
};

function hasPrimary(list: ItemBarcodeCompositeRow[]): boolean {
  return list.some((row) => Boolean(row.is_primary));
}

function sortUoms(list: ItemUom[]): ItemUom[] {
  return [...list].sort((a, b) => {
    if (a.is_base !== b.is_base) return a.is_base ? -1 : 1;
    if (a.ratio_to_base !== b.ratio_to_base) return a.ratio_to_base - b.ratio_to_base;
    return a.id - b.id;
  });
}

function buildUomLabel(uom: ItemUom): string {
  const name = (uom.display_name ?? "").trim() || uom.uom;
  if (uom.is_base) return `${name}（基础包装）`;
  return `${name}（${uom.ratio_to_base} × 基础包装）`;
}

function buildUomOptions(uoms: ItemUom[]): BarcodeUomOption[] {
  return sortUoms(uoms).map((uom) => ({
    id: uom.id,
    label: buildUomLabel(uom),
    ratio_to_base: uom.ratio_to_base,
    is_base: uom.is_base,
    is_purchase_default: uom.is_purchase_default,
  }));
}

export function useItemBarcodesPanelModel(args: UseItemBarcodesPanelModelArgs) {
  const { itemId, editingRow, reloadToken, onSaved, onCancelEdit } = args;

  const [rows, setRows] = useState<ItemBarcodeCompositeRow[]>([]);
  const [uomOptions, setUomOptions] = useState<BarcodeUomOption[]>([]);
  const [selectedUomId, setSelectedUomId] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newCode, setNewCode] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEditMode = editingRow != null;
  const editingBarcodeId = editingRow?.barcode_id ?? null;

  const selectedUom = useMemo(
    () => uomOptions.find((x) => x.id === selectedUomId) ?? null,
    [uomOptions, selectedUomId],
  );

  const applyRows = useCallback((nextRows: ItemBarcodeCompositeRow[]) => {
    setRows(nextRows);
  }, []);

  const applyUoms = useCallback((uoms: ItemUom[]) => {
    const nextOptions = buildUomOptions(uoms);
    setUomOptions(nextOptions);

    setSelectedUomId((current) => {
      if (editingRow && editingRow.item_id === itemId) {
        return editingRow.item_uom_id;
      }
      if (current != null && nextOptions.some((x) => x.id === current)) return current;
      const base = nextOptions.find((x) => x.is_base) ?? null;
      return base?.id ?? nextOptions[0]?.id ?? null;
    });
  }, [editingRow, itemId]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextRows, nextUoms] = await Promise.all([
        fetchItemBarcodeRows(itemId, false),
        fetchItemUoms(itemId),
      ]);
      applyRows(nextRows);
      applyUoms(nextUoms);
    } catch (e: unknown) {
      setError(getErrorMessage(e, "刷新条码绑定失败"));
    } finally {
      setLoading(false);
    }
  }, [applyRows, applyUoms, itemId]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [nextRows, nextUoms] = await Promise.all([
          fetchItemBarcodeRows(itemId, false),
          fetchItemUoms(itemId),
        ]);
        if (cancelled) return;
        applyRows(nextRows);
        applyUoms(nextUoms);
      } catch (e: unknown) {
        if (!cancelled) {
          setError(getErrorMessage(e, "加载条码绑定失败"));
          setRows([]);
          setUomOptions([]);
          setSelectedUomId(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [itemId, reloadToken, applyRows, applyUoms]);

  useEffect(() => {
    if (editingRow && editingRow.item_id === itemId) {
      setSelectedUomId(editingRow.item_uom_id);
      setNewCode(editingRow.barcode);
      setIsPrimary(Boolean(editingRow.is_primary));
      setError(null);
      return;
    }
    setNewCode("");
    setIsPrimary(false);
    setError(null);
  }, [editingRow, itemId]);

  const canSubmit = useMemo(() => {
    if (saving) return false;
    if (!newCode.trim()) return false;
    if (selectedUomId == null || selectedUomId <= 0) return false;
    return true;
  }, [saving, newCode, selectedUomId]);

  const cancelEdit = useCallback(() => {
    setError(null);
    setNewCode("");
    setIsPrimary(false);
    onCancelEdit?.();
  }, [onCancelEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const code = newCode.trim();
    if (!code) {
      setError("条码不能为空");
      return;
    }

    if (selectedUomId == null || selectedUomId <= 0) {
      setError("请选择包装单位");
      return;
    }

    const conflictRow = rows.find(
      (row) =>
        row.item_uom_id === selectedUomId &&
        row.barcode_id !== (editingBarcodeId ?? -1),
    );
    if (conflictRow) {
      setError("当前包装单位已绑定条码，请从下方列表进入修改，不允许同一包装重复绑码。");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (isEditMode && editingBarcodeId != null) {
        await updateItemBarcode(editingBarcodeId, {
          item_uom_id: selectedUomId,
          barcode: code,
          symbology: editingRow?.symbology ?? "CUSTOM",
          is_primary: isPrimary,
        });
      } else {
        const created = await createItemBarcode({
          item_uom_id: selectedUomId,
          barcode: code,
          symbology: "CUSTOM",
          active: true,
        });

        const shouldAutoPrimary =
          Boolean(isPrimary) || (Boolean(selectedUom?.is_base) && !hasPrimary(rows));

        if (shouldAutoPrimary) {
          await setPrimaryBarcode(created.id);
        }
      }

      await refresh();
      await Promise.resolve(onSaved?.());

      if (isEditMode) {
        cancelEdit();
      } else {
        setNewCode("");
        setIsPrimary(false);
      }
    } catch (e: unknown) {
      setError(getErrorMessage(e, isEditMode ? "修改条码绑定失败" : "新增条码绑定失败"));
    } finally {
      setSaving(false);
    }
  };

  return {
    itemId,
    rows,
    uomOptions,
    selectedUomId,
    selectedUom,

    loading,
    error,

    newCode,
    isPrimary,
    saving,
    canSubmit,
    isEditMode,

    setNewCode,
    setSelectedUomId,
    setIsPrimary,
    setError,

    refresh,
    cancelEdit,
    handleSubmit,
  };
}
