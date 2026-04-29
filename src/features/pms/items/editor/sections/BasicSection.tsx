// src/features/pms/items/editor/sections/BasicSection.tsx

import React, { useEffect, useMemo, useState } from "react";
import type { ItemEditorVm } from "../useItemEditor";
import {
  fetchPmsBrands,
  fetchPmsCategories,
  type PmsBrand,
  type PmsCategory,
} from "../../../master-data/api/masterDataApi";

const FieldError: React.FC<{ msg?: string }> = ({ msg }) =>
  msg ? <div className="mt-1 text-xs text-red-600">{msg}</div> : null;

function optionLabelForCategory(category: PmsCategory): string {
  return `${category.path_code} / ${category.category_name}`;
}

const BasicSection: React.FC<{ vm: ItemEditorVm }> = ({ vm }) => {
  const { form, setForm, fieldErrors } = vm;
  const skuReadonly = vm.mode === "edit";

  const [brands, setBrands] = useState<PmsBrand[]>([]);
  const [categories, setCategories] = useState<PmsCategory[]>([]);
  const [loadingMaster, setLoadingMaster] = useState(false);
  const [masterError, setMasterError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMasterData() {
      setLoadingMaster(true);
      setMasterError(null);
      try {
        const [brandRows, categoryRows] = await Promise.all([
          fetchPmsBrands(true),
          fetchPmsCategories(undefined, true),
        ]);

        if (cancelled) return;
        setBrands(brandRows);
        setCategories(categoryRows);
      } catch (err) {
        if (!cancelled) {
          setMasterError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (!cancelled) setLoadingMaster(false);
      }
    }

    void loadMasterData();

    return () => {
      cancelled = true;
    };
  }, []);

  const leafCategories = useMemo(
    () =>
      categories
        .filter((x) => x.is_leaf && x.is_active)
        .sort((a, b) => a.path_code.localeCompare(b.path_code)),
    [categories],
  );

  return (
    <div className="space-y-2">
      {masterError ? (
        <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          品牌/分类加载失败：{masterError}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <input
            className="rounded border px-3 py-2 w-full bg-white font-mono disabled:bg-slate-100 disabled:text-slate-500"
            placeholder="SKU（必填，最多128字符，可从SKU编码页生成）"
            maxLength={128}
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })}
            disabled={vm.saving || skuReadonly}
          />
          <FieldError msg={fieldErrors.sku} />
          {skuReadonly ? (
            <div className="mt-1 text-xs text-slate-500">
              当前主 SKU 需通过下方「SKU 编码管理」切换，不能在商品基础字段里直接修改。
            </div>
          ) : null}
        </div>

        <div>
          <input
            className="rounded border px-3 py-2 w-full bg-white"
            placeholder="商品名称"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            disabled={vm.saving}
          />
          <FieldError msg={fieldErrors.name} />
        </div>

        <div>
          <input
            className="rounded border px-3 py-2 w-full bg-white"
            placeholder="规格（可选，如：85g*12袋）"
            value={form.spec}
            onChange={(e) => setForm({ ...form, spec: e.target.value })}
            disabled={vm.saving}
          />
          <FieldError msg={fieldErrors.spec} />
        </div>

        <div>
          <select
            className="rounded border px-3 py-2 w-full bg-white"
            value={form.brand_id}
            onChange={(e) => setForm({ ...form, brand_id: e.target.value })}
            disabled={vm.saving || loadingMaster}
          >
            <option value="">选择品牌（可选）</option>
            {brands.map((brand) => (
              <option key={brand.id} value={String(brand.id)}>
                {brand.name_cn} / {brand.code}
              </option>
            ))}
          </select>
          <FieldError msg={fieldErrors.brand_id} />
        </div>

        <div>
          <select
            className="rounded border px-3 py-2 w-full bg-white"
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            disabled={vm.saving || loadingMaster}
          >
            <option value="">选择内部分类（可选）</option>
            {leafCategories.map((category) => (
              <option key={category.id} value={String(category.id)}>
                {optionLabelForCategory(category)}
              </option>
            ))}
          </select>
          <FieldError msg={fieldErrors.category_id} />
        </div>
      </div>
    </div>
  );
};

export default BasicSection;
