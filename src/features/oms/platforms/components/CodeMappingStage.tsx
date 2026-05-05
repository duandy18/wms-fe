import React, { useCallback, useEffect, useMemo, useState } from "react";

import { apiListFskusGlobal } from "../../fsku/api_fsku";
import {
  apiBindPlatformCodeMapping,
  apiDeletePlatformCodeMapping,
  apiListPlatformCodeMappings,
  type PlatformCodeIdentityKind,
  type PlatformCodeMappingRow,
} from "../../fsku/api_platform_code_mappings";
import type { Fsku } from "../../fsku/types";
import {
  listCodeMappingOptions,
  type CodeMappingOption,
} from "../api/codeMappingOptions";
import type { OmsPlatformKey } from "../api/platformOrderMirrors";

const PLATFORM_LABELS: Record<OmsPlatformKey, string> = {
  pdd: "拼多多",
  taobao: "淘宝",
  jd: "京东",
};

const PLATFORM_CODES: Record<OmsPlatformKey, string> = {
  pdd: "PDD",
  taobao: "TAOBAO",
  jd: "JD",
};

function formatOptional(value: unknown): string {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

function fskuOptionText(fsku: Fsku): string {
  const summary = fsku.components_summary_name || fsku.components_summary || "";
  return summary
    ? `${fsku.code} / ${fsku.name} / ${summary}`
    : `${fsku.code} / ${fsku.name}`;
}

interface CodeMappingStageProps {
  platform: OmsPlatformKey;
}

export const CodeMappingStage: React.FC<CodeMappingStageProps> = ({ platform }) => {
  const [codeOptions, setCodeOptions] = useState<CodeMappingOption[]>([]);
  const [bindings, setBindings] = useState<PlatformCodeMappingRow[]>([]);
  const [totalBindings, setTotalBindings] = useState(0);
  const [fskus, setFskus] = useState<Fsku[]>([]);

  const [filterStoreCode, setFilterStoreCode] = useState("");
  const [filterMerchantCode, setFilterMerchantCode] = useState("");

  const [storeCode, setStoreCode] = useState("");
  const [merchantCode, setMerchantCode] = useState("");
  const [selectedFskuId, setSelectedFskuId] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [unbindingId, setUnbindingId] = useState<number | null>(null);
  const [banner, setBanner] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  const platformCode = PLATFORM_CODES[platform];

  const publishedFskus = useMemo(
    () => fskus.filter((fsku) => fsku.status === "published"),
    [fskus],
  );

  const fskuById = useMemo(() => {
    const map = new Map<number, Fsku>();
    for (const fsku of fskus) map.set(fsku.id, fsku);
    return map;
  }, [fskus]);

  const storeCodeOptions = useMemo(() => {
    const values = new Set<string>();
    for (const option of codeOptions) values.add(option.store_code);
    for (const binding of bindings) values.add(binding.store_code);
    return Array.from(values).sort();
  }, [bindings, codeOptions]);

  const merchantCodeOptions = useMemo(() => {
    const values = new Set<string>();

    for (const option of codeOptions) {
      if (!storeCode || option.store_code === storeCode) {
        values.add(option.merchant_code);
      }
    }

    for (const binding of bindings) {
      if (!storeCode || binding.store_code === storeCode) {
        values.add(binding.identity_value);
      }
    }

    return Array.from(values).sort();
  }, [bindings, codeOptions, storeCode]);

  const load = useCallback(async () => {
    setLoading(true);
    setBanner(null);

    try {
      const [optionData, bindingData, fskuRows] = await Promise.all([
        listCodeMappingOptions(platform, {
          storeCode: filterStoreCode,
          merchantCode: filterMerchantCode,
          limit: 200,
          offset: 0,
        }),
        apiListPlatformCodeMappings({
          platform: platformCode,
          store_code: filterStoreCode.trim() || undefined,
          identity_value: filterMerchantCode.trim() || undefined,
          limit: 200,
          offset: 0,
        }),
        apiListFskusGlobal({ status: "published", limit: 200, offset: 0 }),
      ]);

      setCodeOptions(optionData.items);
      setBindings(bindingData.items);
      setTotalBindings(bindingData.total);
      setFskus(fskuRows);
    } catch (error) {
      setCodeOptions([]);
      setBindings([]);
      setTotalBindings(0);
      setBanner({
        kind: "error",
        message: error instanceof Error ? error.message : "加载平台编码映射失败",
      });
    } finally {
      setLoading(false);
    }
  }, [filterMerchantCode, filterStoreCode, platform, platformCode]);

  useEffect(() => {
    void load();
  }, [load]);


  async function handleSave(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const nextStoreCode = storeCode.trim();
    const nextMerchantCode = merchantCode.trim();
    const fskuId = Number(selectedFskuId);

    if (!nextStoreCode) {
      setBanner({ kind: "error", message: "请填写或选择店铺编码。" });
      return;
    }

    if (!nextMerchantCode) {
      setBanner({ kind: "error", message: "请填写或选择平台编码。" });
      return;
    }

    if (!Number.isInteger(fskuId) || fskuId <= 0) {
      setBanner({ kind: "error", message: "请选择要映射的 published OMS FSKU。" });
      return;
    }

    setSaving(true);
    setBanner(null);

    try {
      await apiBindPlatformCodeMapping({
        platform: platformCode,
        store_code: nextStoreCode,
        identity_kind: "merchant_code" as PlatformCodeIdentityKind,
        identity_value: nextMerchantCode,
        fsku_id: fskuId,
        reason: "平台编码映射",
      });

      setBanner({
        kind: "success",
        message: `已保存映射：${nextStoreCode} / ${nextMerchantCode} → FSKU #${fskuId}`,
      });
      await load();
    } catch (error) {
      setBanner({
        kind: "error",
        message: error instanceof Error ? error.message : "保存平台编码映射失败",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleUnbind(binding: PlatformCodeMappingRow): Promise<void> {
    setUnbindingId(binding.id);
    setBanner(null);

    try {
      await apiDeletePlatformCodeMapping({
        platform: binding.platform,
        store_code: binding.store_code,
        identity_kind: binding.identity_kind,
        identity_value: binding.identity_value,
      });

      setBanner({
        kind: "success",
        message: `已解除映射：${binding.store_code} / ${binding.identity_value}`,
      });
      await load();
    } catch (error) {
      setBanner({
        kind: "error",
        message: error instanceof Error ? error.message : "解除映射失败",
      });
    } finally {
      setUnbindingId(null);
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              {PLATFORM_LABELS[platform]}平台编码映射
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              维护平台店铺编码到 OMS FSKU 的长期映射。订单行编码等于 FSKU.code
              时无需映射；只有平台编码与 FSKU.code 不一致时，才需要在这里建立映射。
            </p>
          </div>

          <button
            type="button"
            onClick={() => void load()}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            {loading ? "刷新中..." : "刷新"}
          </button>
        </div>

        <form className="mt-5 grid gap-3 lg:grid-cols-[1fr_1fr_2fr_auto]" onSubmit={(event) => void handleSave(event)}>
          <label className="block">
            <div className="mb-1 text-xs font-medium text-slate-500">店铺编码</div>
            <input
              list={`store-code-options-${platform}`}
              value={storeCode}
              onChange={(event) => setStoreCode(event.target.value)}
              placeholder="例如 PDD-TEST"
              className="min-h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-slate-900"
            />
            <datalist id={`store-code-options-${platform}`}>
              {storeCodeOptions.map((code) => (
                <option key={code} value={code} />
              ))}
            </datalist>
          </label>

          <label className="block">
            <div className="mb-1 text-xs font-medium text-slate-500">平台编码</div>
            <input
              list={`merchant-code-options-${platform}`}
              value={merchantCode}
              onChange={(event) => setMerchantCode(event.target.value)}
              placeholder="选择或输入平台编码"
              className="min-h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-slate-900"
            />
            <datalist id={`merchant-code-options-${platform}`}>
              {merchantCodeOptions.map((code) => (
                <option key={code} value={code} />
              ))}
            </datalist>
          </label>

          <label className="block">
            <div className="mb-1 text-xs font-medium text-slate-500">目标 OMS FSKU</div>
            <select
              value={selectedFskuId}
              onChange={(event) => setSelectedFskuId(event.target.value)}
              className="min-h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-slate-900"
            >
              <option value="">选择 published FSKU</option>
              {publishedFskus.map((fsku) => (
                <option key={fsku.id} value={fsku.id}>
                  {fskuOptionText(fsku)}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            disabled={saving}
            className="mt-5 min-h-10 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {saving ? "保存中..." : "保存映射"}
          </button>
        </form>

        {banner ? (
          <div
            className={[
              "mt-4 rounded-xl border p-4 text-sm",
              banner.kind === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700",
            ].join(" ")}
          >
            {banner.message}
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-950">当前映射列表</h3>
            <p className="mt-1 text-sm text-slate-500">
              当前生效的平台 + 店铺编码 + 平台编码 → OMS FSKU 映射关系。
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-[160px_220px_auto]">
            <input
              value={filterStoreCode}
              onChange={(event) => setFilterStoreCode(event.target.value)}
              placeholder="过滤店铺编码"
              className="min-h-10 rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-slate-900"
            />
            <input
              value={filterMerchantCode}
              onChange={(event) => setFilterMerchantCode(event.target.value)}
              placeholder="过滤平台编码"
              className="min-h-10 rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-slate-900"
            />
            <div className="flex items-center text-xs text-slate-500">
              当前映射：{totalBindings} / 可选 FSKU：{publishedFskus.length}
            </div>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-[1080px] w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-3">店铺</th>
                <th className="px-3 py-3">平台编码</th>
                <th className="px-3 py-3">OMS FSKU</th>
                <th className="px-3 py-3">组件摘要</th>
                <th className="px-3 py-3">原因</th>
                <th className="px-3 py-3">更新时间</th>
                <th className="px-3 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {bindings.map((binding) => {
                const fullFsku = fskuById.get(binding.fsku_id);
                const unbinding = unbindingId === binding.id;

                return (
                  <tr key={binding.id} className="border-b border-slate-100">
                    <td className="px-3 py-3">
                      <div className="font-mono text-xs">{binding.store_code}</div>
                      <div className="text-xs text-slate-500">{binding.store.store_name}</div>
                    </td>
                    <td className="px-3 py-3 font-mono text-xs">{binding.identity_value}</td>
                    <td className="px-3 py-3 text-xs">
                      <div className="font-semibold text-slate-900">
                        #{binding.fsku_id} · {binding.fsku.code}
                      </div>
                      <div className="text-slate-500">
                        {binding.fsku.name} / {binding.fsku.status}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-600">
                      {formatOptional(fullFsku?.components_summary_name || fullFsku?.components_summary)}
                    </td>
                    <td className="px-3 py-3 text-xs">{formatOptional(binding.reason)}</td>
                    <td className="px-3 py-3 font-mono text-xs">{binding.updated_at}</td>
                    <td className="px-3 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={unbinding}
                          onClick={() => void handleUnbind(binding)}
                          className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 disabled:cursor-not-allowed disabled:text-red-300"
                        >
                          {unbinding ? "解除中..." : "解除映射"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!loading && bindings.length === 0 ? (
            <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
              暂无平台编码映射。
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};
