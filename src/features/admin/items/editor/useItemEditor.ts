// src/features/admin/items/editor/useItemEditor.ts

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { Supplier } from "../../suppliers/api";
import type { Item } from "../../../../contracts/item/contract";
import { updateItem } from "../api";
import { runCreateItem, runPostCreateWrites, submitCreateItem } from "../create/submit";
import type { FormState, UomDraft } from "../create/types";
import { errMsg } from "../itemsHelpers";
import { type Flash, type FieldErrors, validateCreate, validateEdit } from "./schema";
import { fetchItemUoms } from "../../../../master-data/itemUomsApi";
import { syncItemUomsForEdit } from "./syncItemUomsForEdit";
import { syncItemBarcodesForEdit } from "./syncItemBarcodesForEdit";
import { draftFromItemUom, pickBaseUom, pickPurchaseDefaultUom } from "./itemEditorUtils";
import { buildEditForm } from "./buildEditForm";
import type { ItemEditorVm, ItemEditorMode } from "./itemEditorTypes";

export type { ItemEditorVm, ItemEditorMode };

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

  const emptyFormRef = useRef<FormState>(emptyForm);
  useEffect(() => {
    emptyFormRef.current = emptyForm;
  }, [emptyForm]);

  const initialEditFormRef = useRef<FormState | null>(null);

  // 1) items 基础字段回填（抽成纯函数 buildEditForm）
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
  }, [selectedItem, selectedPrimaryBarcode]);

  // 2) item_uoms 回填（编辑时显示真实值）
  const selectedItemId = selectedItem?.id ?? null;
  const uomsLoadSeq = useRef(0);

  useEffect(() => {
    if (selectedItemId == null) return;

    const itemIdNum: number = selectedItemId;

    uomsLoadSeq.current += 1;
    const seq = uomsLoadSeq.current;

    async function run() {
      try {
        const uoms = await fetchItemUoms(itemIdNum);
        if (uomsLoadSeq.current !== seq) return;

        const base = pickBaseUom(uoms);
        const purchase = pickPurchaseDefaultUom(uoms);

        setForm((cur) => {
          if (cur.uoms.length > 0) return cur;

          const nextUoms: UomDraft[] = [];
          if (base) nextUoms.push(draftFromItemUom(base));
          if (purchase && !purchase.is_base) nextUoms.push(draftFromItemUom(purchase));

          return { ...cur, uoms: nextUoms };
        });
      } catch (e) {
        console.error("fetchItemUoms failed:", e);
      }
    }

    void run();
  }, [selectedItemId]);

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

  const canSubmit = useMemo(() => {
    if (saving) return false;
    if (supLoading) return false;
    if (suppliers.length === 0) return false;
    return true;
  }, [saving, supLoading, suppliers.length]);

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

          await runPostCreateWrites({
            itemId: createdItem.id,
            uomsToCreate: r.post.uomsToCreate,
            barcodesToCreate: r.post.barcodesToCreate,
          });

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

      await syncItemUomsForEdit({ itemId: selectedItem.id, form });
      await syncItemBarcodesForEdit({ itemId: selectedItem.id, form });

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
    resetToEditOriginal,
    submit,
  };
}
