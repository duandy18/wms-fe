// src/features/admin/items/editor/useItemEditor.ts

import { useEffect, useMemo, useState } from "react";
import type { Supplier } from "../../suppliers/api";
import type { Item } from "../../../../contracts/item/contract";
import { updateItem } from "../api";
import { runCreateItem, submitCreateItem } from "../create/submit";
import type { FormState } from "../create/types";
import { errMsg } from "../itemsHelpers";
import {
  type Flash,
  type FieldErrors,
  type ItemFormValues,
  validateCreate,
  validateEdit,
} from "./schema";

export type ItemEditorMode = "create" | "edit";

export type ItemEditorVm = {
  mode: ItemEditorMode;
  editorTitle: string;

  suppliers: Supplier[];
  supLoading: boolean;
  supError: string | null;

  selectedItem: Item | null;
  selectedPrimaryBarcode: string;

  form: FormState;
  setForm: (next: FormState) => void;

  saving: boolean;
  error: string | null;
  flash: Flash;
  fieldErrors: FieldErrors;

  created: { id: number; sku: string } | null;

  canSubmit: boolean;

  resetToCreate: () => void;
  submit: (e: React.FormEvent) => Promise<void>;
};

export default function useItemEditor(args: {
  selectedItem: Item | null;
  selectedPrimaryBarcode: string;

  suppliers: Supplier[];
  supLoading: boolean;
  supError: string | null;

  emptyForm: FormState;

  onAfterSaved: () => Promise<void>;
  onResetToCreate: () => void;
}): ItemEditorVm {
  const {
    selectedItem,
    selectedPrimaryBarcode,
    suppliers,
    supLoading,
    supError,
    emptyForm,
    onAfterSaved,
    onResetToCreate,
  } = args;

  const mode: ItemEditorMode = selectedItem ? "edit" : "create";
  const editorTitle = mode === "edit" ? "编辑商品" : "新建商品";

  const [form, setForm] = useState<FormState>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<Flash>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [created, setCreated] = useState<{ id: number; sku: string } | null>(null);

  useEffect(() => {
    if (!selectedItem) return;

    setError(null);
    setFlash(null);
    setFieldErrors({});
    setCreated(null);

    setForm({
      ...emptyForm,
      name: selectedItem.name ?? "",
      spec: (selectedItem.spec ?? "").trim(),
      brand: (selectedItem.brand ?? "").trim(),
      category: (selectedItem.category ?? "").trim(),

      supplier_id: selectedItem.supplier_id == null ? "" : String(selectedItem.supplier_id),
      weight_kg: selectedItem.weight_kg == null ? "" : String(selectedItem.weight_kg),

      uom_mode: "preset",
      uom_preset: (selectedItem.uom ?? "").trim(),
      uom_custom: "",

      shelf_mode: selectedItem.has_shelf_life ? "yes" : "no",
      shelf_life_value: selectedItem.shelf_life_value == null ? "" : String(selectedItem.shelf_life_value),
      shelf_life_unit: (selectedItem.shelf_life_unit ?? "MONTH") as "MONTH" | "DAY",

      status: selectedItem.enabled ? "enabled" : "disabled",

      barcode: selectedPrimaryBarcode,
    });
  }, [selectedItem, selectedPrimaryBarcode, emptyForm]);

  const resetToCreate = () => {
    if (saving) return;
    onResetToCreate();
    setForm({ ...emptyForm });
    setError(null);
    setFlash(null);
    setFieldErrors({});
    setCreated(null);
  };

  const canSubmit = useMemo(() => {
    if (saving) return false;
    if (supLoading) return false;
    if (suppliers.length === 0) return false;
    return true;
  }, [saving, supLoading, suppliers.length]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFlash(null);
    setFieldErrors({});
    setCreated(null);

    if (mode === "create") {
      const prepared = await submitCreateItem({ form, suppliers, supLoading });

      // 失败分支
      if ("ok" in prepared && !prepared.ok) {
        setError(prepared.error);
        return;
      }

      // 只在存在 body 时继续
      if ("body" in prepared) {
        const r = validateCreate(form as unknown as ItemFormValues);
        if (!r.ok) {
          setFieldErrors(r.fieldErrors);
          return;
        }

        setSaving(true);
        try {
          const createdItem = await runCreateItem(prepared.body);
          setCreated({ id: createdItem.id, sku: createdItem.sku });
          setFlash({ kind: "success", text: "创建成功" });
          setForm({ ...emptyForm });
          await onAfterSaved();
        } catch (ex: unknown) {
          const msg = ex instanceof Error ? ex.message : "创建商品失败";
          setError(msg);
          setFlash({ kind: "error", text: msg });
        } finally {
          setSaving(false);
        }
      }

      return;
    }

    if (!selectedItem) return;

    const r = validateEdit(form as unknown as ItemFormValues);
    if (!r.ok) {
      setFieldErrors(r.fieldErrors);
      return;
    }

    setSaving(true);
    try {
      await updateItem(selectedItem.id, r.body);
      await onAfterSaved();
      setFlash({ kind: "success", text: "保存成功" });
      onResetToCreate();
      setForm({ ...emptyForm });
    } catch (ex: unknown) {
      const msg = errMsg(ex, "保存失败");
      setError(msg);
      setFlash({ kind: "error", text: msg });
    } finally {
      setSaving(false);
    }
  };

  return {
    mode,
    editorTitle,

    suppliers,
    supLoading,
    supError,

    selectedItem,
    selectedPrimaryBarcode,

    form,
    setForm,

    saving,
    error,
    flash,
    fieldErrors,

    created,

    canSubmit,

    resetToCreate,
    submit,
  };
}
