// src/features/pms/sku-coding/pages/SkuCodingDictionariesPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  createSkuCodeTerm,
  disableSkuCodeTerm,
  enableSkuCodeTerm,
  fetchSkuCodeTermGroups,
  fetchSkuCodeTerms,
  updateSkuCodeTerm,
  type SkuCodeTerm,
  type SkuCodeTermGroup,
} from "../api/skuCodingApi";

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
  const [groups, setGroups] = useState<SkuCodeTermGroup[]>([]);
  const [terms, setTerms] = useState<SkuCodeTerm[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  const [editingTerm, setEditingTerm] = useState<SkuCodeTerm | null>(null);
  const [termGroupId, setTermGroupId] = useState<number>(0);
  const [termName, setTermName] = useState("");
  const [termCode, setTermCode] = useState("");
  const [termSortOrder, setTermSortOrder] = useState(0);
  const [termRemark, setTermRemark] = useState("");

  const groupMap = useMemo(() => {
    const out = new Map<number, SkuCodeTermGroup>();
    for (const group of groups) out.set(group.id, group);
    return out;
  }, [groups]);

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
      const [groupRows, termRows] = await Promise.all([
        fetchSkuCodeTermGroups(undefined, false),
        fetchSkuCodeTerms(undefined, false),
      ]);

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

  function resetTermForm() {
    setEditingTerm(null);
    setTermGroupId(groups[0]?.id ?? 0);
    setTermName("");
    setTermCode("");
    setTermSortOrder(0);
    setTermRemark("");
  }

  function startEditTerm(row: SkuCodeTerm) {
    clearMessages();
    setEditingTerm(row);
    setTermGroupId(row.group_id);
    setTermName(row.name_cn);
    setTermCode(row.code);
    setTermSortOrder(row.sort_order);
    setTermRemark(row.remark ?? "");
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
          这里只维护 SKU 编码使用的属性词典。品牌与内部分类已经提升为 PMS 商品主数据，请到对应页面维护。
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
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

      {loading ? <div className="text-sm text-slate-400">加载中...</div> : null}
    </div>
  );
}
