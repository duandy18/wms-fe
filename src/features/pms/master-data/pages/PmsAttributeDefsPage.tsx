import React, { useEffect, useMemo, useState } from "react";
import {
  createItemAttributeDef,
  createItemAttributeOption,
  disableItemAttributeDef,
  disableItemAttributeOption,
  enableItemAttributeDef,
  enableItemAttributeOption,
  fetchItemAttributeDefs,
  fetchItemAttributeOptions,
  fetchPmsCategories,
  updateItemAttributeDef,
  type AttributeProductKind,
  type AttributeValueType,
  type ItemAttributeDef,
  type ItemAttributeOption,
  type PmsCategory,
} from "../api/masterDataApi";

const inputCls = "rounded border border-slate-300 bg-white px-3 py-2 text-sm";
const cardCls = "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm";
const btnCls = "rounded border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-60";
const primaryBtnCls = "rounded bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60";

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

function numOrZero(v: string): number {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : 0;
}

export default function PmsAttributeDefsPage() {
  const [defs, setDefs] = useState<ItemAttributeDef[]>([]);
  const [categories, setCategories] = useState<PmsCategory[]>([]);
  const [options, setOptions] = useState<ItemAttributeOption[]>([]);
  const [selectedDefId, setSelectedDefId] = useState<number>(0);
  const [editing, setEditing] = useState<ItemAttributeDef | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [nameCn, setNameCn] = useState("");
  const [productKind, setProductKind] = useState<AttributeProductKind>("COMMON");
  const [categoryId, setCategoryId] = useState("0");
  const [valueType, setValueType] = useState<AttributeValueType>("TEXT");
  const [unit, setUnit] = useState("");
  const [isRequired, setIsRequired] = useState(false);
  const [isSearchable, setIsSearchable] = useState(false);
  const [isFilterable, setIsFilterable] = useState(false);
  const [isSkuSegment, setIsSkuSegment] = useState(false);
  const [sortOrder, setSortOrder] = useState("0");
  const [remark, setRemark] = useState("");

  const [optionCode, setOptionCode] = useState("");
  const [optionName, setOptionName] = useState("");
  const [optionSortOrder, setOptionSortOrder] = useState("0");

  const sortedDefs = useMemo(
    () =>
      [...defs].sort(
        (a, b) =>
          a.product_kind.localeCompare(b.product_kind) ||
          Number(a.category_id ?? 0) - Number(b.category_id ?? 0) ||
          a.sort_order - b.sort_order ||
          a.code.localeCompare(b.code),
      ),
    [defs],
  );

  const categoryMap = useMemo(() => {
    const out = new Map<number, PmsCategory>();
    for (const category of categories) out.set(category.id, category);
    return out;
  }, [categories]);

  const selectedDef = useMemo(
    () => defs.find((x) => x.id === selectedDefId) ?? null,
    [defs, selectedDefId],
  );

  async function reload() {
    setLoading(true);
    setError(null);
    try {
      const [defRows, categoryRows] = await Promise.all([
        fetchItemAttributeDefs({ active_only: false }),
        fetchPmsCategories(undefined, false),
      ]);
      setDefs(defRows);
      setCategories(categoryRows);
      setSelectedDefId((prev) => (prev > 0 && defRows.some((x) => x.id === prev) ? prev : defRows[0]?.id ?? 0));
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  }

  async function reloadOptions(defId: number) {
    if (!defId) {
      setOptions([]);
      return;
    }
    try {
      setOptions(await fetchItemAttributeOptions(defId, false));
    } catch (e) {
      setError(errMsg(e));
    }
  }

  useEffect(() => {
    void reload();
  }, []);

  useEffect(() => {
    void reloadOptions(selectedDefId);
  }, [selectedDefId]);

  function resetForm() {
    setEditing(null);
    setCode("");
    setNameCn("");
    setProductKind("COMMON");
    setCategoryId("0");
    setValueType("TEXT");
    setUnit("");
    setIsRequired(false);
    setIsSearchable(false);
    setIsFilterable(false);
    setIsSkuSegment(false);
    setSortOrder("0");
    setRemark("");
  }

  function startEdit(row: ItemAttributeDef) {
    setEditing(row);
    setSelectedDefId(row.id);
    setCode(row.code);
    setNameCn(row.name_cn);
    setProductKind(row.product_kind);
    setCategoryId(row.category_id == null ? "0" : String(row.category_id));
    setValueType(row.value_type);
    setUnit(row.unit ?? "");
    setIsRequired(row.is_required);
    setIsSearchable(row.is_searchable);
    setIsFilterable(row.is_filterable);
    setIsSkuSegment(row.is_sku_segment);
    setSortOrder(String(row.sort_order));
    setRemark(row.remark ?? "");
    setError(null);
    setHint(null);
  }

  async function submitDef(e: React.FormEvent) {
    e.preventDefault();
    const nextCode = code.trim().toUpperCase();
    const nextName = nameCn.trim();

    if (!nextCode) {
      setError("请输入属性编码");
      return;
    }
    if (!nextName) {
      setError("请输入属性名称");
      return;
    }

    setSaving(true);
    setError(null);
    setHint(null);

    try {
      if (editing) {
        await updateItemAttributeDef(editing.id, {
          name_cn: nextName,
          unit: unit.trim() || null,
          is_required: isRequired,
          is_searchable: isSearchable,
          is_filterable: isFilterable,
          is_sku_segment: isSkuSegment,
          sort_order: numOrZero(sortOrder),
          remark: remark.trim() || null,
        });
        setHint("属性模板已保存");
      } else {
        await createItemAttributeDef({
          code: nextCode,
          name_cn: nextName,
          product_kind: productKind,
          category_id: categoryId === "0" ? null : Number(categoryId),
          value_type: valueType,
          unit: unit.trim() || null,
          is_required: isRequired,
          is_searchable: isSearchable,
          is_filterable: isFilterable,
          is_sku_segment: isSkuSegment,
          sort_order: numOrZero(sortOrder),
          remark: remark.trim() || null,
        });
        setHint("属性模板已新增");
      }

      resetForm();
      await reload();
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setSaving(false);
    }
  }

  async function toggleDef(row: ItemAttributeDef) {
    setSaving(true);
    setError(null);
    setHint(null);
    try {
      if (row.is_active) {
        await disableItemAttributeDef(row.id);
        setHint(`已停用属性模板：${row.name_cn}`);
      } else {
        await enableItemAttributeDef(row.id);
        setHint(`已启用属性模板：${row.name_cn}`);
      }
      await reload();
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setSaving(false);
    }
  }

  async function submitOption(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDef || selectedDef.value_type !== "OPTION") {
      setError("请选择 OPTION 类型属性模板");
      return;
    }
    if (!optionCode.trim() || !optionName.trim()) {
      setError("请输入选项编码和选项名称");
      return;
    }

    setSaving(true);
    setError(null);
    setHint(null);
    try {
      await createItemAttributeOption(selectedDef.id, {
        option_code: optionCode.trim().toUpperCase(),
        option_name: optionName.trim(),
        sort_order: numOrZero(optionSortOrder),
      });
      setOptionCode("");
      setOptionName("");
      setOptionSortOrder("0");
      setHint("属性选项已新增");
      await reloadOptions(selectedDef.id);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setSaving(false);
    }
  }

  async function toggleOption(row: ItemAttributeOption) {
    setSaving(true);
    setError(null);
    setHint(null);
    try {
      if (row.is_active) {
        await disableItemAttributeOption(row.id);
        setHint(`已停用选项：${row.option_name}`);
      } else {
        await enableItemAttributeOption(row.id);
        setHint(`已启用选项：${row.option_name}`);
      }
      await reloadOptions(row.attribute_def_id);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">属性模板</h1>
        <p className="mt-1 text-sm text-slate-500">定义不同类目下的商品属性，以及 OPTION 类型属性的选项。</p>
      </header>

      {error ? <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
      {hint ? <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{hint}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <form className={cardCls} onSubmit={submitDef}>
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-semibold">{editing ? "编辑属性模板" : "新增属性模板"}</div>
            {editing ? <button type="button" className="text-xs text-slate-500" onClick={resetForm}>取消</button> : null}
          </div>

          <label className="block">
            <span className="mb-1 block text-xs text-slate-600">属性编码</span>
            <input className={`${inputCls} w-full font-mono`} value={code} disabled={Boolean(editing)} onChange={(e) => setCode(e.target.value.toUpperCase())} />
          </label>

          <label className="mt-3 block">
            <span className="mb-1 block text-xs text-slate-600">属性名称</span>
            <input className={`${inputCls} w-full`} value={nameCn} onChange={(e) => setNameCn(e.target.value)} />
          </label>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label>
              <span className="mb-1 block text-xs text-slate-600">商品类型</span>
              <select className={`${inputCls} w-full`} value={productKind} disabled={Boolean(editing)} onChange={(e) => setProductKind(e.target.value as AttributeProductKind)}>
                <option value="COMMON">通用</option>
                <option value="FOOD">食品</option>
                <option value="SUPPLY">用品</option>
                <option value="OTHER">其他</option>
              </select>
            </label>

            <label>
              <span className="mb-1 block text-xs text-slate-600">值类型</span>
              <select className={`${inputCls} w-full`} value={valueType} disabled={Boolean(editing)} onChange={(e) => setValueType(e.target.value as AttributeValueType)}>
                <option value="TEXT">文本</option>
                <option value="NUMBER">数值</option>
                <option value="OPTION">单选</option>
                <option value="BOOL">是否</option>
              </select>
            </label>
          </div>

          <label className="mt-3 block">
            <span className="mb-1 block text-xs text-slate-600">绑定分类（可选）</span>
            <select className={`${inputCls} w-full`} value={categoryId} disabled={Boolean(editing)} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="0">不绑定具体分类</option>
              {categories.map((category) => (
                <option key={category.id} value={String(category.id)}>
                  {category.path_code} / {category.category_name}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label>
              <span className="mb-1 block text-xs text-slate-600">单位</span>
              <input className={`${inputCls} w-full`} value={unit} onChange={(e) => setUnit(e.target.value)} />
            </label>

            <label>
              <span className="mb-1 block text-xs text-slate-600">排序</span>
              <input className={`${inputCls} w-full`} type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
            </label>
          </div>

          <div className="mt-3 grid gap-2 text-sm text-slate-700">
            <label className="flex items-center gap-2"><input type="checkbox" checked={isRequired} onChange={(e) => setIsRequired(e.target.checked)} /> 必填</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={isSearchable} onChange={(e) => setIsSearchable(e.target.checked)} /> 可搜索</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={isFilterable} onChange={(e) => setIsFilterable(e.target.checked)} /> 可筛选</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={isSkuSegment} onChange={(e) => setIsSkuSegment(e.target.checked)} /> 可参与 SKU 编码</label>
          </div>

          <label className="mt-3 block">
            <span className="mb-1 block text-xs text-slate-600">备注</span>
            <textarea className={`${inputCls} min-h-20 w-full`} value={remark} onChange={(e) => setRemark(e.target.value)} />
          </label>

          <button className={`${primaryBtnCls} mt-4`} disabled={saving} type="submit">
            {editing ? "保存模板" : "新增模板"}
          </button>
        </form>

        <section className={cardCls}>
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold">属性模板列表</div>
            <button className={btnCls} type="button" onClick={() => void reload()} disabled={loading}>刷新</button>
          </div>

          <div className="overflow-auto rounded border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-3 py-2">编码</th>
                  <th className="px-3 py-2">名称</th>
                  <th className="px-3 py-2">类型</th>
                  <th className="px-3 py-2">分类</th>
                  <th className="px-3 py-2">值类型</th>
                  <th className="px-3 py-2">状态</th>
                  <th className="px-3 py-2">操作</th>
                </tr>
              </thead>
              <tbody>
                {sortedDefs.map((row) => {
                  const category = row.category_id == null ? null : categoryMap.get(row.category_id);
                  return (
                    <tr key={row.id} className="border-t">
                      <td className="px-3 py-2 font-mono text-xs">{row.code}</td>
                      <td className="px-3 py-2">{row.name_cn}</td>
                      <td className="px-3 py-2">{row.product_kind}</td>
                      <td className="px-3 py-2 text-xs">{category ? category.path_code : "通用"}</td>
                      <td className="px-3 py-2">{row.value_type}</td>
                      <td className="px-3 py-2">{row.is_active ? "启用" : "停用"}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-2">
                          <button className={btnCls} type="button" onClick={() => startEdit(row)}>编辑</button>
                          <button className={btnCls} type="button" onClick={() => setSelectedDefId(row.id)}>选项</button>
                          <button className={btnCls} type="button" onClick={() => void toggleDef(row)} disabled={saving}>{row.is_active ? "停用" : "启用"}</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {sortedDefs.length === 0 ? <tr><td colSpan={7} className="px-3 py-8 text-center text-slate-400">暂无属性模板</td></tr> : null}
              </tbody>
            </table>
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold">选项维护</div>
            <div className="mt-1 text-xs text-slate-500">
              当前模板：{selectedDef ? `${selectedDef.name_cn} / ${selectedDef.code} / ${selectedDef.value_type}` : "未选择"}
            </div>

            {selectedDef?.value_type === "OPTION" ? (
              <form className="mt-3 grid gap-2 md:grid-cols-[1fr_1fr_100px_auto]" onSubmit={submitOption}>
                <input className={`${inputCls} font-mono`} placeholder="选项编码" value={optionCode} onChange={(e) => setOptionCode(e.target.value.toUpperCase())} />
                <input className={inputCls} placeholder="选项名称" value={optionName} onChange={(e) => setOptionName(e.target.value)} />
                <input className={inputCls} type="number" value={optionSortOrder} onChange={(e) => setOptionSortOrder(e.target.value)} />
                <button className={primaryBtnCls} disabled={saving} type="submit">新增选项</button>
              </form>
            ) : (
              <div className="mt-3 text-xs text-slate-500">只有 OPTION 类型属性可以维护选项。</div>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              {options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`rounded-full border px-3 py-1 text-xs ${option.is_active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-400"}`}
                  onClick={() => void toggleOption(option)}
                  disabled={saving}
                >
                  {option.option_name} / {option.option_code} / {option.is_active ? "启用" : "停用"}
                </button>
              ))}
              {options.length === 0 ? <span className="text-xs text-slate-400">暂无选项</span> : null}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
