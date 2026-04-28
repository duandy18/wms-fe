import React, { useCallback, useEffect, useMemo, useState } from "react";

import { apiListFskusGlobal } from "../../fsku/api_fsku";
import { apiBindMerchantCode, apiUnbindMerchantCodeBinding } from "../../fsku/api_merchant_code_bindings";
import type { Fsku } from "../../fsku/types";
import {
  listFskuMappingCandidates,
  type FskuMappingCandidate,
} from "../api/fskuMappingCandidates";
import type { OmsPlatformKey } from "../api/platformOrderMirrors";

const PLATFORM_LABELS: Record<OmsPlatformKey, string> = {
  pdd: "拼多多",
  taobao: "淘宝",
  jd: "京东",
};

const STATUS_LABELS: Record<FskuMappingCandidate["mapping_status"], string> = {
  bound: "已绑定",
  unbound: "未绑定",
  missing_merchant_code: "缺少商家编码",
};

function formatOptional(value: unknown): string {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

function statusClass(status: FskuMappingCandidate["mapping_status"]): string {
  if (status === "bound") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "unbound") return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-slate-100 text-slate-600 ring-slate-200";
}

interface FskuMappingStageProps {
  platform: OmsPlatformKey;
}

export const FskuMappingStage: React.FC<FskuMappingStageProps> = ({ platform }) => {
  const [items, setItems] = useState<FskuMappingCandidate[]>([]);
  const [total, setTotal] = useState(0);
  const [fskus, setFskus] = useState<Fsku[]>([]);

  const [storeCode, setStoreCode] = useState("");
  const [merchantCode, setMerchantCode] = useState("");
  const [onlyUnbound, setOnlyUnbound] = useState(false);

  const [selectedFskuByLine, setSelectedFskuByLine] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [savingLineId, setSavingLineId] = useState<number | null>(null);
  const [banner, setBanner] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  const publishedFskus = useMemo(
    () => fskus.filter((fsku) => fsku.status === "published"),
    [fskus],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setBanner(null);

    try {
      const [candidateData, fskuRows] = await Promise.all([
        listFskuMappingCandidates(platform, {
          storeCode,
          merchantCode,
          onlyUnbound,
          limit: 200,
          offset: 0,
        }),
        apiListFskusGlobal({ status: "published", limit: 200, offset: 0 }),
      ]);

      setItems(candidateData.items);
      setTotal(candidateData.total);
      setFskus(fskuRows);
    } catch (error) {
      setItems([]);
      setTotal(0);
      setBanner({
        kind: "error",
        message: error instanceof Error ? error.message : "加载商品映射候选失败",
      });
    } finally {
      setLoading(false);
    }
  }, [merchantCode, onlyUnbound, platform, storeCode]);

  useEffect(() => {
    void load();
  }, [load]);

  function setSelectedFsku(lineId: number, value: string): void {
    setSelectedFskuByLine((prev) => ({
      ...prev,
      [lineId]: value,
    }));
  }

  async function handleBind(candidate: FskuMappingCandidate): Promise<void> {
    const merchant = candidate.merchant_code?.trim();
    if (!merchant) {
      setBanner({ kind: "error", message: "该候选行缺少 merchant_code，不能绑定。" });
      return;
    }

    const rawFskuId = selectedFskuByLine[candidate.line_id] ?? "";
    const fskuId = Number(rawFskuId);

    if (!Number.isInteger(fskuId) || fskuId <= 0) {
      setBanner({ kind: "error", message: "请选择要绑定的 published FSKU。" });
      return;
    }

    setSavingLineId(candidate.line_id);
    setBanner(null);

    try {
      await apiBindMerchantCode({
        platform,
        store_code: candidate.store_code,
        merchant_code: merchant,
        fsku_id: fskuId,
        reason: "OMS platform fsku mapping page",
      });

      setBanner({
        kind: "success",
        message: `已绑定：${candidate.store_code} / ${merchant} → FSKU #${fskuId}`,
      });
      await load();
    } catch (error) {
      setBanner({
        kind: "error",
        message: error instanceof Error ? error.message : "绑定失败",
      });
    } finally {
      setSavingLineId(null);
    }
  }

  async function handleUnbind(candidate: FskuMappingCandidate): Promise<void> {
    const merchant = candidate.merchant_code?.trim();
    if (!merchant) {
      setBanner({ kind: "error", message: "该候选行缺少 merchant_code，不能解绑。" });
      return;
    }

    setSavingLineId(candidate.line_id);
    setBanner(null);

    try {
      await apiUnbindMerchantCodeBinding({
        platform,
        store_code: candidate.store_code,
        merchant_code: merchant,
      });

      setBanner({
        kind: "success",
        message: `已解绑：${candidate.store_code} / ${merchant}`,
      });
      await load();
    } catch (error) {
      setBanner({
        kind: "error",
        message: error instanceof Error ? error.message : "解绑失败",
      });
    } finally {
      setSavingLineId(null);
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              {PLATFORM_LABELS[platform]}商品映射
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              后端已按平台聚合平台订单镜像行与当前 merchant_code → FSKU 绑定状态。前端只展示候选并提交绑定，不自行拼接多个数据源。
            </p>
          </div>

          <button
            type="button"
            onClick={() => void load()}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            {loading ? "刷新中..." : "刷新候选"}
          </button>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
          <label className="block">
            <div className="mb-1 text-xs font-medium text-slate-500">store_code</div>
            <input
              value={storeCode}
              onChange={(event) => setStoreCode(event.target.value)}
              placeholder="按店铺编码过滤"
              className="min-h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-slate-900"
            />
          </label>

          <label className="block">
            <div className="mb-1 text-xs font-medium text-slate-500">merchant_code</div>
            <input
              value={merchantCode}
              onChange={(event) => setMerchantCode(event.target.value)}
              placeholder="按商家编码过滤"
              className="min-h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-slate-900"
            />
          </label>

          <label className="flex items-end gap-2 pb-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={onlyUnbound}
              onChange={(event) => setOnlyUnbound(event.target.checked)}
            />
            只看未绑定
          </label>
        </div>

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
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-800">
            候选行：{total}
          </div>
          <div className="text-xs text-slate-500">
            可绑定 FSKU：{publishedFskus.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1180px] w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-3">状态</th>
                <th className="px-3 py-3">store_code</th>
                <th className="px-3 py-3">平台订单号</th>
                <th className="px-3 py-3">merchant_code</th>
                <th className="px-3 py-3">平台SKU</th>
                <th className="px-3 py-3">商品标题</th>
                <th className="px-3 py-3">数量</th>
                <th className="px-3 py-3">当前 FSKU</th>
                <th className="px-3 py-3">绑定操作</th>
              </tr>
            </thead>
            <tbody>
              {items.map((candidate) => {
                const saving = savingLineId === candidate.line_id;
                const canBind = Boolean(candidate.merchant_code?.trim());

                return (
                  <tr key={candidate.line_id} className="border-b border-slate-100">
                    <td className="px-3 py-3">
                      <span
                        className={[
                          "inline-flex rounded-full px-2 py-1 text-xs font-medium ring-1",
                          statusClass(candidate.mapping_status),
                        ].join(" ")}
                      >
                        {STATUS_LABELS[candidate.mapping_status]}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-mono text-xs">
                      {candidate.store_code}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs">
                      {candidate.platform_order_no}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs">
                      {formatOptional(candidate.merchant_code)}
                    </td>
                    <td className="px-3 py-3 text-xs">
                      <div>item={formatOptional(candidate.platform_item_id)}</div>
                      <div>sku={formatOptional(candidate.platform_sku_id)}</div>
                    </td>
                    <td className="px-3 py-3">
                      {formatOptional(candidate.title)}
                    </td>
                    <td className="px-3 py-3">{candidate.quantity}</td>
                    <td className="px-3 py-3 text-xs">
                      {candidate.is_bound ? (
                        <div>
                          <div className="font-semibold text-slate-900">
                            #{candidate.fsku_id} · {candidate.fsku_code}
                          </div>
                          <div className="text-slate-500">
                            {candidate.fsku_name} / {candidate.fsku_status}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">未绑定</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex min-w-[260px] gap-2">
                        <select
                          value={selectedFskuByLine[candidate.line_id] ?? ""}
                          onChange={(event) => setSelectedFsku(candidate.line_id, event.target.value)}
                          disabled={!canBind || saving}
                          className="min-h-9 flex-1 rounded-lg border border-slate-300 px-2 text-xs"
                        >
                          <option value="">选择 published FSKU</option>
                          {publishedFskus.map((fsku) => (
                            <option key={fsku.id} value={fsku.id}>
                              #{fsku.id} · {fsku.code} · {fsku.name}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          disabled={!canBind || saving}
                          onClick={() => void handleBind(candidate)}
                          className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
                        >
                          绑定
                        </button>

                        <button
                          type="button"
                          disabled={!candidate.is_bound || saving}
                          onClick={() => void handleUnbind(candidate)}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:text-slate-400"
                        >
                          解绑
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!loading && items.length === 0 ? (
            <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
              暂无商品映射候选。请先完成订单导入，并确认平台订单镜像行存在 merchant_sku。
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};
