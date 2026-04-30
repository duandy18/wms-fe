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
  lockItemAttributeDef,
  unlockItemAttributeDef,
  updateItemAttributeDef,
  updateItemAttributeOption,
  type AttributeProductKind,
  type AttributeSelectionMode,
  type AttributeValueType,
  type ItemAttributeDef,
  type ItemAttributeOption,
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

function productKindLabel(v: AttributeProductKind): string {
  if (v === "FOOD") return "食品";
  if (v === "SUPPLY") return "用品";
  if (v === "COMMON") return "通用";
  return "其他";
}

function valueTypeLabel(v: AttributeValueType): string {
  if (v === "TEXT") return "文本输入";
  if (v === "NUMBER") return "数字输入";
  if (v === "OPTION") return "预设选项";
  if (v === "BOOL") return "是/否选择";
  return v;
}

function selectionModeLabel(v: AttributeSelectionMode): string {
  return v === "MULTI" ? "多选" : "单选";
}

export default function PmsAttributeDefsPage() {
  const [defs, setDefs] = useState<ItemAttributeDef[]>([]);
  const [options, setOptions] = useState<ItemAttributeOption[]>([]);
  const [selectedDefId, setSelectedDefId] = useState<number>(0);
  const [editing, setEditing] = useState<ItemAttributeDef | null>(null);
  const [editingOption, setEditingOption] = useState<ItemAttributeOption | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [nameCn, setNameCn] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [productKind, setProductKind] = useState<AttributeProductKind>("COMMON");
  const [valueType, setValueType] = useState<AttributeValueType>("TEXT");
  const [selectionMode, setSelectionMode] = useState<AttributeSelectionMode>("SINGLE");
  const [unit, setUnit] = useState("");
  const [isItemRequired, setIsItemRequired] = useState(false);
  const [isSkuRequired, setIsSkuRequired] = useState(false);
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
          a.sort_order - b.sort_order ||
          a.code.localeCompare(b.code),
      ),
    [defs],
  );

  const selectedDef = useMemo(
    () => defs.find((x) => x.id === selectedDefId) ?? null,
    [defs, selectedDefId],
  );

  function resetOptionForm() {
    setEditingOption(null);
    setOptionCode("");
    setOptionName("");
    setOptionSortOrder("0");
  }

  async function reload() {
    setLoading(true);
    setError(null);
    try {
      const defRows = await fetchItemAttributeDefs({ active_only: false });
      setDefs(defRows);
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
    resetOptionForm();
    void reloadOptions(selectedDefId);
  }, [selectedDefId]);

  function resetForm() {
    setEditing(null);
    setCode("");
    setNameCn("");
    setNameEn("");
    setProductKind("COMMON");
    setValueType("TEXT");
    setSelectionMode("SINGLE");
    setUnit("");
    setIsItemRequired(false);
    setIsSkuRequired(false);
    setIsSkuSegment(false);
    setSortOrder("0");
    setRemark("");
  }

  function startEdit(row: ItemAttributeDef) {
    setEditing(row);
    setSelectedDefId(row.id);
    setCode(row.code);
    setNameCn(row.name_cn);
    setNameEn(row.name_en ?? "");
    setProductKind(row.product_kind);
    setValueType(row.value_type);
    setSelectionMode(row.selection_mode);
    setUnit(row.unit ?? "");
    setIsItemRequired(row.is_item_required);
    setIsSkuRequired(row.is_sku_required);
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
    const nextNameEn = nameEn.trim();
    const nextSelectionMode = valueType === "OPTION" ? selectionMode : "SINGLE";

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
          name_en: nextNameEn || null,
          selection_mode: nextSelectionMode,
          unit: unit.trim() || null,
          is_item_required: isItemRequired,
          is_sku_required: isSkuRequired,
          is_sku_segment: isSkuSegment,
          sort_order: numOrZero(sortOrder),
          remark: remark.trim() || null,
        });
        setHint("属性模板已保存");
      } else {
        await createItemAttributeDef({
          code: nextCode,
          name_cn: nextName,
          name_en: nextNameEn || null,
          product_kind: productKind,
          value_type: valueType,
          selection_mode: nextSelectionMode,
          unit: unit.trim() || null,
          is_item_required: isItemRequired,
          is_sku_required: isSkuRequired,
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

  async function toggleLock(row: ItemAttributeDef) {
    setSaving(true);
    setError(null);
    setHint(null);
    try {
      if (row.is_locked) {
        await unlockItemAttributeDef(row.id);
        setHint(`已解锁属性模板：${row.name_cn}`);
      } else {
        await lockItemAttributeDef(row.id);
        setHint(`已锁定属性模板：${row.name_cn}`);
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
      setError("请选择填写方式为预设选项的属性模板");
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
      if (editingOption) {
        await updateItemAttributeOption(editingOption.id, {
          option_name: optionName.trim(),
          sort_order: numOrZero(optionSortOrder),
        });
        setHint("预设选项已保存");
      } else {
        await createItemAttributeOption(selectedDef.id, {
          option_code: optionCode.trim().toUpperCase(),
          option_name: optionName.trim(),
          sort_order: numOrZero(optionSortOrder),
        });
        setHint("预设选项已新增");
      }
      resetOptionForm();
      await reloadOptions(selectedDef.id);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setSaving(false);
    }
  }

  function startEditOption(row: ItemAttributeOption) {
    setEditingOption(row);
    setOptionCode(row.option_code);
    setOptionName(row.option_name);
    setOptionSortOrder(String(row.sort_order));
    setError(null);
    setHint(null);
  }

  async function toggleOption(row: ItemAttributeOption) {
    setSaving(true);
    setError(null);
    setHint(null);
    try {
      if (row.is_active) {
        await disableItemAttributeOption(row.id);
        setHint(`已停用预设选项：${row.option_name}`);
      } else {
        await enableItemAttributeOption(row.id);
        setHint(`已启用预设选项：${row.option_name}`);
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
        <p className="mt-1 text-sm text-slate-500">定义商品属性模板、填写方式、选择方式、SKU 参与关系，以及预设选项的选项值。</p>
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

          <label className="mt-3 block">
            <span className="mb-1 block text-xs text-slate-600">英文名称</span>
            <input className={`${inputCls} w-full`} value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
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
              <span className="mb-1 block text-xs text-slate-600">填写方式</span>
              <select
                className={`${inputCls} w-full`}
                value={valueType}
                disabled={Boolean(editing)}
                onChange={(e) => {
                  const next = e.target.value as AttributeValueType;
                  setValueType(next);
                  if (next !== "OPTION") setSelectionMode("SINGLE");
                }}
              >
                <option value="TEXT">文本输入</option>
                <option value="NUMBER">数字输入</option>
                <option value="OPTION">预设选项</option>
                <option value="BOOL">是/否选择</option>
              </select>
            </label>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label>
              <span className="mb-1 block text-xs text-slate-600">选择方式</span>
              <select
                className={`${inputCls} w-full`}
                value={selectionMode}
                disabled={valueType !== "OPTION" || Boolean(editing?.is_locked)}
                onChange={(e) => setSelectionMode(e.target.value as AttributeSelectionMode)}
              >
                <option value="SINGLE">单选</option>
                <option value="MULTI">多选</option>
              </select>
            </label>

            <label>
              <span className="mb-1 block text-xs text-slate-600">单位</span>
              <input className={`${inputCls} w-full`} value={unit} onChange={(e) => setUnit(e.target.value)} />
            </label>
          </div>

          <label className="mt-3 block">
            <span className="mb-1 block text-xs text-slate-600">排序</span>
            <input className={`${inputCls} w-full`} type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
          </label>

          <div className="mt-3 grid gap-2 text-sm text-slate-700">
            <label className="flex items-center gap-2"><input type="checkbox" checked={isItemRequired} onChange={(e) => setIsItemRequired(e.target.checked)} /> 商品资料必填</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={isSkuRequired} onChange={(e) => setIsSkuRequired(e.target.checked)} /> SKU 生成必填</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={isSkuSegment} onChange={(e) => setIsSkuSegment(e.target.checked)} /> 参与 SKU 编码</label>
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
                  <th className="px-3 py-2">属性编码</th>
                  <th className="px-3 py-2">属性名称</th>
                  <th className="px-3 py-2">英文名称</th>
                  <th className="px-3 py-2">商品类型</th>
                  <th className="px-3 py-2">填写方式</th>
                  <th className="px-3 py-2">选择方式</th>
                  <th className="px-3 py-2">单位</th>
                  <th className="px-3 py-2">商品资料必填</th>
                  <th className="px-3 py-2">SKU必填</th>
                  <th className="px-3 py-2">参与SKU</th>
                  <th className="px-3 py-2">启用状态</th>
                  <th className="px-3 py-2">锁定</th>
                  <th className="px-3 py-2">排序</th>
                  <th className="px-3 py-2">备注</th>
                  <th className="px-3 py-2 text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {sortedDefs.map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">{row.code}</td>
                    <td className="whitespace-nowrap px-3 py-2">{row.name_cn}</td>
                    <td className="whitespace-nowrap px-3 py-2">{row.name_en || "-"}</td>
                    <td className="whitespace-nowrap px-3 py-2">{productKindLabel(row.product_kind)}</td>
                    <td className="whitespace-nowrap px-3 py-2">
                      {row.value_type === "OPTION" ? (
                        <button
                          type="button"
                          className="text-sm text-slate-900 underline decoration-dotted underline-offset-4 hover:text-slate-600"
                          onClick={() => setSelectedDefId(row.id)}
                        >
                          {valueTypeLabel(row.value_type)}
                        </button>
                      ) : (
                        valueTypeLabel(row.value_type)
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">{selectionModeLabel(row.selection_mode)}</td>
                    <td className="whitespace-nowrap px-3 py-2">{row.unit || "-"}</td>
                    <td className="whitespace-nowrap px-3 py-2">{row.is_item_required ? "是" : "否"}</td>
                    <td className="whitespace-nowrap px-3 py-2">{row.is_sku_required ? "是" : "否"}</td>
                    <td className="whitespace-nowrap px-3 py-2">{row.is_sku_segment ? "是" : "否"}</td>
                    <td className="whitespace-nowrap px-3 py-2">{row.is_active ? "启用" : "停用"}</td>
                    <td className="whitespace-nowrap px-3 py-2">{row.is_locked ? "已锁定" : "未锁定"}</td>
                    <td className="whitespace-nowrap px-3 py-2">{row.sort_order}</td>
                    <td className="min-w-40 px-3 py-2 text-xs text-slate-500">{row.remark || "-"}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap justify-center gap-2">
                        <button className={btnCls} type="button" onClick={() => startEdit(row)}>编辑</button>
                        <button className={btnCls} type="button" onClick={() => void toggleDef(row)} disabled={saving}>{row.is_active ? "停用" : "启用"}</button>
                        <button className={btnCls} type="button" onClick={() => void toggleLock(row)} disabled={saving}>{row.is_locked ? "解锁" : "锁定"}</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {sortedDefs.length === 0 ? <tr><td colSpan={15} className="px-3 py-8 text-center text-slate-400">暂无属性模板</td></tr> : null}
              </tbody>
            </table>
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold">预设选项维护</div>
            <div className="mt-1 text-xs text-slate-500">
              当前维护：{selectedDef ? `${selectedDef.name_cn} / ${selectedDef.code} / ${valueTypeLabel(selectedDef.value_type)} / ${selectionModeLabel(selectedDef.selection_mode)}` : "未选择"}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              停用操作会从新商品选择中移除该预设选项，不会物理删除历史引用。
            </div>

            {selectedDef?.value_type === "OPTION" ? (
              <>
                <form className="mt-3 grid gap-2 md:grid-cols-[1fr_1fr_100px_auto_auto]" onSubmit={submitOption}>
                  <input
                    className={`${inputCls} font-mono`}
                    placeholder="选项编码"
                    value={optionCode}
                    disabled={Boolean(editingOption)}
                    onChange={(e) => setOptionCode(e.target.value.toUpperCase())}
                  />
                  <input className={inputCls} placeholder="选项名称" value={optionName} onChange={(e) => setOptionName(e.target.value)} />
                  <input className={inputCls} type="number" value={optionSortOrder} onChange={(e) => setOptionSortOrder(e.target.value)} />
                  <button className={primaryBtnCls} disabled={saving} type="submit">{editingOption ? "保存选项" : "新增选项"}</button>
                  {editingOption ? (
                    <button className={btnCls} disabled={saving} type="button" onClick={resetOptionForm}>取消编辑</button>
                  ) : null}
                </form>

                <div className="mt-3 overflow-auto rounded border border-slate-200 bg-white">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs text-slate-500">
                      <tr>
                        <th className="px-3 py-2">选项编码</th>
                        <th className="px-3 py-2">选项名称</th>
                        <th className="px-3 py-2">启用状态</th>
                        <th className="px-3 py-2">排序</th>
                        <th className="px-3 py-2 text-center">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {options.map((option) => (
                        <tr key={option.id} className="border-t">
                          <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">{option.option_code}</td>
                          <td className="whitespace-nowrap px-3 py-2">{option.option_name}</td>
                          <td className="whitespace-nowrap px-3 py-2">{option.is_active ? "启用" : "停用"}</td>
                          <td className="whitespace-nowrap px-3 py-2">{option.sort_order}</td>
                          <td className="px-3 py-2">
                            <div className="flex flex-wrap justify-center gap-2">
                              <button className={btnCls} type="button" onClick={() => startEditOption(option)} disabled={saving}>
                                编辑
                              </button>
                              <button className={btnCls} type="button" onClick={() => void toggleOption(option)} disabled={saving}>
                                {option.is_active ? "停用" : "启用"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {options.length === 0 ? (
                        <tr><td colSpan={5} className="px-3 py-6 text-center text-slate-400">暂无预设选项</td></tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="mt-3 text-xs text-slate-500">当前模板不是预设选项填写方式，无需维护选项。</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
