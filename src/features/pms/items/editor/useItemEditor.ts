// src/features/pms/items/editor/useItemEditor.ts

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { SupplierBasic } from "@/domains/pms/public/contracts/supplierBasic";
import type { Item } from "../../../../contracts/item/contract";
import { updateItem } from "../api/itemsOwnerApi";
import { runCreateItem, submitCreateItem } from "../create/submit";
import type { FormState } from "../create/types";
import { errMsg } from "../utils/itemsHelpers";
import { type Flash, type FieldErrors, validateCreate, validateEdit } from "./schema";
import { buildEditForm } from "./buildEditForm";
import type { ItemEditorVm, ItemEditorMode } from "./itemEditorTypes";

export type { ItemEditorVm, ItemEditorMode };

export default function useItemEditor(args: {
  selectedItem: Item | null;

  suppliers: SupplierBasic[];
  supLoading: boolean;
  supError: string | null;

  emptyForm: FormState;

  onAfterSaved: () => Promise<void>;
  onResetToCreate: () => void;
}): ItemEditorVm {
  const {
    selectedItem,
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

  const emptyFormRef = useRef<FormState>(emptyForm);
  useEffect(() => {
    emptyFormRef.current = emptyForm;
  }, [emptyForm]);

  const initialEditFormRef = useRef<FormState | null>(null);

  useEffect(() => {
    if (!selectedItem) {
      initialEditFormRef.current = null;
      return;
    }

    setError(null);
    setFlash(null);
    setFieldErrors({});
    setCreated(null);

    const nextForm = buildEditForm({
      selectedItem,
      emptyForm: emptyFormRef.current,
    });

    setForm(nextForm);
    initialEditFormRef.current = { ...nextForm };
  }, [selectedItem]);

  const resetToCreate = () => {
    if (saving) return;
    onResetToCreate();
    setForm({ ...emptyFormRef.current });
    setError(null);
    setFlash(null);
    setFieldErrors({});
    setCreated(null);
    initialEditFormRef.current = null;
  };

  const resetToEditOriginal = () => {
    if (saving) return;
    if (!selectedItem) return;
    const snap = initialEditFormRef.current;
    if (!snap) return;

    setForm({ ...snap });
    setError(null);
    setFlash(null);
    setFieldErrors({});
    setCreated(null);
  };

  const refreshAfterExternalChange = async () => {
    await onAfterSaved();
  };

  const canSubmit = useMemo(() => {
    if (saving) return false;
    if (supLoading) return false;
    return true;
  }, [saving, supLoading]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    setError(null);
    setFlash(null);
    setFieldErrors({});
    setCreated(null);

    if (mode === "create") {
      const prepared = await submitCreateItem({ form, suppliers, supLoading });

      if ("ok" in prepared && !prepared.ok) {
        setError(prepared.error);
        return;
      }

      if ("body" in prepared) {
        const r = validateCreate(form);
        if (!r.ok) {
          setFieldErrors(r.fieldErrors);
          return;
        }

        setSaving(true);
        try {
          const createdItem = await runCreateItem(prepared.body);
          setCreated({ id: createdItem.id, sku: createdItem.sku });
          setFlash({ kind: "success", text: "创建成功" });
          setForm({ ...emptyFormRef.current });

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

    const r = validateEdit(form);
    if (!r.ok) {
      setFieldErrors(r.fieldErrors);
      return;
    }

    setSaving(true);
    try {
      await updateItem(selectedItem.id, r.body);

      await onAfterSaved();
      setFlash({ kind: "success", text: "保存成功" });

      initialEditFormRef.current = { ...form };

      onResetToCreate();
      setForm({ ...emptyFormRef.current });
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

    form,
    setForm,

    saving,
    error,
    flash,
    fieldErrors,

    created,

    canSubmit,

    resetToCreate,
    resetToEditOriginal,
    refreshAfterExternalChange,
    submit,
  };
}
