// src/features/admin/stores/platform-skus/StorePlatformSkusPage.tsx

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { fetchStorePlatformSkus } from "./api";
import type { PlatformSkuListItem, PlatformSkuListOut } from "./types";

function safeNum(v: string | undefined): number {
  const n = Number(v ?? "");
  return Number.isFinite(n) ? n : 0;
}

function displaySkuName(r: PlatformSkuListItem): string {
  return r.sku_name ?? "—";
}

function displayBinding(r: PlatformSkuListItem): string {
  return r.binding.status === "bound" ? "已绑定" : "未绑定";
}

function displayTargetType(r: PlatformSkuListItem): string {
  const t = r.binding.target_type;
  if (t === "item") return "Item";
  if (t === "fsku") return "FSKU";
  return "—";
}

export default function StorePlatformSkusPage() {
  const { storeId: storeIdRaw } = useParams();
  const navigate = useNavigate();
  const storeId = useMemo(() => safeNum(storeIdRaw), [storeIdRaw]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<PlatformSkuListOut | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setErr(null);
      try {
        const out = await fetchStorePlatformSkus(storeId, { with_binding: 1, limit: 50, offset: 0 });
        if (!cancelled) setData(out);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "加载平台商品失败";
        if (!cancelled) setErr(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (storeId > 0) void run();
    return () => {
      cancelled = true;
    };
  }, [storeId]);

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-xl font-semibold text-slate-900">平台商品（PSKU）</div>
          <div className="text-sm text-slate-500">
            只读视图：mirror 优先，mirror 为空时回退到绑定 distinct（保证列表不空）
          </div>
        </div>

        <div className="flex gap-2">
          <button
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50"
            onClick={() => navigate(`/stores/${storeId}`)}
          >
            返回店铺详情
          </button>
        </div>
      </div>

      {err ? <div className="mb-3 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{err}</div> : null}

      <div className="rounded-lg border bg-white">
        <div className="border-b px-3 py-2 text-sm text-slate-600">
          {loading ? "加载中…" : `共 ${data?.total ?? 0} 条`}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-3 py-2 text-left font-medium">平台 SKU</th>
                <th className="px-3 py-2 text-left font-medium">名称</th>
                <th className="px-3 py-2 text-left font-medium">绑定状态</th>
                <th className="px-3 py-2 text-left font-medium">目标类型</th>
              </tr>
            </thead>

            <tbody>
              {(data?.items ?? []).map((r) => (
                <tr key={`${r.platform}:${r.shop_id}:${r.platform_sku_id}`} className="border-t">
                  <td className="px-3 py-2 font-mono">{r.platform_sku_id}</td>
                  <td className="px-3 py-2">{displaySkuName(r)}</td>
                  <td className="px-3 py-2">{displayBinding(r)}</td>
                  <td className="px-3 py-2">{displayTargetType(r)}</td>
                </tr>
              ))}

              {!loading && (data?.items?.length ?? 0) === 0 ? (
                <tr className="border-t">
                  <td className="px-3 py-6 text-center text-slate-500" colSpan={4}>
                    暂无平台商品数据。
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

