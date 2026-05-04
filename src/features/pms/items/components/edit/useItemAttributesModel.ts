// src/features/pms/items/components/edit/useItemAttributesModel.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchItemAttributeValues,
  replaceItemAttributeValues,
  type ItemAttributeValue,
  type ItemAttributeValueInput,
} from "../../api/itemAttributesOwnerApi";
import {
  fetchItemAttributeDefs,
  fetchItemAttributeOptions,
  fetchPmsCategories,
  type ItemAttributeDef,
  type ItemAttributeOption,
  type ProductKind,
} from "../../../master-data/api/masterDataApi";

type Banner = { kind: "success" | "error"; text: string } | null;

export type ItemAttributeDraftValue = {
  value_text: string;
  value_number: string;
  value_bool: boolean;
  value_option_ids: string[];
};

function emptyDraft(): ItemAttributeDraftValue {
  return {
    value_text: "",
    value_number: "",
    value_bool: false,
    value_option_ids: [],
  };
}

function errMsg(e: unknown, fallback: string): string {
  return e instanceof Error && e.message ? e.message : fallback;
}

function draftFromValue(value: ItemAttributeValue | undefined): ItemAttributeDraftValue {
  if (!value) return emptyDraft();

  return {
    value_text: value.value_text ?? "",
    value_number: value.value_number == null ? "" : String(value.value_number),
    value_bool: Boolean(value.value_bool),
    value_option_ids: Array.isArray(value.value_option_ids)
      ? value.value_option_ids.map((id) => String(id))
      : [],
  };
}

function sortDefs(defs: ItemAttributeDef[]): ItemAttributeDef[] {
  const productKindOrder: Record<string, number> = {
    COMMON: 0,
    FOOD: 1,
    SUPPLY: 2,
    OTHER: 3,
  };

  return [...defs].sort((a, b) => {
    const ak = productKindOrder[a.product_kind] ?? 99;
    const bk = productKindOrder[b.product_kind] ?? 99;
    if (ak !== bk) return ak - bk;
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    return a.code.localeCompare(b.code);
  });
}

function uniquePositiveIds(values: string[]): number[] {
  const ids: number[] = [];
  const seen = new Set<number>();

  for (const raw of values) {
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 0) continue;
    const id = Math.trunc(n);
    if (seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
  }

  return ids;
}

export function useItemAttributesModel(args: {
  itemId: number;
  categoryId?: number | null;
}) {
  const { itemId, categoryId } = args;

  const [defs, setDefs] = useState<ItemAttributeDef[]>([]);
  const [optionsByDefId, setOptionsByDefId] = useState<Record<number, ItemAttributeOption[]>>({});
  const [drafts, setDrafts] = useState<Record<number, ItemAttributeDraftValue>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<Banner>(null);

  const effectiveDefs = useMemo(() => sortDefs(defs), [defs]);

  const setDraft = useCallback((attributeDefId: number, patch: Partial<ItemAttributeDraftValue>) => {
    setDrafts((prev) => ({
      ...prev,
      [attributeDefId]: {
        ...(prev[attributeDefId] ?? emptyDraft()),
        ...patch,
      },
    }));
  }, []);

  const setOptionChecked = useCallback(
    (def: ItemAttributeDef, optionId: number, checked: boolean) => {
      setDrafts((prev) => {
        const current = prev[def.id] ?? emptyDraft();
        const optionText = String(optionId);

        if (def.selection_mode === "SINGLE") {
          return {
            ...prev,
            [def.id]: {
              ...current,
              value_option_ids: checked ? [optionText] : [],
            },
          };
        }

        const currentSet = new Set(current.value_option_ids);
        if (checked) {
          currentSet.add(optionText);
        } else {
          currentSet.delete(optionText);
        }

        return {
          ...prev,
          [def.id]: {
            ...current,
            value_option_ids: Array.from(currentSet),
          },
        };
      });
    },
    [],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    setBanner(null);

    try {
      const [allDefs, values, categories] = await Promise.all([
        fetchItemAttributeDefs({ active_only: true }),
        fetchItemAttributeValues(itemId),
        fetchPmsCategories(undefined, false),
      ]);

      const categoryProductKind: ProductKind | null =
        categoryId == null ? null : categories.find((category) => category.id === categoryId)?.product_kind ?? null;

      const filteredDefs = allDefs.filter((def) => {
        if (def.product_kind === "COMMON") return true;
        if (categoryProductKind != null && def.product_kind === categoryProductKind) return true;
        return false;
      });

      const optionDefs = filteredDefs.filter((def) => def.value_type === "OPTION");
      const optionPairs = await Promise.all(
        optionDefs.map(async (def) => [def.id, await fetchItemAttributeOptions(def.id, true)] as const),
      );

      const nextOptions: Record<number, ItemAttributeOption[]> = {};
      for (const [defId, rows] of optionPairs) {
        nextOptions[defId] = rows;
      }

      const valuesByDefId = new Map<number, ItemAttributeValue>();
      for (const value of values) {
        valuesByDefId.set(value.attribute_def_id, value);
      }

      const nextDrafts: Record<number, ItemAttributeDraftValue> = {};
      for (const def of filteredDefs) {
        nextDrafts[def.id] = draftFromValue(valuesByDefId.get(def.id));
      }

      setDefs(filteredDefs);
      setOptionsByDefId(nextOptions);
      setDrafts(nextDrafts);
    } catch (e) {
      setBanner({ kind: "error", text: errMsg(e, "加载商品属性失败") });
      setDefs([]);
      setOptionsByDefId({});
      setDrafts({});
    } finally {
      setLoading(false);
    }
  }, [categoryId, itemId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const buildPayload = useCallback((): { ok: true; values: ItemAttributeValueInput[] } | { ok: false; error: string } => {
    const values: ItemAttributeValueInput[] = [];

    for (const def of effectiveDefs) {
      const draft = drafts[def.id] ?? emptyDraft();

      if (def.value_type === "TEXT") {
        const text = draft.value_text.trim();
        if (!text) {
          if (def.is_item_required) return { ok: false, error: `${def.name_cn} 必填` };
          continue;
        }
        values.push({ attribute_def_id: def.id, value_text: text });
        continue;
      }

      if (def.value_type === "NUMBER") {
        const raw = draft.value_number.trim();
        if (!raw) {
          if (def.is_item_required) return { ok: false, error: `${def.name_cn} 必填` };
          continue;
        }

        const n = Number(raw);
        if (!Number.isFinite(n)) {
          return { ok: false, error: `${def.name_cn} 必须是数字` };
        }

        values.push({ attribute_def_id: def.id, value_number: n });
        continue;
      }

      if (def.value_type === "OPTION") {
        const optionIds = uniquePositiveIds(draft.value_option_ids);

        if (optionIds.length === 0) {
          if (def.is_item_required) return { ok: false, error: `${def.name_cn} 必填` };
          continue;
        }

        if (def.selection_mode === "SINGLE" && optionIds.length > 1) {
          return { ok: false, error: `${def.name_cn} 只能选择一个值` };
        }

        values.push({ attribute_def_id: def.id, value_option_ids: optionIds });
        continue;
      }

      if (def.value_type === "BOOL") {
        if (def.is_item_required || draft.value_bool) {
          values.push({ attribute_def_id: def.id, value_bool: Boolean(draft.value_bool) });
        }
        continue;
      }
    }

    return { ok: true, values };
  }, [drafts, effectiveDefs]);

  const save = useCallback(async (): Promise<boolean> => {
    const payload = buildPayload();
    if (!payload.ok) {
      setBanner({ kind: "error", text: payload.error });
      return false;
    }

    setSaving(true);
    setBanner(null);
    try {
      await replaceItemAttributeValues(itemId, payload.values);
      setBanner({ kind: "success", text: "商品属性已保存" });
      await refresh();
      return true;
    } catch (e) {
      setBanner({ kind: "error", text: errMsg(e, "保存商品属性失败") });
      return false;
    } finally {
      setSaving(false);
    }
  }, [buildPayload, itemId, refresh]);

  return {
    defs: effectiveDefs,
    optionsByDefId,
    drafts,
    loading,
    saving,
    banner,
    refresh,
    setDraft,
    setOptionChecked,
    save,
  };
}
