// src/features/admin/shipping-providers/ShippingProvidersListPage.tsx

import React, { useEffect, useState } from "react";
import PageTitle from "../../../components/ui/PageTitle";
import {
  fetchShippingProviders,
  createShippingProvider,
  updateShippingProvider,
  type ShippingProvider,
} from "./api";

type ApiErrorShape = {
  message?: string;
};

type ByWeightPricingModel = {
  type?: string;
  base_weight?: number;
  base_cost?: number;
  extra_unit?: number;
  extra_cost?: number;
};

const getErrorMessage = (err: unknown, fallback: string): string => {
  const e = err as ApiErrorShape | undefined;
  return e?.message ?? fallback;
};

const ShippingProvidersListPage: React.FC = () => {
  const [providers, setProviders] = useState<ShippingProvider[]>([]);
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

  // 计费模型配置相关状态
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [pricingBaseWeight, setPricingBaseWeight] = useState("1.0");
  const [pricingBaseCost, setPricingBaseCost] = useState("3.5");
  const [pricingExtraUnit, setPricingExtraUnit] = useState("1.0");
  const [pricingExtraCost, setPricingExtraCost] = useState("1.0");
  const [pricingPriority, setPricingPriority] = useState("100");
  const [regionRulesJson, setRegionRulesJson] = useState<string>("");
  const [pricingSaving, setPricingSaving] = useState(false);
  const [pricingError, setPricingError] = useState<string | null>(null);

  async function loadProviders() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchShippingProviders({
        active: onlyActive ? true : undefined,
        q: search.trim() || undefined,
      });
      setProviders(data);
      // 如果当前选中项不存在了，清空选择
      if (selectedId && !data.some((p) => p.id === selectedId)) {
        setSelectedId(null);
      }
    } catch (err: unknown) {
      console.error("fetchShippingProviders failed", err);
      setError(getErrorMessage(err, "加载物流/快递公司失败"));
      setProviders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProviders();
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
      await createShippingProvider({
        name: n,
        code: code.trim() || undefined,
        contact_name: contactName.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        wechat: wechat.trim() || undefined,
        active: true,
        priority: 100,
      });

      setName("");
      setCode("");
      setContactName("");
      setPhone("");
      setEmail("");
      setWechat("");

      await loadProviders();
    } catch (err: unknown) {
      console.error("createShippingProvider failed", err);
      setCreateError(getErrorMessage(err, "创建物流/快递公司失败"));
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(p: ShippingProvider) {
    try {
      const updated = await updateShippingProvider(p.id, {
        active: !p.active,
      });
      setProviders((prev) =>
        prev.map((x) => (x.id === p.id ? updated : x)),
      );
    } catch (err: unknown) {
      console.error("updateShippingProvider failed", err);
    }
  }

  function handleSelectForPricing(id: number) {
    setSelectedId(id);
    setPricingError(null);
    const p = providers.find((x) => x.id === id);
    if (!p) return;

    const pm = (p.pricing_model ?? {}) as ByWeightPricingModel;
    const type = pm.type ?? "by_weight";

    if (type !== "by_weight") {
      setPricingBaseWeight("1.0");
      setPricingBaseCost("0.0");
      setPricingExtraUnit("1.0");
      setPricingExtraCost("0.0");
    } else {
      setPricingBaseWeight(String(pm.base_weight ?? 1.0));
      setPricingBaseCost(String(pm.base_cost ?? 0.0));
      setPricingExtraUnit(String(pm.extra_unit ?? 1.0));
      setPricingExtraCost(String(pm.extra_cost ?? 0.0));
    }

    setPricingPriority(String(p.priority ?? 100));

    if (p.region_rules) {
      setRegionRulesJson(JSON.stringify(p.region_rules, null, 2));
    } else {
      setRegionRulesJson("");
    }
  }

  async function handleSavePricing(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) {
      setPricingError("请先在下拉框中选择一个物流公司");
      return;
    }

    setPricingError(null);

    const baseWeight = Number(pricingBaseWeight);
    const baseCost = Number(pricingBaseCost);
    const extraUnit = Number(pricingExtraUnit);
    const extraCost = Number(pricingExtraCost);
    const priority = Number(pricingPriority || "100");

    if (!Number.isFinite(baseWeight) || baseWeight <= 0) {
      setPricingError("首重重量必须是 > 0 的数字");
      return;
    }
    if (!Number.isFinite(extraUnit) || extraUnit <= 0) {
      setPricingError("续重单位必须是 > 0 的数字");
      return;
    }

    let regionRules: Record<string, unknown> | null = null;
    if (regionRulesJson.trim()) {
      try {
        const parsed = JSON.parse(
          regionRulesJson,
        ) as Record<string, unknown>;
        regionRules = parsed;
      } catch (err: unknown) {
        console.error("parse region_rules JSON failed", err);
        setPricingError("区域规则 JSON 解析失败，请检查格式");
        return;
      }
    }

    const pricingModel: ByWeightPricingModel = {
      type: "by_weight",
      base_weight: baseWeight,
      base_cost: baseCost,
      extra_unit: extraUnit,
      extra_cost: extraCost,
    };

    setPricingSaving(true);
    try {
      const updated = await updateShippingProvider(selectedId, {
        priority,
        pricing_model: pricingModel,
        region_rules: regionRules,
      });

      setProviders((prev) =>
        prev.map((x) => (x.id === updated.id ? updated : x)),
      );
      // 更新本地回填
      handleSelectForPricing(updated.id);
    } catch (err: unknown) {
      console.error("updateShippingProvider (pricing) failed", err);
      setPricingError(getErrorMessage(err, "保存计费模型失败"));
    } finally {
      setPricingSaving(false);
    }
  }

  const selectedProvider = selectedId
    ? providers.find((p) => p.id === selectedId) ?? null
    : null;

  return (
    <div className="space-y-6 p-6">
      <PageTitle
        title="物流 / 快递公司"
        description="维护物流/快递公司主数据，并配置计费模型（用于发货 Cockpit 和成本计算）。"
      />

      {/* 新建公司 */}
      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-800">
            新建物流/快递公司
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
              placeholder="如：顺丰速运 / 中通快递"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-slate-500">编码</label>
            <input
              className="mt-1 rounded-md border border-slate-300 px-2 py-1 text-sm"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="SF / ZTO / JT 等"
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
              {creating ? "创建中…" : "创建物流/快递公司"}
            </button>
          </div>
        </form>
      </section>

      {/* 列表 */}
      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-sm font-semibold text-slate-800">
            物流/快递公司列表
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
              onClick={() => void loadProviders()}
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
                <th className="px-2 py-1 text-left">优先级</th>
                <th className="px-2 py-1 text-left">状态</th>
                <th className="px-2 py-1 text-left">计费模型</th>
              </tr>
            </thead>
            <tbody>
              {providers.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="px-2 py-4 text-center text-slate-400"
                  >
                    暂无记录
                  </td>
                </tr>
              )}
              {providers.map((p) => {
                const hasPricing = !!p.pricing_model;
                return (
                  <tr
                    key={p.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-2 py-1 font-mono text-[11px]">
                      {p.id}
                    </td>
                    <td className="px-2 py-1">{p.name}</td>
                    <td className="px-2 py-1">{p.code ?? "-"}</td>
                    <td className="px-2 py-1">
                      {p.contact_name ?? "-"}
                    </td>
                    <td className="px-2 py-1">{p.phone ?? "-"}</td>
                    <td className="px-2 py-1">{p.email ?? "-"}</td>
                    <td className="px-2 py-1">{p.wechat ?? "-"}
                    </td>
                    <td className="px-2 py-1 font-mono">
                      {p.priority ?? 100}
                    </td>
                    <td className="px-2 py-1">
                      <button
                        type="button"
                        onClick={() => void toggleActive(p)}
                        className={
                          "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] " +
                          (p.active
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-200 text-slate-600")
                        }
                      >
                        {p.active ? "启用中" : "已停用"}
                      </button>
                    </td>
                    <td className="px-2 py-1">
                      <button
                        type="button"
                        onClick={() => handleSelectForPricing(p.id)}
                        className={
                          "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] " +
                          (selectedId === p.id
                            ? "border-sky-600 bg-sky-50 text-sky-700"
                            : "border-slate-300 bg-white text-slate-700 hover:border-sky-400")
                        }
                      >
                        {hasPricing ? "编辑费率" : "配置费率"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 计费模型配置 */}
      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-800">
            计费模型配置（by_weight）
          </h2>
          {pricingError && (
            <div className="text-xs text-red-600">
              {pricingError}
            </div>
          )}
        </div>

        <form
          onSubmit={handleSavePricing}
          className="space-y-3 text-sm"
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="flex flex-col">
              <label className="text-xs text-slate-500">
                选择物流公司
              </label>
              <select
                className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                value={selectedId ?? ""}
                onChange={(e) =>
                  handleSelectForPricing(
                    e.target.value ? Number(e.target.value) : 0,
                  )
                }
              >
                <option value="">请选择…</option>
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code ?? "-"})
                  </option>
                ))}
              </select>
              {selectedProvider && (
                <p className="mt-1 text-[11px] text-slate-500">
                  当前优先级：{selectedProvider.priority ?? 100}
                </p>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-slate-500">
                优先级（数字越小优先）
              </label>
              <input
                className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm font-mono"
                value={pricingPriority}
                onChange={(e) => setPricingPriority(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="flex flex-col">
              <label className="text-xs text-slate-500">
                首重重量 (kg)
              </label>
              <input
                className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm font-mono"
                value={pricingBaseWeight}
                onChange={(e) => setPricingBaseWeight(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-slate-500">
                首重费用 (元)
              </label>
              <input
                className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm font-mono"
                value={pricingBaseCost}
                onChange={(e) => setPricingBaseCost(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-slate-500">
                续重单位 (kg)
              </label>
              <input
                className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm font-mono"
                value={pricingExtraUnit}
                onChange={(e) => setPricingExtraUnit(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-slate-500">
                每单位续重费用 (元)
              </label>
              <input
                className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm font-mono"
                value={pricingExtraCost}
                onChange={(e) => setPricingExtraCost(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-slate-500">
              区域规则 JSON（可选，例如：{" "}
              <span className="font-mono">
                {"{\"广东省\": {\"base_cost\": 3.2}}"}
              </span>
              ）
            </label>
            <textarea
              className="mt-1 h-32 rounded-md border border-slate-300 px-2 py-1.5 text-xs font-mono"
              value={regionRulesJson}
              onChange={(e) => setRegionRulesJson(e.target.value)}
              placeholder='{"广东省": {"base_cost": 3.2}, "新疆维吾尔自治区": {"base_cost": 13.0}}'
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={pricingSaving || !selectedId}
              className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm disabled:opacity-60"
            >
              {pricingSaving ? "保存中…" : "保存计费模型"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default ShippingProvidersListPage;
