import React, { useEffect, useMemo, useState } from "react";
import {
  createPmsBrand,
  disablePmsBrand,
  enablePmsBrand,
  fetchPmsBrands,
  updatePmsBrand,
  type PmsBrand,
} from "../api/masterDataApi";

const inputCls = "rounded border border-slate-300 bg-white px-3 py-2 text-sm";
const cardCls = "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm";
const btnCls = "rounded border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-60";
const primaryBtnCls = "rounded bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60";

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export default function PmsBrandsPage() {
  const [rows, setRows] = useState<PmsBrand[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [editing, setEditing] = useState<PmsBrand | null>(null);

  const [nameCn, setNameCn] = useState("");
  const [code, setCode] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [remark, setRemark] = useState("");

  const sorted = useMemo(
    () => [...rows].sort((a, b) => a.sort_order - b.sort_order || a.code.localeCompare(b.code)),
    [rows],
  );

  async function reload() {
    setLoading(true);
    setError(null);
    try {
      setRows(await fetchPmsBrands(false));
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
    setNameCn("");
    setCode("");
    setSortOrder("0");
    setRemark("");
  }

  function startEdit(row: PmsBrand) {
    setEditing(row);
    setNameCn(row.name_cn);
    setCode(row.code);
    setSortOrder(String(row.sort_order));
    setRemark(row.remark ?? "");
    setError(null);
    setHint(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const name = nameCn.trim();
    const brandCode = code.trim().toUpperCase();
    if (!name) {
      setError("请输入品牌名称");
      return;
    }
    if (!brandCode) {
      setError("请输入品牌编码");
      return;
    }

    setSaving(true);
    setError(null);
    setHint(null);
    try {
      const payload = {
        name_cn: name,
        code: brandCode,
        sort_order: Number(sortOrder) || 0,
        remark: remark.trim() || null,
      };

      if (editing) {
        await updatePmsBrand(editing.id, payload);
        setHint("品牌已保存");
      } else {
        await createPmsBrand(payload);
        setHint("品牌已新增");
      }

      resetForm();
      await reload();
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setSaving(false);
    }
  }

  async function toggle(row: PmsBrand) {
    setSaving(true);
    setError(null);
    setHint(null);
    try {
      if (row.is_active) {
        await disablePmsBrand(row.id);
        setHint(`已停用：${row.name_cn}`);
      } else {
        await enablePmsBrand(row.id);
        setHint(`已启用：${row.name_cn}`);
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
        <h1 className="text-2xl font-semibold text-slate-900">品牌管理</h1>
        <p className="mt-1 text-sm text-slate-500">维护 PMS 商品品牌主数据。商品只引用 brand_id，品牌名称作为展示投影。</p>
      </header>

      {error ? <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
      {hint ? <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{hint}</div> : null}

      <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <form className={cardCls} onSubmit={submit}>
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-semibold">{editing ? "编辑品牌" : "新增品牌"}</div>
            {editing ? <button type="button" className="text-xs text-slate-500" onClick={resetForm}>取消</button> : null}
          </div>

          <label className="block">
            <span className="mb-1 block text-xs text-slate-600">品牌名称</span>
            <input className={`${inputCls} w-full`} value={nameCn} onChange={(e) => setNameCn(e.target.value)} />
          </label>

          <label className="mt-3 block">
            <span className="mb-1 block text-xs text-slate-600">品牌编码</span>
            <input
              className={`${inputCls} w-full font-mono`}
              value={code}
              disabled={Boolean(editing?.is_locked)}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
          </label>

          <label className="mt-3 block">
            <span className="mb-1 block text-xs text-slate-600">排序</span>
            <input className={`${inputCls} w-full`} type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
          </label>

          <label className="mt-3 block">
            <span className="mb-1 block text-xs text-slate-600">备注</span>
            <textarea className={`${inputCls} min-h-20 w-full`} value={remark} onChange={(e) => setRemark(e.target.value)} />
          </label>

          <button type="submit" className={`${primaryBtnCls} mt-4`} disabled={saving}>
            {editing ? "保存品牌" : "新增品牌"}
          </button>
        </form>

        <section className={cardCls}>
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold">品牌列表</div>
            <button type="button" className={btnCls} onClick={() => void reload()} disabled={loading}>刷新</button>
          </div>

          <div className="overflow-auto rounded border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">名称</th>
                  <th className="px-3 py-2">编码</th>
                  <th className="px-3 py-2">排序</th>
                  <th className="px-3 py-2">状态</th>
                  <th className="px-3 py-2">操作</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="px-3 py-2">{row.id}</td>
                    <td className="px-3 py-2">{row.name_cn}</td>
                    <td className="px-3 py-2 font-mono">{row.code}</td>
                    <td className="px-3 py-2">{row.sort_order}</td>
                    <td className="px-3 py-2">{row.is_active ? "启用" : "停用"}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button type="button" className={btnCls} onClick={() => startEdit(row)}>编辑</button>
                        <button type="button" className={btnCls} onClick={() => void toggle(row)} disabled={saving}>
                          {row.is_active ? "停用" : "启用"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {sorted.length === 0 ? (
                  <tr><td colSpan={6} className="px-3 py-8 text-center text-slate-400">暂无品牌</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
