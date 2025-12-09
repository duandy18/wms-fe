// src/features/admin/suppliers/SuppliersListPage.tsx

import React, { useEffect, useState } from "react";
import PageTitle from "../../../components/ui/PageTitle";
import {
  fetchSuppliers,
  createSupplier,
  updateSupplier,
  type Supplier,
} from "./api";

type ApiErrorShape = {
  message?: string;
};

const getErrorMessage = (err: unknown, fallback: string): string => {
  const e = err as ApiErrorShape | undefined;
  return e?.message ?? fallback;
};

const SuppliersListPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [onlyActive, setOnlyActive] = useState(true);
  const [search, setSearch] = useState("");

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [wechat, setWechat] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  async function loadSuppliers() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSuppliers({
        active: onlyActive ? true : undefined,
        q: search.trim() || undefined,
      });
      setSuppliers(data);
    } catch (err: unknown) {
      console.error("fetchSuppliers failed", err);
      setError(getErrorMessage(err, "加载供应商失败"));
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSuppliers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);

    const n = name.trim();
    if (!n) {
      setCreateError("公司名称必填");
      return;
    }

    setCreating(true);
    try {
      await createSupplier({
        name: n,
        code: code.trim() || undefined,
        contact_name: contactName.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        wechat: wechat.trim() || undefined,
        active: true,
      });

      setName("");
      setCode("");
      setContactName("");
      setPhone("");
      setEmail("");
      setWechat("");

      await loadSuppliers();
    } catch (err: unknown) {
      console.error("createSupplier failed", err);
      setCreateError(getErrorMessage(err, "创建供应商失败"));
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(s: Supplier) {
    try {
      const updated = await updateSupplier(s.id, {
        active: !s.active,
      });
      setSuppliers((prev) =>
        prev.map((x) => (x.id === s.id ? updated : x)),
      );
    } catch (err: unknown) {
      console.error("updateSupplier failed", err);
    }
  }

  return (
    <div className="space-y-6 p-6">
      <PageTitle
        title="供应商主数据"
        description="维护供应商档案（公司名称、联系人、电话、邮箱、微信、启用状态），供采购单等业务引用。"
      />

      {/* 新建供应商表单 */}
      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-800">
            新建供应商
          </h2>
          {createError && (
            <div className="text-xs text-red-600">{createError}</div>
          )}
        </div>

        <form
          onSubmit={handleCreate}
          className="grid grid-cols-1 gap-3 text-sm md:grid-cols-6"
        >
          <div className="flex flex-col">
            <label className="text-xs text-slate-500">
              公司名称 *
            </label>
            <input
              className="mt-1 rounded-md border border-slate-300 px-2 py-1 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="如：上海某某宠物食品有限公司"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-slate-500">编码</label>
            <input
              className="mt-1 rounded-md border border-slate-300 px-2 py-1 text-sm"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="SUP-001"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-slate-500">联系人</label>
            <input
              className="mt-1 rounded-md border border-slate-300 px-2 py-1 text-sm"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-slate-500">电话</label>
            <input
              className="mt-1 rounded-md border border-slate-300 px-2 py-1 text-sm"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-slate-500">电子邮件</label>
            <input
              className="mt-1 rounded-md border border-slate-300 px-2 py-1 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-slate-500">微信号</label>
            <input
              className="mt-1 rounded-md border border-slate-300 px-2 py-1 text-sm"
              value={wechat}
              onChange={(e) => setWechat(e.target.value)}
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-xs font-medium text-white shadow-sm disabled:opacity-60"
            >
              {creating ? "创建中…" : "创建供应商"}
            </button>
          </div>
        </form>
      </section>

      {/* 筛选 + 列表 */}
      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-sm font-semibold text-slate-800">
            供应商列表
          </h2>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <label className="inline-flex items-center gap-1">
              <input
                type="checkbox"
                className="h-3 w-3 rounded border-slate-300"
                checked={onlyActive}
                onChange={(e) => setOnlyActive(e.target.checked)}
              />
              <span>仅显示启用</span>
            </label>

            <input
              className="w-40 rounded-md border border-slate-300 px-2 py-1"
              placeholder="名称 / 联系人 搜索"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <button
              type="button"
              disabled={loading}
              onClick={() => void loadSuppliers()}
              className="rounded-md border border-slate-300 px-3 py-1 text-xs hover:bg-slate-50 disabled:opacity-60"
            >
              {loading ? "查询中…" : "刷新"}
            </button>
          </div>
        </div>

        {error && (
          <div className="text-xs text-red-600">{error}</div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase text-slate-500">
                <th className="px-2 py-1 text-left">ID</th>
                <th className="px-2 py-1 text-left">名称</th>
                <th className="px-2 py-1 text-left">编码</th>
                <th className="px-2 py-1 text-left">联系人</th>
                <th className="px-2 py-1 text-left">电话</th>
                <th className="px-2 py-1 text-left">邮箱</th>
                <th className="px-2 py-1 text-left">微信</th>
                <th className="px-2 py-1 text-left">状态</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-2 py-4 text-center text-slate-400"
                  >
                    暂无供应商记录
                  </td>
                </tr>
              )}
              {suppliers.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-2 py-1 font-mono text-[11px]">
                    {s.id}
                  </td>
                  <td className="px-2 py-1">{s.name}</td>
                  <td className="px-2 py-1">{s.code ?? "-"}</td>
                  <td className="px-2 py-1">
                    {s.contact_name ?? "-"}
                  </td>
                  <td className="px-2 py-1">{s.phone ?? "-"}</td>
                  <td className="px-2 py-1">{s.email ?? "-"}</td>
                  <td className="px-2 py-1">{s.wechat ?? "-"}</td>
                  <td className="px-2 py-1">
                    <button
                      type="button"
                      onClick={() => void toggleActive(s)}
                      className={
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] " +
                        (s.active
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-200 text-slate-600")
                      }
                    >
                      {s.active ? "启用中" : "已停用"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default SuppliersListPage;
