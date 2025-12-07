// src/features/inventory/shipping-records/ShippingRecordDetailPage.tsx
import React, { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import PageTitle from "../../../components/ui/PageTitle";
import {
  fetchShippingRecordsByRef,
  fetchShippingRecordById,
  type ShippingRecord,
} from "./api";

const formatCurrency = (n: number | null | undefined) =>
  n == null ? "-" : `￥${n.toFixed(2)}`;

const formatDateTime = (s: string | null | undefined) =>
  s ? s.replace("T", " ").replace("Z", "") : "-";

const prettyJson = (obj: unknown) => {
  try {
    return JSON.stringify(obj ?? {}, null, 2);
  } catch {
    return String(obj ?? "");
  }
};

const STATUS_LABEL: Record<string, string> = {
  IN_TRANSIT: "在途",
  DELIVERED: "已签收",
  LOST: "丢失",
  RETURNED: "退回",
};

const statusToLabel = (status: string | null | undefined) => {
  if (!status) return "未知";
  const key = status.toUpperCase();
  return STATUS_LABEL[key] ?? status;
};

const statusBadgeClass = (status: string | null | undefined) => {
  const key = (status || "").toUpperCase();
  switch (key) {
    case "DELIVERED":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "IN_TRANSIT":
      return "bg-sky-100 text-sky-700 border-sky-200";
    case "LOST":
      return "bg-rose-100 text-rose-700 border-rose-200";
    case "RETURNED":
      return "bg-amber-100 text-amber-700 border-amber-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
};

const ShippingRecordDetailPage: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialRefFromUrl = params.get("ref") ?? "";
  const initialIdFromUrl = params.get("id") ?? "";

  const [refInput, setRefInput] = useState(initialRefFromUrl);
  const [idInput, setIdInput] = useState(initialIdFromUrl);
  const [records, setRecords] = useState<ShippingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const primary = useMemo<ShippingRecord | undefined>(() => {
    if (!records.length) return undefined;
    // 默认取最新一条（created_at DESC）
    return records[0];
  }, [records]);

  const handleSearchByRef = async (ref?: string) => {
    const targetRef = (ref ?? refInput).trim();
    if (!targetRef) {
      setError("请先输入订单引用（如 ORD:PDD:1:EXT123）");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const data = await fetchShippingRecordsByRef(targetRef);
      setRecords(data);
      if (data.length === 0) {
        setError("未找到对应的发货记录。");
      }
    } catch (e: any) {
      console.error("fetchShippingRecordsByRef failed", e);
      setError(e?.message ?? "查询失败");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchById = async (rawId?: string) => {
    const txt = rawId ?? idInput;
    const id = Number(txt);
    if (!id || id <= 0) {
      setError("请先输入正确的 ID（>0）");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const rec = await fetchShippingRecordById(id);
      setRecords([rec]);
    } catch (e: any) {
      console.error("fetchShippingRecordById failed", e);
      setError(e?.message ?? "查询失败");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // 页面初次加载时，如果 URL 上带了 ref 或 id，则自动查询一把
  useEffect(() => {
    if (initialRefFromUrl) {
      void handleSearchByRef(initialRefFromUrl);
      return;
    }
    if (initialIdFromUrl) {
      void handleSearchById(initialIdFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const latestStatusLabel = primary ? statusToLabel(primary.status ?? null) : "-";
  const latestDeliveryTime = primary?.delivery_time ?? null;

  return (
    <div className="space-y-4 p-6">
      <PageTitle
        title="发货账本详情"
        description="按订单引用或账本 ID 查询发货记录，查看完整成本、状态与上下文信息。"
      />

      {/* 查询区 */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-2 text-sm">
            <div className="text-xs font-semibold text-slate-700">
              按订单引用查询
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <input
                className="w-64 rounded-md border border-slate-300 px-2 py-1 text-xs"
                placeholder="例如 ORD:PDD:1:SHIP-DEMO-01"
                value={refInput}
                onChange={(e) => setRefInput(e.target.value)}
              />
              <button
                type="button"
                onClick={() => void handleSearchByRef()}
                disabled={loading}
                className={
                  "inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium text-white " +
                  (loading
                    ? "bg-sky-400 opacity-70"
                    : "bg-sky-600 hover:bg-sky-700")
                }
              >
                {loading ? "查询中…" : "按订单引用查询"}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              通常一个订单只有一条发货记录；若有多条（多次发货），会按时间倒序显示，最新一条视为当前状态。
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="text-xs font-semibold text-slate-700">
              按账本 ID 查询（可选）
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <input
                className="w-32 rounded-md border border-slate-300 px-2 py-1 text-xs"
                placeholder="例如 42"
                value={idInput}
                onChange={(e) => setIdInput(e.target.value)}
              />
              <button
                type="button"
                onClick={() => void handleSearchById()}
                disabled={loading}
                className={
                  "inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium text-white " +
                  (loading
                    ? "bg-slate-400 opacity-70"
                    : "bg-slate-700 hover:bg-slate-800")
                }
              >
                {loading ? "查询中…" : "按 ID 查询"}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              ID 可从 dev 调试工具或数据库中获取，用于精准定位某一条记录。
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}
      </section>

      {/* 主详情卡（取第一条作为主记录） */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold text-slate-800">
              账本主记录（最新状态）
            </h2>
            {primary && (
              <span className="text-[11px] text-slate-500">
                ID: {primary.id} · 创建时间:{" "}
                {formatDateTime(primary.created_at)}
              </span>
            )}
          </div>
          {primary && (
            <div className="flex flex-col items-end gap-1">
              <span
                className={
                  "inline-flex items-center rounded-full border px-3 py-[3px] text-[11px] font-medium " +
                  statusBadgeClass(primary.status ?? null)
                }
              >
                {latestStatusLabel}
              </span>
              <span className="text-[11px] text-slate-500">
                签收时间：{" "}
                <span className="font-mono">
                  {primary.status &&
                  primary.status.toUpperCase() === "DELIVERED" &&
                  latestDeliveryTime
                    ? formatDateTime(latestDeliveryTime)
                    : "-"}
                </span>
              </span>
            </div>
          )}
        </div>
        {!primary ? (
          <p className="text-xs text-slate-500">
            暂无记录。请先通过上方表单进行查询。
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 text-xs text-slate-700">
            <div className="space-y-1">
              <div>
                <span className="font-semibold">订单引用：</span>
                <span className="font-mono">{primary.order_ref}</span>
              </div>
              <div>
                <span className="font-semibold">平台 / 店铺：</span>
                <span className="font-mono">
                  {primary.platform} / {primary.shop_id}
                </span>
              </div>
              <div>
                <span className="font-semibold">仓库 ID：</span>
                <span className="font-mono">
                  {primary.warehouse_id ?? "-"}
                </span>
              </div>
              <div>
                <span className="font-semibold">Trace ID：</span>
                <span className="font-mono">
                  {primary.trace_id ?? "-"}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div>
                <span className="font-semibold">快递公司：</span>
                <span className="font-mono">
                  {primary.carrier_name || "-"}{" "}
                  {primary.carrier_code ? `(${primary.carrier_code})` : ""}
                </span>
              </div>
              <div>
                <span className="font-semibold">运单号：</span>
                <span className="font-mono">
                  {primary.tracking_no ?? "-"}
                </span>
              </div>
              <div>
                <span className="font-semibold">重量：</span>
                <span className="font-mono">
                  毛重 {primary.gross_weight_kg ?? "-"} kg / 包材{" "}
                  {primary.packaging_weight_kg ?? "-"} kg
                </span>
              </div>
              <div>
                <span className="font-semibold">费用：</span>
                <span className="font-mono">
                  预估 {formatCurrency(primary.cost_estimated)} / 实际{" "}
                  {formatCurrency(primary.cost_real)}
                </span>
              </div>
              <div>
                <span className="font-semibold">当前状态：</span>
                <span className="font-mono">
                  {primary.status ?? "-"}
                </span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 历史发货记录列表（同一 ref 多次发货） */}
      {records.length > 1 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">
            历史发货记录（同一订单多次发货）
          </h2>
          <div className="overflow-auto rounded-xl border border-slate-100">
            <table className="min-w-full border-collapse text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-slate-500">
                    ID / 时间
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-500">
                    快递公司
                  </th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-500">
                    毛重(kg)
                  </th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-500">
                    预估费用
                  </th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-500">
                    仓库
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-500">
                    状态 / 签收时间
                  </th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100">
                    <td className="px-3 py-2">
                      <div className="flex flex-col">
                        <span className="font-mono">{r.id}</span>
                        <span className="text-[10px] text-slate-400">
                          {formatDateTime(r.created_at)}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className="font-mono">
                        {r.carrier_name || "-"}
                        {r.carrier_code ? ` (${r.carrier_code})` : ""}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {r.gross_weight_kg ?? "-"}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {formatCurrency(r.cost_estimated)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {r.warehouse_id ?? "-"}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col gap-1">
                        <span
                          className={
                            "inline-flex w-fit items-center rounded-full border px-2 py-[1px] text-[10px] font-medium " +
                            statusBadgeClass(r.status ?? null)
                          }
                        >
                          {statusToLabel(r.status ?? null)}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          签收时间：{" "}
                          <span className="font-mono">
                            {r.status &&
                            r.status.toUpperCase() === "DELIVERED" &&
                            r.delivery_time
                              ? formatDateTime(r.delivery_time)
                              : "-"}
                          </span>
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* meta / payload 原始 JSON */}
      {primary && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">
            原始 meta / payload（JSON）
          </h2>
          <pre className="max-h-[320px] overflow-auto rounded-lg bg-slate-900 p-3 text-[11px] text-slate-100">
{prettyJson(primary.meta)}
          </pre>
        </section>
      )}
    </div>
  );
};

export default ShippingRecordDetailPage;
