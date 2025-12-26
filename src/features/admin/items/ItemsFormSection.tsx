// src/features/admin/items/ItemsFormSection.tsx
// 新建商品表单 + SKU 生成器（v2：记忆 + 自动编号），使用 ItemsStore 管理部分状态。

import React, { useEffect, useMemo, useState } from "react";
import { createItem } from "./api";
import type { Item } from "./api";
import { useItemsStore } from "./itemsStore";

import { UI } from "./form/ui";
import type { FormState, SkuParts } from "./form/types";
import { EMPTY_FORM } from "./form/types";

import { loadSkuPartsFromStorage, saveSkuPartsToStorage } from "./form/skuStorage";
import { buildPreviewSku, buildSkuPrefix, buildFinalSkuOrError, nextSerial } from "./form/skuUtils";

import ItemCreateFormCard from "./form/ItemCreateFormCard";
import SkuBuilderCard from "./form/SkuBuilderCard";

type ApiErrorShape = {
  message?: string;
  response?: {
    data?: {
      detail?: string;
    };
  };
};

const getErrorMessage = (e: unknown, fallback: string): string => {
  const err = e as ApiErrorShape;
  return err?.response?.data?.detail ?? err?.message ?? fallback;
};

const ItemsFormSection: React.FC = () => {
  const scannedBarcode = useItemsStore((s) => s.scannedBarcode);
  const loadItems = useItemsStore((s) => s.loadItems);
  const items = useItemsStore((s) => s.items);

  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM });
  const [skuParts, setSkuParts] = useState<SkuParts>(() => loadSkuPartsFromStorage());

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // 保证 useMemo 依赖不乱：先解构 serial 出来
  const { serial } = skuParts;

  // skuParts 变化时写回 localStorage
  useEffect(() => {
    saveSkuPartsToStorage(skuParts);
  }, [skuParts]);

  // 扫描带来的条码 → 预填主条码（仅当表单还没填时）
  useEffect(() => {
    if (scannedBarcode && !form.barcode) {
      setForm((prev) => ({ ...prev, barcode: scannedBarcode }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scannedBarcode]);

  function updateForm<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateSkuPart<K extends keyof SkuParts>(field: K, value: SkuParts[K]) {
    setSkuParts((prev) => ({ ...prev, [field]: value }));
  }

  // SKU 前缀
  const skuPrefix = useMemo(() => buildSkuPrefix(skuParts), [skuParts]);

  // SKU 预览
  const previewSku = useMemo(() => buildPreviewSku(skuPrefix, serial), [skuPrefix, serial]);

  // 是否与已有 SKU 冲突
  const skuConflict = useMemo(
    () => (previewSku ? items.some((it: Item) => it.sku === previewSku) : false),
    [items, previewSku],
  );

  const handleBuildSku = () => {
    setSaveError(null);

    const r = buildFinalSkuOrError(skuPrefix, serial);
    if (r.error) {
      setSaveError(r.error);
      return;
    }
    const finalSku = r.sku ?? "";

    if (items.some((it) => it.sku === finalSku)) {
      setSaveError(`SKU 已存在：${finalSku}，请更换序号`);
      return;
    }

    setForm((prev) => ({ ...prev, sku: finalSku }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);

    const sku = form.sku.trim();
    const name = form.name.trim();

    if (!sku) {
      setSaveError("SKU 必填（可先用右侧生成 SKU 再调整）。");
      return;
    }
    if (!name) {
      setSaveError("商品名称必填。");
      return;
    }

    // 解析重量
    let weight_kg: number | null = null;
    const w = form.weight_kg.trim();
    if (w) {
      const num = Number(w);
      if (!Number.isFinite(num) || num < 0) {
        setSaveError("单件重量(kg) 必须是大于等于 0 的数字");
        return;
      }
      weight_kg = num;
    }

    setSaving(true);
    try {
      await createItem({
        sku,
        name,
        spec: form.spec.trim() || undefined,
        uom: form.uom.trim() || undefined,
        barcode: form.barcode.trim() || undefined,
        enabled: form.enabled,
        weight_kg,
      });

      // 表单重置
      setForm({ ...EMPTY_FORM });

      // SKU 片段保留大部分，只自动递增序号
      setSkuParts((prev) => ({ ...prev, serial: nextSerial(prev.serial) }));

      await loadItems();
    } catch (e: unknown) {
      console.error("createItem failed", e);
      setSaveError(getErrorMessage(e, "创建商品失败"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={UI.wrap}>
      {/* 左：新建商品表单 */}
      <ItemCreateFormCard form={form} saving={saving} saveError={saveError} onChange={updateForm} onSubmit={handleSubmit} />

      {/* 右：SKU 生成器 */}
      <SkuBuilderCard
        skuParts={skuParts}
        skuPrefix={skuPrefix}
        previewSku={previewSku}
        skuConflict={skuConflict}
        onChange={updateSkuPart}
        onBuildSku={handleBuildSku}
      />
    </section>
  );
};

export default ItemsFormSection;
