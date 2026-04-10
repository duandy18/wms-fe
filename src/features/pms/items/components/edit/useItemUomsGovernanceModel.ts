// src/features/pms/items/components/edit/useItemUomsGovernanceModel.ts
//
// 拆分说明：
// - 本文件承接原 ItemUomsGovernanceSection.tsx 里的状态、接口调用、校验、保存与删除逻辑
// - 这里只放 model / hook，不放页面 JSX
// - 这样后续再改默认包装规则、删除保护、列表刷新时，不会继续把页面文件撑爆

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { apiDelete } from "../../../../../lib/api";
import {
  createItemUom,
  fetchItemUoms,
  updateItemUom,
  type ItemUom,
} from "../../api/itemUomsOwnerApi";
import { parsePositiveIntOrNull, pickBaseUom } from "../../editor/itemEditorUtils";
import {
  buildExtraDrafts,
  makeDraftKey,
  sortUoms,
  trim,
  type ExtraPackageDraft,
} from "./itemUomsGovernanceUtils";

type UseItemUomsGovernanceModelArgs = {
  itemId: number;
  onChanged?: () => Promise<void> | void;
};

export function useItemUomsGovernanceModel(
  args: UseItemUomsGovernanceModelArgs,
) {
  const { itemId, onChanged } = args;

  const [uoms, setUoms] = useState<ItemUom[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [baseUom, setBaseUom] = useState("");
  const [extraPackages, setExtraPackages] = useState<ExtraPackageDraft[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const list = await fetchItemUoms(itemId);
      setUoms(list);

      const base = pickBaseUom(list);
      setBaseUom(base?.uom ?? "");
      setExtraPackages(buildExtraDrafts(list));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "加载包装方式失败";
      setError(msg);
      setSuccess(null);
      setUoms([]);
      setBaseUom("");
      setExtraPackages([]);
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const rows = useMemo(() => sortUoms(uoms), [uoms]);

  const addExtraPackageRow = useCallback(() => {
    setExtraPackages((prev) => [
      ...prev,
      { key: makeDraftKey(), id: null, name: "", ratio: "" },
    ]);
  }, []);

  const updateExtraPackageRow = useCallback(
    (key: string, patch: Partial<ExtraPackageDraft>) => {
      setExtraPackages((prev) =>
        prev.map((row) => (row.key === key ? { ...row, ...patch } : row)),
      );
    },
    [],
  );

  const removeDraftRow = useCallback((key: string) => {
    setExtraPackages((prev) => prev.filter((row) => row.key !== key));
  }, []);

  const handleDeleteExtraPackage = useCallback(
    async (row: ExtraPackageDraft) => {
      if (row.id == null) {
        removeDraftRow(row.key);
        return;
      }

      if (!window.confirm(`确认删除包装「${row.name || "未命名包装"}」吗？`)) return;

      setSaving(true);
      setError(null);
      setSuccess(null);

      try {
        await apiDelete(`/item-uoms/${row.id}`);
        await refresh();
        setSuccess("包装已删除");
        await Promise.resolve(onChanged?.());
      } catch (e) {
        const msg = e instanceof Error ? e.message : "删除包装失败";
        setError(msg);
        setSuccess(null);
      } finally {
        setSaving(false);
      }
    },
    [onChanged, refresh, removeDraftRow],
  );

  const validate = useCallback((): string | null => {
    const nextBase = trim(baseUom);
    if (!nextBase) return "基础包装不能为空";

    const seen = new Set<string>();
    for (const row of extraPackages) {
      const name = trim(row.name);
      const ratio = parsePositiveIntOrNull(row.ratio);

      // 允许空白草稿行存在，但保存时要求删掉或填完整
      if (!name && !trim(row.ratio)) continue;

      if (!name) return "扩展包装名称不能为空";
      if (name === nextBase) return "扩展包装名称不能与基础包装相同";
      if (seen.has(name)) return "扩展包装名称不能重复";
      seen.add(name);

      if (ratio == null) return "扩展包装倍率必须是整数";
      if (ratio < 2) return "扩展包装倍率必须 ≥ 2";
    }

    return null;
  }, [baseUom, extraPackages]);

  const handleSave = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const validationError = validate();
      if (validationError) {
        setError(validationError);
        setSuccess(null);
        return;
      }

      const nextBase = trim(baseUom);
      const effectiveRows = extraPackages.filter(
        (row) => trim(row.name) || trim(row.ratio),
      );

      setSaving(true);
      setError(null);
      setSuccess(null);

      try {
        const current = await fetchItemUoms(itemId);
        const currentBase = pickBaseUom(current);

        // 1) 先确保基础包装存在且正确
        if (currentBase) {
          const needBaseUpdate =
            currentBase.uom !== nextBase ||
            currentBase.ratio_to_base !== 1 ||
            currentBase.is_base !== true ||
            currentBase.is_inbound_default !== true ||
            currentBase.is_outbound_default !== true;

          if (needBaseUpdate) {
            await updateItemUom(currentBase.id, {
              item_id: itemId,
              uom: nextBase,
              ratio_to_base: 1,
              is_base: true,
              is_inbound_default: true,
              is_outbound_default: true,
            });
          }
        } else {
          await createItemUom({
            item_id: itemId,
            uom: nextBase,
            ratio_to_base: 1,
            is_base: true,
            is_purchase_default: false,
            is_inbound_default: true,
            is_outbound_default: true,
          });
        }

        // 2) 刷新一次，拿到最新基础包装与现有扩展包装
        const refreshed = await fetchItemUoms(itemId);
        const refreshedBase = pickBaseUom(refreshed);
        if (!refreshedBase) {
          throw new Error("缺少基础包装，保存失败");
        }

        const existingExtras = refreshed.filter((u) => !u.is_base);
        const desiredNames = new Set(effectiveRows.map((row) => trim(row.name)));

        // 3) 先更新 / 新建扩展包装
        for (const row of effectiveRows) {
          const name = trim(row.name);
          const ratio = parsePositiveIntOrNull(row.ratio) as number;

          const matchById =
            row.id != null ? existingExtras.find((u) => u.id === row.id) ?? null : null;
          const matchByName =
            matchById == null
              ? existingExtras.find((u) => u.uom === name) ?? null
              : null;
          const target = matchById ?? matchByName;

          if (target) {
            await updateItemUom(target.id, {
              item_id: itemId,
              uom: name,
              ratio_to_base: ratio,
              is_base: false,
            });
          } else {
            await createItemUom({
              item_id: itemId,
              uom: name,
              ratio_to_base: ratio,
              is_base: false,
              is_purchase_default: false,
              is_inbound_default: false,
              is_outbound_default: false,
            });
          }
        }

        // 4) 如果有旧扩展包装已被用户从草稿里移除，这里不自动物理删除
        //    删除动作必须显式点击“删除”，避免保存时误删历史包装
        for (const oldRow of existingExtras) {
          const oldName = trim(oldRow.uom);
          if (!desiredNames.has(oldName)) {
            // no-op
          }
        }

        await refresh();
        setSuccess("包装方式已保存");
        await Promise.resolve(onChanged?.());
      } catch (e) {
        const msg = e instanceof Error ? e.message : "保存包装方式失败";
        setError(msg);
        setSuccess(null);
      } finally {
        setSaving(false);
      }
    },
    [baseUom, extraPackages, itemId, onChanged, refresh, validate],
  );

  return {
    uoms,
    rows,
    loading,
    saving,
    error,
    success,
    baseUom,
    setBaseUom,
    extraPackages,
    refresh,
    addExtraPackageRow,
    updateExtraPackageRow,
    handleDeleteExtraPackage,
    handleSave,
  };
}
