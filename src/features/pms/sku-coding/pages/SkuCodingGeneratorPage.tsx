// src/features/pms/sku-coding/pages/SkuCodingGeneratorPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  fetchSkuBusinessCategories,
  fetchSkuCodeBrands,
  fetchSkuCodeTermGroups,
  fetchSkuCodeTerms,
  generateSkuCode,
  type ProductKind,
  type SkuBusinessCategory,
  type SkuCodeBrand,
  type SkuCodeTerm,
  type SkuCodeTermGroup,
  type SkuGenerateData,
} from "../api/skuCodingApi";

type TermsByGroupId = Record<number, SkuCodeTerm[]>;

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function productKindLabel(v: ProductKind): string {
  return v === "FOOD" ? "食品" : "用品";
}

function buildEmptyTermIds(groups: SkuCodeTermGroup[]): Record<string, number[]> {
  const out: Record<string, number[]> = {};
  for (const group of groups) {
    out[group.group_code] = [];
  }
  return out;
}

const inputCls = "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100";
const labelCls = "mb-1 block text-xs font-medium text-slate-600";
const cardCls = "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm";

export default function SkuCodingGeneratorPage() {
  const [productKind, setProductKind] = useState<ProductKind>("FOOD");

  const [brands, setBrands] = useState<SkuCodeBrand[]>([]);
  const [categories, setCategories] = useState<SkuBusinessCategory[]>([]);
  const [groups, setGroups] = useState<SkuCodeTermGroup[]>([]);
  const [termsByGroupId, setTermsByGroupId] = useState<TermsByGroupId>({});

  const [brandId, setBrandId] = useState<number>(0);
  const [categoryId, setCategoryId] = useState<number>(0);
  const [termIds, setTermIds] = useState<Record<string, number[]>>({});
  const [specText, setSpecText] = useState("");

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SkuGenerateData | null>(null);

  const leafCategories = useMemo(
    () =>
      categories
        .filter((x) => x.product_kind === productKind && x.is_leaf && x.is_active)
        .sort((a, b) => a.path_code.localeCompare(b.path_code)),
    [categories, productKind],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadReference() {
      setLoading(true);
      setError(null);
      setResult(null);

      try {
        const [brandRows, categoryRows, groupRows] = await Promise.all([
          fetchSkuCodeBrands(true),
          fetchSkuBusinessCategories(productKind, true),
          fetchSkuCodeTermGroups(productKind, true),
        ]);

        const nextTerms: TermsByGroupId = {};
        for (const group of groupRows) {
          nextTerms[group.id] = await fetchSkuCodeTerms(group.id, true);
        }

        if (cancelled) return;

        setBrands(brandRows);
        setCategories(categoryRows);
        setGroups(groupRows);
        setTermsByGroupId(nextTerms);
        setTermIds(buildEmptyTermIds(groupRows));

        setBrandId((prev) => {
          if (prev > 0 && brandRows.some((x) => x.id === prev)) return prev;
          return brandRows[0]?.id ?? 0;
        });

        setCategoryId((prev) => {
          if (prev > 0 && categoryRows.some((x) => x.id === prev && x.is_leaf)) return prev;
          return categoryRows.find((x) => x.is_leaf)?.id ?? 0;
        });
      } catch (err) {
        if (!cancelled) setError(errorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadReference();

    return () => {
      cancelled = true;
    };
  }, [productKind]);

  function setSingleTerm(groupCode: string, termId: number) {
    setTermIds((prev) => ({
      ...prev,
      [groupCode]: termId > 0 ? [termId] : [],
    }));
  }

  function toggleMultiTerm(groupCode: string, termId: number) {
    setTermIds((prev) => {
      const current = prev[groupCode] ?? [];
      const next = current.includes(termId)
        ? current.filter((x) => x !== termId)
        : [...current, termId];

      return {
        ...prev,
        [groupCode]: next,
      };
    });
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!brandId) {
      setError("请选择品牌");
      return;
    }
    if (!categoryId) {
      setError("请选择第三级内部分类");
      return;
    }
    if (!specText.trim()) {
      setError("请输入规格，例如 500g、40g×6、2L");
      return;
    }

    setGenerating(true);
    try {
      const data = await generateSkuCode({
        product_kind: productKind,
        brand_id: brandId,
        category_id: categoryId,
        term_ids: termIds,
        spec_text: specText.trim(),
      });
      setResult(data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">SKU编码 / 编码生成</h1>
        <p className="mt-1 text-sm text-slate-500">
          根据品牌、内部三级分类、食品/用品属性和规格生成候选 SKU。这里不直接创建商品，只辅助生成{" "}
          <span className="font-mono">items.sku</span>。
        </p>
      </header>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <form className={cardCls} onSubmit={handleGenerate}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">结构化输入</div>
              <div className="text-xs text-slate-500">
                商品类型会决定可选字典和编码模板。
              </div>
            </div>
            {loading ? <span className="text-xs text-slate-500">加载字典中...</span> : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className={labelCls}>商品类型</span>
              <select
                className={`${inputCls} w-full`}
                value={productKind}
                onChange={(e) => setProductKind(e.target.value as ProductKind)}
              >
                <option value="FOOD">食品</option>
                <option value="SUPPLY">用品</option>
              </select>
            </label>

            <label>
              <span className={labelCls}>品牌</span>
              <select
                className={`${inputCls} w-full`}
                value={brandId}
                onChange={(e) => setBrandId(Number(e.target.value) || 0)}
              >
                <option value={0}>请选择品牌</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name_cn} / {brand.code}
                  </option>
                ))}
              </select>
            </label>

            <label className="md:col-span-2">
              <span className={labelCls}>内部三级分类</span>
              <select
                className={`${inputCls} w-full`}
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value) || 0)}
              >
                <option value={0}>请选择第三级叶子分类</option>
                {leafCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.path_code} / {category.category_name}
                  </option>
                ))}
              </select>
            </label>

            {groups.map((group) => {
              const terms = termsByGroupId[group.id] ?? [];
              const selected = termIds[group.group_code] ?? [];

              return (
                <div key={group.id} className="md:col-span-2">
                  <div className={labelCls}>
                    {group.group_name}
                    {group.is_required ? <span className="text-red-500"> *</span> : null}
                    <span className="ml-2 text-slate-400">{group.group_code}</span>
                  </div>

                  {group.is_multi_select ? (
                    <div className="flex flex-wrap gap-2">
                      {terms.length === 0 ? (
                        <span className="text-xs text-slate-400">暂无启用字典项</span>
                      ) : null}
                      {terms.map((term) => (
                        <label
                          key={term.id}
                          className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
                            selected.includes(term.id)
                              ? "border-sky-300 bg-sky-50 text-sky-800"
                              : "border-slate-200 bg-white text-slate-700"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selected.includes(term.id)}
                            onChange={() => toggleMultiTerm(group.group_code, term.id)}
                          />
                          {term.name_cn} / {term.code}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <select
                      className={`${inputCls} w-full`}
                      value={selected[0] ?? 0}
                      onChange={(e) => setSingleTerm(group.group_code, Number(e.target.value) || 0)}
                    >
                      <option value={0}>不选择</option>
                      {terms.map((term) => (
                        <option key={term.id} value={term.id}>
                          {term.name_cn} / {term.code}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              );
            })}

            <label className="md:col-span-2">
              <span className={labelCls}>规格</span>
              <input
                className={`${inputCls} w-full`}
                value={specText}
                onChange={(e) => setSpecText(e.target.value)}
                placeholder={productKind === "FOOD" ? "例如 500g、1.5kg、40g×6" : "例如 2L、60L、LRG"}
              />
            </label>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              type="submit"
              disabled={generating || loading}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {generating ? "生成中..." : "生成 SKU"}
            </button>
            <span className="text-xs text-slate-500">
              {productKindLabel(productKind)}模板：SKU-[品牌]-[分类]-[属性]-[规格]
            </span>
          </div>
        </form>

        <aside className={cardCls}>
          <div className="text-sm font-semibold text-slate-900">生成结果</div>
          <p className="mt-1 text-xs text-slate-500">
            候选 SKU 需要人工确认，最终仍由商品管理页创建商品。
          </p>

          {result ? (
            <div className="mt-4 space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs text-slate-500">候选 SKU</div>
                <div className="mt-1 break-all font-mono text-lg font-semibold text-slate-900">
                  {result.sku}
                </div>
                <div className={`mt-2 text-xs ${result.exists ? "text-red-600" : "text-emerald-700"}`}>
                  {result.exists ? "该 SKU 已存在" : "未发现同码商品"}
                </div>
              </div>

              <div>
                <div className="mb-2 text-xs font-medium text-slate-600">编码解释</div>
                <div className="overflow-hidden rounded-lg border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-3 py-2">段</th>
                        <th className="px-3 py-2">中文</th>
                        <th className="px-3 py-2">编码</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.segments.map((segment, index) => (
                        <tr key={`${segment.segment_key}-${index}`} className="border-t border-slate-100">
                          <td className="px-3 py-2 font-mono text-slate-500">{segment.segment_key}</td>
                          <td className="px-3 py-2 text-slate-800">{segment.name_cn}</td>
                          <td className="px-3 py-2 font-mono text-slate-900">{segment.code}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <div className="mb-2 text-xs font-medium text-slate-600">相似商品</div>
                {result.similar_items.length === 0 ? (
                  <div className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-500">
                    暂无相似商品。
                  </div>
                ) : (
                  <div className="space-y-2">
                    {result.similar_items.map((item) => (
                      <div key={item.id} className="rounded-lg border border-slate-200 px-3 py-2 text-xs">
                        <div className="font-mono text-slate-900">{item.sku}</div>
                        <div className="mt-1 text-slate-700">{item.name}</div>
                        <div className="mt-1 text-slate-400">
                          {item.brand ?? "无品牌"} / {item.category ?? "无分类"} / {item.spec ?? "无规格"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-lg border border-dashed border-slate-300 px-3 py-8 text-center text-sm text-slate-400">
              填写左侧字段后生成 SKU。
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
