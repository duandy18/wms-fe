import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  getOrderSkuResolution,
  type OrderSkuResolutionData,
  type OrderSkuResolutionLine,
} from "../api/orderSkuResolution";
import type { OmsPlatformKey } from "../api/platformOrderMirrors";

const SOURCE_LABELS: Record<OrderSkuResolutionLine["resolution_source"], string> = {
  direct_fsku_code: "自动解析：FSKU.code",
  code_mapping: "自动解析：平台编码映射",
  unresolved: "待补映射",
};

function formatOptional(value: unknown): string {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

function statusClass(line: OrderSkuResolutionLine): string {
  if (line.resolution_status === "resolved") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  }
  return "bg-amber-50 text-amber-700 ring-amber-200";
}

function lineKey(line: OrderSkuResolutionLine): string {
  return `${line.mirror_id}:${line.line_id}`;
}


interface OrderSkuResolutionCardProps {
  platform: OmsPlatformKey;
  mirrorId: number;
}

export const OrderSkuResolutionCard: React.FC<OrderSkuResolutionCardProps> = ({
  platform,
  mirrorId,
}) => {
  const [data, setData] = useState<OrderSkuResolutionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [banner, setBanner] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  const unresolvedCount = useMemo(
    () => data?.lines.filter((line) => line.resolution_status !== "resolved").length ?? 0,
    [data],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    setBanner(null);

    try {
      const next = await getOrderSkuResolution(platform, mirrorId);
      setData(next);
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : "加载订单 SKU 映射失败");
    } finally {
      setLoading(false);
    }
  }, [mirrorId, platform]);

  useEffect(() => {
    void load();
  }, [load]);



  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">订单 SKU 映射</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            基于当前平台订单镜像，将平台订单行解析为仓库 SKU。自动路径包括 FSKU.code
            直接命中和平台编码映射；自动失败的订单行可在本卡片内前往治理页补充映射。
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
        >
          {loading ? "刷新中..." : "刷新映射"}
        </button>
      </div>

      {data ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-xs text-slate-400">平台订单号</div>
            <div className="mt-1 break-all font-mono text-sm text-slate-950">
              {data.platform_order_no}
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-xs text-slate-400">store_code</div>
            <div className="mt-1 font-mono text-sm text-slate-950">{data.store_code}</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-xs text-slate-400">整体状态</div>
            <div className="mt-1 text-sm font-semibold text-slate-950">
              {data.status === "resolved" ? "已全部解析" : "存在待补映射"}
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-xs text-slate-400">待补映射行</div>
            <div className="mt-1 text-sm font-semibold text-slate-950">{unresolvedCount}</div>
          </div>
        </div>
      ) : null}

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

      {error ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-5 space-y-4">
        {(data?.lines ?? []).map((line) => {
          const key = lineKey(line);

          return (
            <article
              key={key}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <span
                    className={[
                      "inline-flex rounded-full px-2 py-1 text-xs font-medium ring-1",
                      statusClass(line),
                    ].join(" ")}
                  >
                    {SOURCE_LABELS[line.resolution_source]}
                  </span>
                  {line.unresolved_reason ? (
                    <div className="mt-2 text-xs text-amber-700">
                      {line.unresolved_reason}
                    </div>
                  ) : null}
                </div>

                <div className="font-mono text-xs text-slate-500">
                  line_id={line.line_id} / collector_line_id={line.collector_line_id}
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                <section className="rounded-xl bg-slate-50 p-3">
                  <div className="text-xs font-semibold text-slate-500">平台订单行</div>
                  <div className="mt-2 text-sm font-semibold text-slate-950">
                    {formatOptional(line.title)}
                  </div>
                  <div className="mt-2 grid gap-1 text-xs text-slate-600">
                    <div>
                      merchant_code：
                      <span className="font-mono text-slate-900">{formatOptional(line.merchant_code)}</span>
                    </div>
                    <div>
                      platform_item_id：
                      <span className="font-mono text-slate-900">{formatOptional(line.platform_item_id)}</span>
                    </div>
                    <div>
                      platform_sku_id：
                      <span className="font-mono text-slate-900">{formatOptional(line.platform_sku_id)}</span>
                    </div>
                    <div>
                      数量 / 金额：
                      <span className="font-mono text-slate-900">
                        {line.quantity} / {formatOptional(line.line_amount)}
                      </span>
                    </div>
                  </div>
                </section>

                <section className="rounded-xl bg-slate-50 p-3">
                  <div className="text-xs font-semibold text-slate-500">目标 FSKU</div>
                  {line.fsku_id ? (
                    <div className="mt-2">
                      <div className="text-sm font-semibold text-slate-950">
                        #{line.fsku_id} · {line.fsku_code}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">{line.fsku_name}</div>
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-slate-400">未命中 FSKU</div>
                  )}
                </section>

                <section className="rounded-xl bg-slate-50 p-3">
                  <div className="text-xs font-semibold text-slate-500">仓库 SKU 组件</div>
                  {line.components.length ? (
                    <div className="mt-2 space-y-2">
                      {line.components.map((component) => (
                        <div
                          key={`${component.sort_order}-${component.sku_code}`}
                          className="rounded-lg border border-slate-200 bg-white p-3"
                        >
                          <div className="font-mono text-sm font-semibold text-slate-950">
                            {component.sku_code} × {component.qty}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            {component.item_name} / {component.uom} / item_id={component.item_id}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-slate-400">待前往治理页补充映射</div>
                  )}
                </section>

                {line.resolution_status !== "resolved" ? (
                  <section className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                    <div className="text-xs font-semibold text-amber-700">下一步治理动作</div>
                    <div className="mt-2 space-y-2">
                      {line.next_actions.map((action) => (
                        <a
                          key={`${action.action}-${action.route_path}`}
                          href={action.route_path}
                          className="block rounded-lg border border-amber-200 bg-white p-3 text-xs font-semibold text-amber-800 hover:bg-amber-100"
                        >
                          {action.label}
                          <div className="mt-1 font-mono text-[11px] font-normal text-amber-700">
                            {action.route_path}
                          </div>
                        </a>
                      ))}
                    </div>
                  </section>
                ) : null}
              </div>
            </article>
          );
        })}

        {!loading && data && data.lines.length === 0 ? (
          <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
            当前镜像没有订单行。
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
            正在加载订单 SKU 映射...
          </div>
        ) : null}
      </div>
    </section>
  );
};
