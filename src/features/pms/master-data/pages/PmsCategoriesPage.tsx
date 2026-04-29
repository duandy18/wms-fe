import React, { useEffect, useMemo, useState } from "react";
import {
  createPmsCategory,
  disablePmsCategory,
  enablePmsCategory,
  fetchPmsCategories,
  updatePmsCategory,
  type PmsCategory,
  type ProductKind,
} from "../api/masterDataApi";

const inputCls = "rounded border border-slate-300 bg-white px-3 py-2 text-sm";
const cardCls = "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm";
const btnCls = "rounded border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-60";
const primaryBtnCls = "rounded bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60";

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

function parseIntOrZero(v: string): number {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : 0;
}

export default function PmsCategoriesPage() {
  const [rows, setRows] = useState<PmsCategory[]>([]);
  const [editing, setEditing] = useState<PmsCategory | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  const [productKind, setProductKind] = useState<ProductKind>("OTHER");
  const [level, setLevel] = useState("1");
  const [parentId, setParentId] = useState("0");
  const [categoryName, setCategoryName] = useState("");
  const [categoryCode, setCategoryCode] = useState("");
  const [isLeaf, setIsLeaf] = useState(true);
  const [sortOrder, setSortOrder] = useState("0");
  const [remark, setRemark] = useState("");

  const sorted = useMemo(
    () => [...rows].sort((a, b) => a.product_kind.localeCompare(b.product_kind) || a.level - b.level || a.path_code.localeCompare(b.path_code)),
    [rows],
  );

  const parentOptions = useMemo(() => {
    const lv = parseIntOrZero(level);
    return rows.filter((x) => x.product_kind === productKind && x.level === lv - 1 && x.is_active);
  }, [rows, productKind, level]);

  async function reload() {
    setLoading(true);
    setError(null);
    try {
      setRows(await fetchPmsCategories(undefined, false));
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
  }, []);

  function resetForm() {
    setEditing(null);
    setProductKind("OTHER");
    setLevel("1");
    setParentId("0");
    setCategoryName("");
    setCategoryCode("");
    setIsLeaf(true);
    setSortOrder("0");
    setRemark("");
  }

  function startEdit(row: PmsCategory) {
    setEditing(row);
    setProductKind(row.product_kind);
    setLevel(String(row.level));
    setParentId(row.parent_id == null ? "0" : String(row.parent_id));
    setCategoryName(row.category_name);
    setCategoryCode(row.category_code);
    setIsLeaf(row.is_leaf);
    setSortOrder(String(row.sort_order));
    setRemark(row.remark ?? "");
    setError(null);
    setHint(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const name = categoryName.trim();
    const code = categoryCode.trim().toUpperCase();
    const lv = parseIntOrZero(level);

    if (!name) {
      setError("请输入分类名称");
      return;
    }
    if (!code) {
      setError("请输入分类编码");
      return;
    }
    if (!editing && lv > 1 && parseIntOrZero(parentId) <= 0) {
      setError("二级/三级分类必须选择父级");
      return;
    }

    setSaving(true);
    setError(null);
    setHint(null);
    try {
      if (editing) {
        await updatePmsCategory(editing.id, {
          category_name: name,
          category_code: code,
          is_leaf: isLeaf,
          sort_order: Number(sortOrder) || 0,
          remark: remark.trim() || null,
        });
        setHint("内部分类已保存");
      } else {
        await createPmsCategory({
          parent_id: lv === 1 ? null : parseIntOrZero(parentId),
          level: lv,
          product_kind: productKind,
          category_name: name,
          category_code: code,
          is_leaf: isLeaf,
          sort_order: Number(sortOrder) || 0,
          remark: remark.trim() || null,
        });
        setHint("内部分类已新增");
      }
      resetForm();
      await reload();
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setSaving(false);
    }
  }

  async function toggle(row: PmsCategory) {
    setSaving(true);
    setError(null);
    setHint(null);
    try {
      if (row.is_active) {
        await disablePmsCategory(row.id);
        setHint(`已停用：${row.category_name}`);
      } else {
        await enablePmsCategory(row.id);
        setHint(`已启用：${row.category_name}`);
      }
      await reload();
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">内部分类</h1>
        <p className="mt-1 text-sm text-slate-500">维护 PMS 内部分类树。商品只绑定叶子分类。</p>
      </header>

      {error ? <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
      {hint ? <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{hint}</div> : null}

      <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
        <form className={cardCls} onSubmit={submit}>
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-semibold">{editing ? "编辑分类" : "新增分类"}</div>
            {editing ? <button type="button" className="text-xs text-slate-500" onClick={resetForm}>取消</button> : null}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label>
              <span className="mb-1 block text-xs text-slate-600">商品类型</span>
              <select className={`${inputCls} w-full`} value={productKind} disabled={Boolean(editing)} onChange={(e) => setProductKind(e.target.value as ProductKind)}>
                <option value="FOOD">食品</option>
                <option value="SUPPLY">用品</option>
                <option value="OTHER">其他</option>
              </select>
            </label>

            <label>
              <span className="mb-1 block text-xs text-slate-600">层级</span>
              <select
                className={`${inputCls} w-full`}
                value={level}
                disabled={Boolean(editing)}
                onChange={(e) => {
                  setLevel(e.target.value);
                  setParentId("0");
                  setIsLeaf(e.target.value === "3");
                }}
              >
                <option value="1">一级</option>
                <option value="2">二级</option>
                <option value="3">三级</option>
              </select>
            </label>
          </div>

          {parseIntOrZero(level) > 1 ? (
            <label className="mt-3 block">
              <span className="mb-1 block text-xs text-slate-600">父级分类</span>
              <select className={`${inputCls} w-full`} value={parentId} disabled={Boolean(editing)} onChange={(e) => setParentId(e.target.value)}>
                <option value="0">请选择父级</option>
                {parentOptions.map((row) => (
                  <option key={row.id} value={String(row.id)}>{row.path_code} / {row.category_name}</option>
                ))}
              </select>
            </label>
          ) : null}

          <label className="mt-3 block">
            <span className="mb-1 block text-xs text-slate-600">分类名称</span>
            <input className={`${inputCls} w-full`} value={categoryName} onChange={(e) => setCategoryName(e.target.value)} />
          </label>

          <label className="mt-3 block">
            <span className="mb-1 block text-xs text-slate-600">分类编码</span>
            <input className={`${inputCls} w-full font-mono`} value={categoryCode} disabled={Boolean(editing?.is_locked)} onChange={(e) => setCategoryCode(e.target.value.toUpperCase())} />
          </label>

          <label className="mt-3 block">
            <span className="mb-1 block text-xs text-slate-600">排序</span>
            <input className={`${inputCls} w-full`} type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
          </label>

          <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={isLeaf} onChange={(e) => setIsLeaf(e.target.checked)} />
            叶子分类，可绑定商品
          </label>

          <label className="mt-3 block">
            <span className="mb-1 block text-xs text-slate-600">备注</span>
            <textarea className={`${inputCls} min-h-20 w-full`} value={remark} onChange={(e) => setRemark(e.target.value)} />
          </label>

          <button type="submit" className={`${primaryBtnCls} mt-4`} disabled={saving}>
            {editing ? "保存分类" : "新增分类"}
          </button>
        </form>

        <section className={cardCls}>
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold">分类列表</div>
            <button type="button" className={btnCls} onClick={() => void reload()} disabled={loading}>刷新</button>
          </div>

          <div className="overflow-auto rounded border border-slate-200">
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
                {sorted.map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="px-3 py-2">{row.product_kind}</td>
                    <td className="px-3 py-2">{row.level}</td>
                    <td className="px-3 py-2 font-mono text-xs">{row.path_code}</td>
                    <td className="px-3 py-2">{row.category_name}</td>
                    <td className="px-3 py-2">{row.is_leaf ? "是" : "否"}</td>
                    <td className="px-3 py-2">{row.is_active ? "启用" : "停用"}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button type="button" className={btnCls} onClick={() => startEdit(row)}>编辑</button>
                        <button type="button" className={btnCls} onClick={() => void toggle(row)} disabled={saving}>{row.is_active ? "停用" : "启用"}</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {sorted.length === 0 ? (
                  <tr><td colSpan={7} className="px-3 py-8 text-center text-slate-400">暂无分类</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
