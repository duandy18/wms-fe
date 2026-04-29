// src/features/pms/sku-coding/pages/SkuCodingDictionariesPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  createSkuBusinessCategory,
  createSkuCodeBrand,
  createSkuCodeTerm,
  disableSkuBusinessCategory,
  disableSkuCodeBrand,
  disableSkuCodeTerm,
  enableSkuBusinessCategory,
  enableSkuCodeBrand,
  enableSkuCodeTerm,
  fetchSkuBusinessCategories,
  fetchSkuCodeBrands,
  fetchSkuCodeTermGroups,
  fetchSkuCodeTerms,
  updateSkuBusinessCategory,
  updateSkuCodeBrand,
  updateSkuCodeTerm,
  type ProductKind,
  type SkuBusinessCategory,
  type SkuCodeBrand,
  type SkuCodeTerm,
  type SkuCodeTermGroup,
} from "../api/skuCodingApi";

type TabKey = "BRANDS" | "CATEGORIES" | "TERMS";

const inputCls =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100";
const labelCls = "mb-1 block text-xs font-medium text-slate-600";
const cardCls = "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm";
const smallBtnCls =
  "rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-700 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800 disabled:cursor-not-allowed disabled:opacity-50";
const dangerBtnCls =
  "rounded-lg border border-red-200 bg-white px-2.5 py-1 text-xs text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50";

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function groupLabel(group: SkuCodeTermGroup): string {
  return `${group.product_kind} / ${group.group_name} / ${group.group_code}`;
}

function statusLabel(active: boolean): string {
  return active ? "启用" : "停用";
}

function statusClass(active: boolean): string {
  return active
    ? "inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700"
    : "inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-500";
}

function parseNumberInput(v: string): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function SkuCodingDictionariesPage() {
  const [tab, setTab] = useState<TabKey>("BRANDS");
  const [brands, setBrands] = useState<SkuCodeBrand[]>([]);
  const [categories, setCategories] = useState<SkuBusinessCategory[]>([]);
  const [groups, setGroups] = useState<SkuCodeTermGroup[]>([]);
  const [terms, setTerms] = useState<SkuCodeTerm[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  const [editingBrand, setEditingBrand] = useState<SkuCodeBrand | null>(null);
  const [brandName, setBrandName] = useState("");
  const [brandCode, setBrandCode] = useState("");
  const [brandSortOrder, setBrandSortOrder] = useState(0);
  const [brandRemark, setBrandRemark] = useState("");

  const [editingCategory, setEditingCategory] = useState<SkuBusinessCategory | null>(null);
  const [categoryKind, setCategoryKind] = useState<ProductKind>("FOOD");
  const [categoryLevel, setCategoryLevel] = useState(1);
  const [categoryParentId, setCategoryParentId] = useState<number>(0);
  const [categoryName, setCategoryName] = useState("");
  const [categoryCode, setCategoryCode] = useState("");
  const [categoryIsLeaf, setCategoryIsLeaf] = useState(false);
  const [categorySortOrder, setCategorySortOrder] = useState(0);
  const [categoryRemark, setCategoryRemark] = useState("");

  const [editingTerm, setEditingTerm] = useState<SkuCodeTerm | null>(null);
  const [termGroupId, setTermGroupId] = useState<number>(0);
  const [termName, setTermName] = useState("");
  const [termCode, setTermCode] = useState("");
  const [termSortOrder, setTermSortOrder] = useState(0);
  const [termRemark, setTermRemark] = useState("");

  const parentOptions = useMemo(
    () =>
      categories.filter(
        (x) =>
          x.product_kind === categoryKind &&
          x.level === categoryLevel - 1 &&
          x.is_active,
      ),
    [categories, categoryKind, categoryLevel],
  );

  const groupMap = useMemo(() => {
    const out = new Map<number, SkuCodeTermGroup>();
    for (const group of groups) out.set(group.id, group);
    return out;
  }, [groups]);

  const sortedBrands = useMemo(
    () =>
      [...brands].sort((a, b) => {
        const order = a.sort_order - b.sort_order;
        if (order !== 0) return order;
        return a.code.localeCompare(b.code);
      }),
    [brands],
  );

  const sortedCategories = useMemo(
    () =>
      [...categories].sort((a, b) => {
        const kind = a.product_kind.localeCompare(b.product_kind);
        if (kind !== 0) return kind;
        const level = a.level - b.level;
        if (level !== 0) return level;
        const order = a.sort_order - b.sort_order;
        if (order !== 0) return order;
        return a.path_code.localeCompare(b.path_code);
      }),
    [categories],
  );

  const sortedTerms = useMemo(
    () =>
      [...terms].sort((a, b) => {
        const group = a.group_id - b.group_id;
        if (group !== 0) return group;
        const order = a.sort_order - b.sort_order;
        if (order !== 0) return order;
        return a.code.localeCompare(b.code);
      }),
    [terms],
  );

  async function reload() {
    setLoading(true);
    setError(null);
    try {
      const [brandRows, categoryRows, groupRows, termRows] = await Promise.all([
        fetchSkuCodeBrands(false),
        fetchSkuBusinessCategories(undefined, false),
        fetchSkuCodeTermGroups(undefined, false),
        fetchSkuCodeTerms(undefined, false),
      ]);

      setBrands(brandRows);
      setCategories(categoryRows);
      setGroups(groupRows);
      setTerms(termRows);

      setTermGroupId((prev) => (prev > 0 ? prev : groupRows[0]?.id ?? 0));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
  }, []);

  function clearMessages() {
    setError(null);
    setHint(null);
  }

  function resetBrandForm() {
    setEditingBrand(null);
    setBrandName("");
    setBrandCode("");
    setBrandSortOrder(0);
    setBrandRemark("");
  }

  function resetCategoryForm() {
    setEditingCategory(null);
    setCategoryKind("FOOD");
    setCategoryLevel(1);
    setCategoryParentId(0);
    setCategoryName("");
    setCategoryCode("");
    setCategoryIsLeaf(false);
    setCategorySortOrder(0);
    setCategoryRemark("");
  }

  function resetTermForm() {
    setEditingTerm(null);
    setTermGroupId(groups[0]?.id ?? 0);
    setTermName("");
    setTermCode("");
    setTermSortOrder(0);
    setTermRemark("");
  }

  function startEditBrand(row: SkuCodeBrand) {
    clearMessages();
    setTab("BRANDS");
    setEditingBrand(row);
    setBrandName(row.name_cn);
    setBrandCode(row.code);
    setBrandSortOrder(row.sort_order);
    setBrandRemark(row.remark ?? "");
  }

  function startEditCategory(row: SkuBusinessCategory) {
    clearMessages();
    setTab("CATEGORIES");
    setEditingCategory(row);
    setCategoryKind(row.product_kind);
    setCategoryLevel(row.level);
    setCategoryParentId(row.parent_id ?? 0);
    setCategoryName(row.category_name);
    setCategoryCode(row.category_code);
    setCategoryIsLeaf(row.is_leaf);
    setCategorySortOrder(row.sort_order);
    setCategoryRemark(row.remark ?? "");
  }

  function startEditTerm(row: SkuCodeTerm) {
    clearMessages();
    setTab("TERMS");
    setEditingTerm(row);
    setTermGroupId(row.group_id);
    setTermName(row.name_cn);
    setTermCode(row.code);
    setTermSortOrder(row.sort_order);
    setTermRemark(row.remark ?? "");
  }

  async function handleSubmitBrand(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();

    if (!brandName.trim()) {
      setError("请输入品牌中文名称");
      return;
    }
    if (!brandCode.trim()) {
      setError("请输入品牌编码");
      return;
    }

    setSaving(true);
    try {
      if (editingBrand) {
        await updateSkuCodeBrand(editingBrand.id, {
          name_cn: brandName.trim(),
          code: brandCode.trim(),
          sort_order: brandSortOrder,
          remark: brandRemark.trim() || null,
        });
        setHint("品牌已保存");
      } else {
        await createSkuCodeBrand({
          name_cn: brandName.trim(),
          code: brandCode.trim(),
          sort_order: brandSortOrder,
          remark: brandRemark.trim() || null,
        });
        setHint("品牌已新增");
      }

      resetBrandForm();
      await reload();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmitCategory(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();

    if (!categoryName.trim()) {
      setError("请输入分类名称");
      return;
    }
    if (!categoryCode.trim()) {
      setError("请输入分类编码");
      return;
    }
    if (!editingCategory && categoryLevel > 1 && !categoryParentId) {
      setError("请选择父级分类");
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        await updateSkuBusinessCategory(editingCategory.id, {
          category_name: categoryName.trim(),
          category_code: categoryCode.trim(),
          is_leaf: categoryIsLeaf,
          sort_order: categorySortOrder,
          remark: categoryRemark.trim() || null,
        });
        setHint("内部分类已保存");
      } else {
        await createSkuBusinessCategory({
          parent_id: categoryLevel === 1 ? null : categoryParentId || null,
          level: categoryLevel,
          product_kind: categoryKind,
          category_name: categoryName.trim(),
          category_code: categoryCode.trim(),
          is_leaf: categoryIsLeaf,
          sort_order: categorySortOrder,
          remark: categoryRemark.trim() || null,
        });
        setHint("内部分类已新增");
      }

      resetCategoryForm();
      await reload();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmitTerm(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();

    if (!termGroupId) {
      setError("请选择字典分组");
      return;
    }
    if (!termName.trim()) {
      setError("请输入中文名称");
      return;
    }
    if (!termCode.trim()) {
      setError("请输入编码");
      return;
    }

    setSaving(true);
    try {
      if (editingTerm) {
        await updateSkuCodeTerm(editingTerm.id, {
          name_cn: termName.trim(),
          code: termCode.trim(),
          sort_order: termSortOrder,
          remark: termRemark.trim() || null,
        });
        setHint("字典项已保存");
      } else {
        await createSkuCodeTerm({
          group_id: termGroupId,
          name_cn: termName.trim(),
          code: termCode.trim(),
          sort_order: termSortOrder,
          remark: termRemark.trim() || null,
        });
        setHint("字典项已新增");
      }

      resetTermForm();
      await reload();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function toggleBrand(row: SkuCodeBrand) {
    clearMessages();
    setSaving(true);
    try {
      if (row.is_active) {
        await disableSkuCodeBrand(row.id);
        setHint(`品牌已停用：${row.name_cn}`);
      } else {
        await enableSkuCodeBrand(row.id);
        setHint(`品牌已启用：${row.name_cn}`);
      }
      await reload();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function toggleCategory(row: SkuBusinessCategory) {
    clearMessages();
    setSaving(true);
    try {
      if (row.is_active) {
        await disableSkuBusinessCategory(row.id);
        setHint(`内部分类已停用：${row.category_name}`);
      } else {
        await enableSkuBusinessCategory(row.id);
        setHint(`内部分类已启用：${row.category_name}`);
      }
      await reload();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function toggleTerm(row: SkuCodeTerm) {
    clearMessages();
    setSaving(true);
    try {
      if (row.is_active) {
        await disableSkuCodeTerm(row.id);
        setHint(`字典项已停用：${row.name_cn}`);
      } else {
        await enableSkuCodeTerm(row.id);
        setHint(`字典项已启用：${row.name_cn}`);
      }
      await reload();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">SKU编码 / 字典维护</h1>
        <p className="mt-1 text-sm text-slate-500">
          维护品牌、内部三级分类和编码字典。编码一旦被正式商品使用，后续应锁定，不应随意修改。
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {[
          ["BRANDS", "品牌字典"],
          ["CATEGORIES", "内部分类"],
          ["TERMS", "编码字典"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key as TabKey)}
            className={`rounded-full border px-4 py-2 text-sm ${
              tab === key
                ? "border-sky-300 bg-sky-50 text-sky-800"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {label}
          </button>
        ))}

        <button
          type="button"
          onClick={() => void reload()}
          disabled={loading}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          刷新
        </button>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {hint ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {hint}
        </div>
      ) : null}

      {tab === "BRANDS" ? (
        <div className="grid gap-6 lg:grid-cols-[400px_minmax(0,1fr)]">
          <form className={cardCls} onSubmit={handleSubmitBrand}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-slate-900">
                {editingBrand ? "编辑品牌" : "新增品牌"}
              </div>
              {editingBrand ? (
                <button type="button" onClick={resetBrandForm} className="text-xs text-slate-500 hover:text-slate-800">
                  取消编辑
                </button>
              ) : null}
            </div>

            <label>
              <span className={labelCls}>中文名称</span>
              <input
                className={`${inputCls} w-full`}
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
              />
            </label>

            <label className="mt-3 block">
              <span className={labelCls}>品牌编码</span>
              <input
                className={`${inputCls} w-full font-mono`}
                value={brandCode}
                disabled={Boolean(editingBrand?.is_locked)}
                onChange={(e) => setBrandCode(e.target.value)}
              />
              {editingBrand?.is_locked ? (
                <div className="mt-1 text-xs text-amber-600">当前品牌编码已锁定，不能修改编码。</div>
              ) : null}
            </label>

            <label className="mt-3 block">
              <span className={labelCls}>排序</span>
              <input
                className={`${inputCls} w-full`}
                type="number"
                value={brandSortOrder}
                onChange={(e) => setBrandSortOrder(parseNumberInput(e.target.value))}
              />
            </label>

            <label className="mt-3 block">
              <span className={labelCls}>备注</span>
              <textarea
                className={`${inputCls} min-h-20 w-full`}
                value={brandRemark}
                onChange={(e) => setBrandRemark(e.target.value)}
              />
            </label>

            <button
              type="submit"
              disabled={saving}
              className="mt-4 rounded-lg bg-sky-600 px-4 py-2 text-sm text-white hover:bg-sky-700 disabled:opacity-60"
            >
              {editingBrand ? "保存品牌" : "新增品牌"}
            </button>
          </form>

          <section className={cardCls}>
            <div className="mb-3 text-sm font-semibold text-slate-900">品牌列表</div>
            <div className="overflow-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500">
                  <tr>
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">名称</th>
                    <th className="px-3 py-2">编码</th>
                    <th className="px-3 py-2">排序</th>
                    <th className="px-3 py-2">状态</th>
                    <th className="px-3 py-2">备注</th>
                    <th className="px-3 py-2">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedBrands.map((brand) => (
                    <tr key={brand.id} className="border-t border-slate-100">
                      <td className="px-3 py-2">{brand.id}</td>
                      <td className="px-3 py-2">{brand.name_cn}</td>
                      <td className="px-3 py-2 font-mono">{brand.code}</td>
                      <td className="px-3 py-2">{brand.sort_order}</td>
                      <td className="px-3 py-2">
                        <span className={statusClass(brand.is_active)}>{statusLabel(brand.is_active)}</span>
                      </td>
                      <td className="max-w-[260px] truncate px-3 py-2 text-xs text-slate-500">
                        {brand.remark ?? ""}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-2">
                          <button type="button" className={smallBtnCls} onClick={() => startEditBrand(brand)}>
                            编辑
                          </button>
                          <button
                            type="button"
                            className={brand.is_active ? dangerBtnCls : smallBtnCls}
                            disabled={saving}
                            onClick={() => void toggleBrand(brand)}
                          >
                            {brand.is_active ? "停用" : "启用"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : null}

      {tab === "CATEGORIES" ? (
        <div className="grid gap-6 lg:grid-cols-[440px_minmax(0,1fr)]">
          <form className={cardCls} onSubmit={handleSubmitCategory}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-slate-900">
                {editingCategory ? "编辑内部分类" : "新增内部分类"}
              </div>
              {editingCategory ? (
                <button type="button" onClick={resetCategoryForm} className="text-xs text-slate-500 hover:text-slate-800">
                  取消编辑
                </button>
              ) : null}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label>
                <span className={labelCls}>商品类型</span>
                <select
                  className={`${inputCls} w-full`}
                  value={categoryKind}
                  disabled={Boolean(editingCategory)}
                  onChange={(e) => setCategoryKind(e.target.value as ProductKind)}
                >
                  <option value="FOOD">食品</option>
                  <option value="SUPPLY">用品</option>
                </select>
              </label>

              <label>
                <span className={labelCls}>层级</span>
                <select
                  className={`${inputCls} w-full`}
                  value={categoryLevel}
                  disabled={Boolean(editingCategory)}
                  onChange={(e) => {
                    const nextLevel = parseNumberInput(e.target.value) || 1;
                    setCategoryLevel(nextLevel);
                    setCategoryParentId(0);
                    setCategoryIsLeaf(nextLevel === 3);
                  }}
                >
                  <option value={1}>一级</option>
                  <option value={2}>二级</option>
                  <option value={3}>三级</option>
                </select>
              </label>
            </div>

            {categoryLevel > 1 ? (
              <label className="mt-3 block">
                <span className={labelCls}>父级分类</span>
                <select
                  className={`${inputCls} w-full`}
                  value={categoryParentId}
                  disabled={Boolean(editingCategory)}
                  onChange={(e) => setCategoryParentId(parseNumberInput(e.target.value))}
                >
                  <option value={0}>请选择父级</option>
                  {parentOptions.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.path_code} / {category.category_name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {editingCategory ? (
              <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                当前路径：<span className="font-mono">{editingCategory.path_code}</span>
              </div>
            ) : null}

            <label className="mt-3 block">
              <span className={labelCls}>分类名称</span>
              <input
                className={`${inputCls} w-full`}
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              />
            </label>

            <label className="mt-3 block">
              <span className={labelCls}>分类编码</span>
              <input
                className={`${inputCls} w-full font-mono`}
                value={categoryCode}
                disabled={Boolean(editingCategory?.is_locked)}
                onChange={(e) => setCategoryCode(e.target.value)}
              />
              {editingCategory?.is_locked ? (
                <div className="mt-1 text-xs text-amber-600">当前分类编码已锁定，不能修改编码。</div>
              ) : null}
            </label>

            <label className="mt-3 block">
              <span className={labelCls}>排序</span>
              <input
                className={`${inputCls} w-full`}
                type="number"
                value={categorySortOrder}
                onChange={(e) => setCategorySortOrder(parseNumberInput(e.target.value))}
              />
            </label>

            <label className="mt-3 inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={categoryIsLeaf}
                onChange={(e) => setCategoryIsLeaf(e.target.checked)}
              />
              第三级叶子分类，可用于生成 SKU
            </label>

            <label className="mt-3 block">
              <span className={labelCls}>备注</span>
              <textarea
                className={`${inputCls} min-h-20 w-full`}
                value={categoryRemark}
                onChange={(e) => setCategoryRemark(e.target.value)}
              />
            </label>

            <button
              type="submit"
              disabled={saving}
              className="mt-4 block rounded-lg bg-sky-600 px-4 py-2 text-sm text-white hover:bg-sky-700 disabled:opacity-60"
            >
              {editingCategory ? "保存分类" : "新增分类"}
            </button>
          </form>

          <section className={cardCls}>
            <div className="mb-3 text-sm font-semibold text-slate-900">内部分类列表</div>
            <div className="overflow-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500">
                  <tr>
                    <th className="px-3 py-2">类型</th>
                    <th className="px-3 py-2">层级</th>
                    <th className="px-3 py-2">路径</th>
                    <th className="px-3 py-2">名称</th>
                    <th className="px-3 py-2">叶子</th>
                    <th className="px-3 py-2">状态</th>
                    <th className="px-3 py-2">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCategories.map((category) => (
                    <tr key={category.id} className="border-t border-slate-100">
                      <td className="px-3 py-2">{category.product_kind}</td>
                      <td className="px-3 py-2">{category.level}</td>
                      <td className="px-3 py-2 font-mono text-xs">{category.path_code}</td>
                      <td className="px-3 py-2">{category.category_name}</td>
                      <td className="px-3 py-2">{category.is_leaf ? "是" : "否"}</td>
                      <td className="px-3 py-2">
                        <span className={statusClass(category.is_active)}>{statusLabel(category.is_active)}</span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-2">
                          <button type="button" className={smallBtnCls} onClick={() => startEditCategory(category)}>
                            编辑
                          </button>
                          <button
                            type="button"
                            className={category.is_active ? dangerBtnCls : smallBtnCls}
                            disabled={saving}
                            onClick={() => void toggleCategory(category)}
                          >
                            {category.is_active ? "停用" : "启用"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : null}

      {tab === "TERMS" ? (
        <div className="grid gap-6 lg:grid-cols-[440px_minmax(0,1fr)]">
          <form className={cardCls} onSubmit={handleSubmitTerm}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-slate-900">
                {editingTerm ? "编辑编码字典项" : "新增编码字典项"}
              </div>
              {editingTerm ? (
                <button type="button" onClick={resetTermForm} className="text-xs text-slate-500 hover:text-slate-800">
                  取消编辑
                </button>
              ) : null}
            </div>

            <label>
              <span className={labelCls}>字典分组</span>
              <select
                className={`${inputCls} w-full`}
                value={termGroupId}
                disabled={Boolean(editingTerm)}
                onChange={(e) => setTermGroupId(parseNumberInput(e.target.value))}
              >
                <option value={0}>请选择分组</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {groupLabel(group)}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-3 block">
              <span className={labelCls}>中文名称</span>
              <input
                className={`${inputCls} w-full`}
                value={termName}
                onChange={(e) => setTermName(e.target.value)}
              />
            </label>

            <label className="mt-3 block">
              <span className={labelCls}>编码</span>
              <input
                className={`${inputCls} w-full font-mono`}
                value={termCode}
                disabled={Boolean(editingTerm?.is_locked)}
                onChange={(e) => setTermCode(e.target.value)}
              />
              {editingTerm?.is_locked ? (
                <div className="mt-1 text-xs text-amber-600">当前字典项编码已锁定，不能修改编码。</div>
              ) : null}
            </label>

            <label className="mt-3 block">
              <span className={labelCls}>排序</span>
              <input
                className={`${inputCls} w-full`}
                type="number"
                value={termSortOrder}
                onChange={(e) => setTermSortOrder(parseNumberInput(e.target.value))}
              />
            </label>

            <label className="mt-3 block">
              <span className={labelCls}>备注</span>
              <textarea
                className={`${inputCls} min-h-20 w-full`}
                value={termRemark}
                onChange={(e) => setTermRemark(e.target.value)}
              />
            </label>

            <button
              type="submit"
              disabled={saving}
              className="mt-4 rounded-lg bg-sky-600 px-4 py-2 text-sm text-white hover:bg-sky-700 disabled:opacity-60"
            >
              {editingTerm ? "保存字典项" : "新增字典项"}
            </button>
          </form>

          <section className={cardCls}>
            <div className="mb-3 text-sm font-semibold text-slate-900">编码字典项列表</div>
            <div className="overflow-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500">
                  <tr>
                    <th className="px-3 py-2">分组</th>
                    <th className="px-3 py-2">名称</th>
                    <th className="px-3 py-2">编码</th>
                    <th className="px-3 py-2">排序</th>
                    <th className="px-3 py-2">状态</th>
                    <th className="px-3 py-2">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTerms.map((term) => {
                    const group = groupMap.get(term.group_id);
                    return (
                      <tr key={term.id} className="border-t border-slate-100">
                        <td className="px-3 py-2 text-xs text-slate-500">
                          {group ? groupLabel(group) : `#${term.group_id}`}
                        </td>
                        <td className="px-3 py-2">{term.name_cn}</td>
                        <td className="px-3 py-2 font-mono">{term.code}</td>
                        <td className="px-3 py-2">{term.sort_order}</td>
                        <td className="px-3 py-2">
                          <span className={statusClass(term.is_active)}>{statusLabel(term.is_active)}</span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-2">
                            <button type="button" className={smallBtnCls} onClick={() => startEditTerm(term)}>
                              编辑
                            </button>
                            <button
                              type="button"
                              className={term.is_active ? dangerBtnCls : smallBtnCls}
                              disabled={saving}
                              onClick={() => void toggleTerm(term)}
                            >
                              {term.is_active ? "停用" : "启用"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : null}

      {loading ? <div className="text-sm text-slate-400">加载中...</div> : null}
    </div>
  );
}
