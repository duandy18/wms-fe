// src/features/pms/sku-coding/pages/SkuCodingDictionariesPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  createSkuBusinessCategory,
  createSkuCodeBrand,
  createSkuCodeTerm,
  fetchSkuBusinessCategories,
  fetchSkuCodeBrands,
  fetchSkuCodeTermGroups,
  fetchSkuCodeTerms,
  type ProductKind,
  type SkuBusinessCategory,
  type SkuCodeBrand,
  type SkuCodeTerm,
  type SkuCodeTermGroup,
} from "../api/skuCodingApi";

type TabKey = "BRANDS" | "CATEGORIES" | "TERMS";

const inputCls = "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100";
const labelCls = "mb-1 block text-xs font-medium text-slate-600";
const cardCls = "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm";

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function groupLabel(group: SkuCodeTermGroup): string {
  return `${group.product_kind} / ${group.group_name} / ${group.group_code}`;
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

  const [brandName, setBrandName] = useState("");
  const [brandCode, setBrandCode] = useState("");

  const [categoryKind, setCategoryKind] = useState<ProductKind>("FOOD");
  const [categoryLevel, setCategoryLevel] = useState(1);
  const [categoryParentId, setCategoryParentId] = useState<number>(0);
  const [categoryName, setCategoryName] = useState("");
  const [categoryCode, setCategoryCode] = useState("");
  const [categoryIsLeaf, setCategoryIsLeaf] = useState(false);

  const [termGroupId, setTermGroupId] = useState<number>(0);
  const [termName, setTermName] = useState("");
  const [termCode, setTermCode] = useState("");
  const [termSortOrder, setTermSortOrder] = useState(0);

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

  async function handleCreateBrand(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setHint(null);
    setSaving(true);
    try {
      await createSkuCodeBrand({
        name_cn: brandName.trim(),
        code: brandCode.trim(),
      });
      setBrandName("");
      setBrandCode("");
      setHint("品牌已新增");
      await reload();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setHint(null);
    setSaving(true);
    try {
      await createSkuBusinessCategory({
        parent_id: categoryLevel === 1 ? null : categoryParentId || null,
        level: categoryLevel,
        product_kind: categoryKind,
        category_name: categoryName.trim(),
        category_code: categoryCode.trim(),
        is_leaf: categoryIsLeaf,
      });
      setCategoryName("");
      setCategoryCode("");
      setCategoryIsLeaf(false);
      setHint("内部分类已新增");
      await reload();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateTerm(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setHint(null);
    setSaving(true);
    try {
      await createSkuCodeTerm({
        group_id: termGroupId,
        name_cn: termName.trim(),
        code: termCode.trim(),
        sort_order: termSortOrder,
      });
      setTermName("");
      setTermCode("");
      setHint("字典项已新增");
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
        <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
          <form className={cardCls} onSubmit={handleCreateBrand}>
            <div className="mb-4 text-sm font-semibold text-slate-900">新增品牌</div>
            <label>
              <span className={labelCls}>中文名称</span>
              <input className={`${inputCls} w-full`} value={brandName} onChange={(e) => setBrandName(e.target.value)} />
            </label>
            <label className="mt-3 block">
              <span className={labelCls}>品牌编码</span>
              <input className={`${inputCls} w-full font-mono`} value={brandCode} onChange={(e) => setBrandCode(e.target.value)} />
            </label>
            <button
              type="submit"
              disabled={saving}
              className="mt-4 rounded-lg bg-sky-600 px-4 py-2 text-sm text-white hover:bg-sky-700 disabled:opacity-60"
            >
              新增品牌
            </button>
          </form>

          <section className={cardCls}>
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">品牌列表</div>
              <button type="button" onClick={() => void reload()} className="text-xs text-sky-700">
                刷新
              </button>
            </div>
            <div className="overflow-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500">
                  <tr>
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">名称</th>
                    <th className="px-3 py-2">编码</th>
                    <th className="px-3 py-2">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {brands.map((brand) => (
                    <tr key={brand.id} className="border-t border-slate-100">
                      <td className="px-3 py-2">{brand.id}</td>
                      <td className="px-3 py-2">{brand.name_cn}</td>
                      <td className="px-3 py-2 font-mono">{brand.code}</td>
                      <td className="px-3 py-2">{brand.is_active ? "启用" : "停用"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : null}

      {tab === "CATEGORIES" ? (
        <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
          <form className={cardCls} onSubmit={handleCreateCategory}>
            <div className="mb-4 text-sm font-semibold text-slate-900">新增内部分类</div>

            <div className="grid gap-3 md:grid-cols-2">
              <label>
                <span className={labelCls}>商品类型</span>
                <select className={`${inputCls} w-full`} value={categoryKind} onChange={(e) => setCategoryKind(e.target.value as ProductKind)}>
                  <option value="FOOD">食品</option>
                  <option value="SUPPLY">用品</option>
                </select>
              </label>
              <label>
                <span className={labelCls}>层级</span>
                <select className={`${inputCls} w-full`} value={categoryLevel} onChange={(e) => setCategoryLevel(Number(e.target.value) || 1)}>
                  <option value={1}>一级</option>
                  <option value={2}>二级</option>
                  <option value={3}>三级</option>
                </select>
              </label>
            </div>

            {categoryLevel > 1 ? (
              <label className="mt-3 block">
                <span className={labelCls}>父级分类</span>
                <select className={`${inputCls} w-full`} value={categoryParentId} onChange={(e) => setCategoryParentId(Number(e.target.value) || 0)}>
                  <option value={0}>请选择父级</option>
                  {parentOptions.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.path_code} / {category.category_name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <label className="mt-3 block">
              <span className={labelCls}>分类名称</span>
              <input className={`${inputCls} w-full`} value={categoryName} onChange={(e) => setCategoryName(e.target.value)} />
            </label>
            <label className="mt-3 block">
              <span className={labelCls}>分类编码</span>
              <input className={`${inputCls} w-full font-mono`} value={categoryCode} onChange={(e) => setCategoryCode(e.target.value)} />
            </label>
            <label className="mt-3 inline-flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={categoryIsLeaf} onChange={(e) => setCategoryIsLeaf(e.target.checked)} />
              第三级叶子分类，可用于生成 SKU
            </label>

            <button
              type="submit"
              disabled={saving}
              className="mt-4 block rounded-lg bg-sky-600 px-4 py-2 text-sm text-white hover:bg-sky-700 disabled:opacity-60"
            >
              新增分类
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
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id} className="border-t border-slate-100">
                      <td className="px-3 py-2">{category.product_kind}</td>
                      <td className="px-3 py-2">{category.level}</td>
                      <td className="px-3 py-2 font-mono">{category.path_code}</td>
                      <td className="px-3 py-2">{category.category_name}</td>
                      <td className="px-3 py-2">{category.is_leaf ? "是" : "否"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : null}

      {tab === "TERMS" ? (
        <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
          <form className={cardCls} onSubmit={handleCreateTerm}>
            <div className="mb-4 text-sm font-semibold text-slate-900">新增编码字典项</div>

            <label>
              <span className={labelCls}>字典分组</span>
              <select className={`${inputCls} w-full`} value={termGroupId} onChange={(e) => setTermGroupId(Number(e.target.value) || 0)}>
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
              <input className={`${inputCls} w-full`} value={termName} onChange={(e) => setTermName(e.target.value)} />
            </label>
            <label className="mt-3 block">
              <span className={labelCls}>编码</span>
              <input className={`${inputCls} w-full font-mono`} value={termCode} onChange={(e) => setTermCode(e.target.value)} />
            </label>
            <label className="mt-3 block">
              <span className={labelCls}>排序</span>
              <input
                className={`${inputCls} w-full`}
                type="number"
                value={termSortOrder}
                onChange={(e) => setTermSortOrder(Number(e.target.value) || 0)}
              />
            </label>

            <button
              type="submit"
              disabled={saving}
              className="mt-4 rounded-lg bg-sky-600 px-4 py-2 text-sm text-white hover:bg-sky-700 disabled:opacity-60"
            >
              新增字典项
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
                  </tr>
                </thead>
                <tbody>
                  {terms.map((term) => {
                    const group = groupMap.get(term.group_id);
                    return (
                      <tr key={term.id} className="border-t border-slate-100">
                        <td className="px-3 py-2 text-xs text-slate-500">
                          {group ? groupLabel(group) : `#${term.group_id}`}
                        </td>
                        <td className="px-3 py-2">{term.name_cn}</td>
                        <td className="px-3 py-2 font-mono">{term.code}</td>
                        <td className="px-3 py-2">{term.sort_order}</td>
                        <td className="px-3 py-2">{term.is_active ? "启用" : "停用"}</td>
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
