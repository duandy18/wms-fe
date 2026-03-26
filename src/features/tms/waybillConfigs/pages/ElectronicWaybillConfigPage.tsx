// src/features/tms/waybillConfigs/pages/ElectronicWaybillConfigPage.tsx

import React, { useCallback, useEffect, useMemo, useState } from "react";
import PageTitle from "../../../../components/ui/PageTitle";
import { fetchShippingProviders } from "../../providers/api/providers";
import type { ShippingProvider } from "../../providers/api/types";
import {
  createWaybillConfig,
  fetchWaybillConfigs,
  updateWaybillConfig,
} from "../api";
import type { WaybillConfig } from "../types";

type FormState = {
  platform: string;
  shop_id: string;
  shipping_provider_id: string;
  customer_code: string;
  sender_name: string;
  sender_mobile: string;
  sender_phone: string;
  sender_province: string;
  sender_city: string;
  sender_district: string;
  sender_address: string;
  active: boolean;
};

const EMPTY_FORM: FormState = {
  platform: "",
  shop_id: "",
  shipping_provider_id: "",
  customer_code: "",
  sender_name: "",
  sender_mobile: "",
  sender_phone: "",
  sender_province: "",
  sender_city: "",
  sender_district: "",
  sender_address: "",
  active: true,
};

function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message || fallback;
  return fallback;
}

function trimToNull(v: string): string | null {
  const s = v.trim();
  return s ? s : null;
}

const cardCls = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";
const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500";
const labelCls = "mb-1 block text-sm font-medium text-slate-700";
const btnPrimaryCls =
  "rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60";
const btnSecondaryCls =
  "rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60";

const ElectronicWaybillConfigPage: React.FC = () => {
  const [configs, setConfigs] = useState<WaybillConfig[]>([]);
  const [providers, setProviders] = useState<ShippingProvider[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const providerOptions = useMemo(
    () =>
      providers.map((p) => ({
        id: p.id,
        label: `${p.name}${p.code ? ` (${p.code})` : ""}`,
      })),
    [providers],
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [providerList, configList] = await Promise.all([
        fetchShippingProviders(),
        fetchWaybillConfigs({
          active: onlyActive ? true : undefined,
          q: search.trim() || undefined,
        }),
      ]);
      setProviders(providerList);
      setConfigs(configList);
    } catch (e: unknown) {
      setError(toErrorMessage(e, "加载失败"));
    } finally {
      setLoading(false);
    }
  }, [onlyActive, search]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const resetForm = useCallback(() => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }, []);

  const patchForm = useCallback((patch: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setOk(null);
  }, []);

  const startEdit = useCallback((row: WaybillConfig) => {
    setEditingId(row.id);
    setForm({
      platform: row.platform ?? "",
      shop_id: row.shop_id ?? "",
      shipping_provider_id: String(row.shipping_provider_id ?? ""),
      customer_code: row.customer_code ?? "",
      sender_name: row.sender_name ?? "",
      sender_mobile: row.sender_mobile ?? "",
      sender_phone: row.sender_phone ?? "",
      sender_province: row.sender_province ?? "",
      sender_city: row.sender_city ?? "",
      sender_district: row.sender_district ?? "",
      sender_address: row.sender_address ?? "",
      active: Boolean(row.active),
    });
    setError(null);
    setOk(null);
  }, []);

  const onSubmit = useCallback(async () => {
    setError(null);
    setOk(null);

    const platform = form.platform.trim().toUpperCase();
    const shopId = form.shop_id.trim();
    const customerCode = form.customer_code.trim();
    const providerId = Number(form.shipping_provider_id);

    if (!platform) {
      setError("平台不能为空");
      return;
    }
    if (!shopId) {
      setError("店铺 ID 不能为空");
      return;
    }
    if (!Number.isFinite(providerId) || providerId <= 0) {
      setError("请选择快递网点");
      return;
    }
    if (!customerCode) {
      setError("客户号不能为空");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await updateWaybillConfig(editingId, {
          platform,
          shop_id: shopId,
          shipping_provider_id: providerId,
          customer_code: customerCode,
          sender_name: trimToNull(form.sender_name),
          sender_mobile: trimToNull(form.sender_mobile),
          sender_phone: trimToNull(form.sender_phone),
          sender_province: trimToNull(form.sender_province),
          sender_city: trimToNull(form.sender_city),
          sender_district: trimToNull(form.sender_district),
          sender_address: trimToNull(form.sender_address),
          active: form.active,
        });
        setOk("已更新电子面单配置");
      } else {
        await createWaybillConfig({
          platform,
          shop_id: shopId,
          shipping_provider_id: providerId,
          customer_code: customerCode,
          sender_name: trimToNull(form.sender_name),
          sender_mobile: trimToNull(form.sender_mobile),
          sender_phone: trimToNull(form.sender_phone),
          sender_province: trimToNull(form.sender_province),
          sender_city: trimToNull(form.sender_city),
          sender_district: trimToNull(form.sender_district),
          sender_address: trimToNull(form.sender_address),
          active: form.active,
        });
        setOk("已新建电子面单配置");
      }

      await loadData();
      resetForm();
    } catch (e: unknown) {
      setError(toErrorMessage(e, "保存失败"));
    } finally {
      setSaving(false);
    }
  }, [editingId, form, loadData, resetForm]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <PageTitle title="电子面单配置" />
        <button type="button" className={btnSecondaryCls} onClick={() => void loadData()} disabled={loading}>
          刷新
        </button>
      </div>

      <div className={cardCls}>
        <div className="text-sm text-slate-600">
          本页只维护店铺维度电子面单配置，发货作业页只消费配置，不在作业页内维护。
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : null}

      {ok ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{ok}</div>
      ) : null}

      <section className={cardCls}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">
            {editingId ? "编辑电子面单配置" : "新建电子面单配置"}
          </h2>
          {editingId ? (
            <button type="button" className={btnSecondaryCls} onClick={resetForm}>
              取消编辑
            </button>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className={labelCls}>平台 *</label>
            <input
              className={inputCls}
              value={form.platform}
              onChange={(e) => patchForm({ platform: e.target.value })}
              placeholder="例如：PDD"
            />
          </div>

          <div>
            <label className={labelCls}>店铺 ID *</label>
            <input
              className={inputCls}
              value={form.shop_id}
              onChange={(e) => patchForm({ shop_id: e.target.value })}
              placeholder="例如：shop-001"
            />
          </div>

          <div>
            <label className={labelCls}>快递网点 *</label>
            <select
              className={inputCls}
              value={form.shipping_provider_id}
              onChange={(e) => patchForm({ shipping_provider_id: e.target.value })}
            >
              <option value="">请选择</option>
              {providerOptions.map((opt) => (
                <option key={opt.id} value={String(opt.id)}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>客户号 *</label>
            <input
              className={inputCls}
              value={form.customer_code}
              onChange={(e) => patchForm({ customer_code: e.target.value })}
              placeholder="例如：CUST-001"
            />
          </div>

          <div>
            <label className={labelCls}>发件人</label>
            <input
              className={inputCls}
              value={form.sender_name}
              onChange={(e) => patchForm({ sender_name: e.target.value })}
            />
          </div>

          <div>
            <label className={labelCls}>手机号</label>
            <input
              className={inputCls}
              value={form.sender_mobile}
              onChange={(e) => patchForm({ sender_mobile: e.target.value })}
            />
          </div>

          <div>
            <label className={labelCls}>电话</label>
            <input
              className={inputCls}
              value={form.sender_phone}
              onChange={(e) => patchForm({ sender_phone: e.target.value })}
            />
          </div>

          <div className="flex items-end">
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => patchForm({ active: e.target.checked })}
              />
              启用
            </label>
          </div>

          <div>
            <label className={labelCls}>省</label>
            <input
              className={inputCls}
              value={form.sender_province}
              onChange={(e) => patchForm({ sender_province: e.target.value })}
            />
          </div>

          <div>
            <label className={labelCls}>市</label>
            <input
              className={inputCls}
              value={form.sender_city}
              onChange={(e) => patchForm({ sender_city: e.target.value })}
            />
          </div>

          <div>
            <label className={labelCls}>区</label>
            <input
              className={inputCls}
              value={form.sender_district}
              onChange={(e) => patchForm({ sender_district: e.target.value })}
            />
          </div>

          <div className="md:col-span-4">
            <label className={labelCls}>详细地址</label>
            <textarea
              className={inputCls}
              rows={2}
              value={form.sender_address}
              onChange={(e) => patchForm({ sender_address: e.target.value })}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button type="button" className={btnPrimaryCls} onClick={() => void onSubmit()} disabled={saving}>
            {saving ? "保存中…" : editingId ? "保存修改" : "新建配置"}
          </button>
          <button type="button" className={btnSecondaryCls} onClick={resetForm} disabled={saving}>
            重置
          </button>
        </div>
      </section>

      <section className={cardCls}>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[260px_auto]">
            <div>
              <label className={labelCls}>关键字</label>
              <input
                className={inputCls}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="平台 / 店铺 / 客户号 / 发件人 / 网点"
              />
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={onlyActive}
                onChange={(e) => setOnlyActive(e.target.checked)}
              />
              仅显示启用
            </label>
          </div>

          <button type="button" className={btnSecondaryCls} onClick={() => void loadData()} disabled={loading}>
            {loading ? "加载中…" : "查询"}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-slate-600">
                <th className="border-b border-slate-200 px-3 py-2">ID</th>
                <th className="border-b border-slate-200 px-3 py-2">平台</th>
                <th className="border-b border-slate-200 px-3 py-2">店铺</th>
                <th className="border-b border-slate-200 px-3 py-2">快递网点</th>
                <th className="border-b border-slate-200 px-3 py-2">客户号</th>
                <th className="border-b border-slate-200 px-3 py-2">发件人</th>
                <th className="border-b border-slate-200 px-3 py-2">状态</th>
                <th className="border-b border-slate-200 px-3 py-2">操作</th>
              </tr>
            </thead>
            <tbody>
              {configs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-slate-500">
                    {loading ? "加载中…" : "暂无记录"}
                  </td>
                </tr>
              ) : (
                configs.map((row) => (
                  <tr key={row.id} className="text-slate-800">
                    <td className="border-b border-slate-100 px-3 py-2">{row.id}</td>
                    <td className="border-b border-slate-100 px-3 py-2">{row.platform || "—"}</td>
                    <td className="border-b border-slate-100 px-3 py-2">{row.shop_id || "—"}</td>
                    <td className="border-b border-slate-100 px-3 py-2">{row.shipping_provider_name || "—"}</td>
                    <td className="border-b border-slate-100 px-3 py-2">{row.customer_code || "—"}</td>
                    <td className="border-b border-slate-100 px-3 py-2">{row.sender_name || "—"}</td>
                    <td className="border-b border-slate-100 px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          row.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {row.active ? "启用" : "停用"}
                      </span>
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2">
                      <button
                        type="button"
                        className={btnSecondaryCls}
                        onClick={() => startEdit(row)}
                      >
                        编辑
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default ElectronicWaybillConfigPage;
