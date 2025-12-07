// src/features/diagnostics/batch-lifeline/BatchLifelinePage.tsx
//
// 批次生命周期（Batch Lifeline）
// - 可以作为独立工具使用（手动输入 wh/item/batch）
// - 也可以由 InventoryStudio 中控传入 initialXXX 参数自动加载

import React, { useEffect, useState } from "react";
import { SectionCard } from "../../../components/wmsdu/SectionCard";
import { apiGet } from "../../../lib/api";

type Props = {
  initialWarehouseId?: number;
  initialItemId?: number;
  initialBatchCode?: string;
};

type BatchLifelineEvent = {
  type?: string;
  event_type?: string;
  reason?: string;
  kind?: string;
  occurred_at?: string;
  ts?: string;
  time?: string;
  created_at?: string;
  before?: number;
  before_qty?: number;
  delta?: number;
  change?: number;
  after?: number;
  after_qty?: number;
  production_date?: string;
  prod_date?: string;
  mfg_date?: string;
  expiry_date?: string;
  expire_at?: string;
  exp_date?: string;
  ref?: string;
  ref_no?: string;
  trace_id?: string;
  trace?: string;
  warehouse_id?: number;
  item_id?: number;
  batch_code?: string;
};

type BatchLifelinePayload = {
  warehouse_id: number;
  item_id: number;
  batch_code: string;
};

type BatchLifelineResponse =
  | {
      lifeline?: BatchLifelineEvent[];
      events?: BatchLifelineEvent[];
    }
  | BatchLifelineEvent[]
  | null;

const pickEventsFromLifeline = (
  data: BatchLifelineResponse,
): BatchLifelineEvent[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.events)) return data.events;
  if (Array.isArray(data.lifeline)) return data.lifeline;
  return [];
};

const fmt = (v: unknown): string => {
  if (!v) return "-";
  if (typeof v === "string") {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return v;
    return d.toISOString().replace("T", " ").slice(0, 19);
  }
  try {
    return String(v);
  } catch {
    return "-";
  }
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return "未知错误";
  }
};

export const BatchLifelinePage: React.FC<Props> = ({
  initialWarehouseId,
  initialItemId,
  initialBatchCode,
}) => {
  const [wh, setWh] = useState(
    initialWarehouseId !== undefined ? String(initialWarehouseId) : "",
  );
  const [item, setItem] = useState(
    initialItemId !== undefined ? String(initialItemId) : "",
  );
  const [batch, setBatch] = useState(initialBatchCode ?? "");
  const [data, setData] = useState<BatchLifelineResponse>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(
    explicit?: { wh: string; item: string; batch: string },
  ) {
    setError(null);
    setData(null);

    const w = explicit?.wh ?? wh;
    const i = explicit?.item ?? item;
    const b = explicit?.batch ?? batch;

    if (!w || !i || !b) {
      setError("请输入 warehouse_id / item_id / batch_code 后再加载");
      return;
    }

    const payload: BatchLifelinePayload = {
      warehouse_id: Number(w),
      item_id: Number(i),
      batch_code: b,
    };

    setLoading(true);
    try {
      const r = await apiGet<BatchLifelineResponse>(
        "/diagnostics/lifecycle/batch",
        payload,
      );
      // 后端通常返回 { lifeline: [...] } 或类似结构
      if (r && !Array.isArray(r)) {
        setData(r.lifeline ?? r);
      } else {
        setData(r);
      }
    } catch (err: unknown) {
      console.error("load batch lifeline failed", err);
      setError(getErrorMessage(err) || "加载批次生命周期失败");
    } finally {
      setLoading(false);
    }
  }

  // 当中控传入 initialXXX 时，自动加载一次
  useEffect(() => {
    if (
      initialWarehouseId !== undefined &&
      initialItemId !== undefined &&
      initialBatchCode
    ) {
      const w = String(initialWarehouseId);
      const i = String(initialItemId);
      const b = initialBatchCode;

      setWh(w);
      setItem(i);
      setBatch(b);

      void load({ wh: w, item: i, batch: b });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialWarehouseId, initialItemId, initialBatchCode]);

  const events = pickEventsFromLifeline(data);

  return (
    <div className="px-6 lg:px-10 space-y-8">
      <SectionCard
        title="批次生命周期（Batch Lifeline）"
        description="查看一个批次在台账 / 盘点 / 入库 / 出库中的完整生命周期"
        className="p-6 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
          <div>
            <div className="text-xs mb-1">仓库 ID</div>
            <input
              className="border h-10 rounded px-2 w-full"
              value={wh}
              onChange={(e) => setWh(e.target.value)}
              placeholder="如 1"
            />
          </div>

          <div>
            <div className="text-xs mb-1">Item ID</div>
            <input
              className="border h-10 rounded px-2 w-full"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              placeholder="如 1001"
            />
          </div>

          <div>
            <div className="text-xs mb-1">Batch Code</div>
            <input
              className="border h-10 rounded px-2 w-full"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              placeholder="如 25022301"
            />
          </div>

          <button
            onClick={() => void load()}
            className="h-10 bg-slate-900 text-white rounded text-sm disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "加载中…" : "加载"}
          </button>
        </div>

        {error && <div className="text-xs text-red-600 mt-1">{error}</div>}

        {!data ? (
          <div className="text-xs text-slate-500 mt-2">
            {loading ? "正在加载批次生命周期…" : "暂无数据，请先输入条件并点击加载。"}
          </div>
        ) : (
          <>
            {/* 事件列表（提炼出来的关键字段视图） */}
            {events.length > 0 ? (
              <div className="mt-4 space-y-2">
                <div className="text-xs text-slate-600">
                  事件总数：{events.length}（包含入库 / 出库 / 盘点 / 退货等）
                </div>
                <div className="max-h-[40vh] overflow-auto border border-slate-100 rounded-md">
                  <table className="min-w-full text-[11px]">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        <th className="px-2 py-1 text-left">#</th>
                        <th className="px-2 py-1 text-left">时间</th>
                        <th className="px-2 py-1 text-left">类型 / 原因</th>
                        <th className="px-2 py-1 text-right">before</th>
                        <th className="px-2 py-1 text-right">delta</th>
                        <th className="px-2 py-1 text-right">after</th>
                        <th className="px-2 py-1 text-left">prod</th>
                        <th className="px-2 py-1 text-left">exp</th>
                        <th className="px-2 py-1 text-left">ref / trace</th>
                        <th className="px-2 py-1 text-left">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((ev, idx) => {
                        const type =
                          ev.type ||
                          ev.event_type ||
                          ev.reason ||
                          ev.kind ||
                          "-";
                        const ts =
                          ev.occurred_at ||
                          ev.ts ||
                          ev.time ||
                          ev.created_at;
                        const before =
                          ev.before ?? ev.before_qty ?? "-";
                        const delta =
                          ev.delta ?? ev.change ?? "-";
                        const after =
                          ev.after ?? ev.after_qty ?? "-";
                        const prod =
                          ev.production_date ||
                          ev.prod_date ||
                          ev.mfg_date ||
                          "-";
                        const exp =
                          ev.expiry_date ||
                          ev.expire_at ||
                          ev.exp_date ||
                          "-";
                        const ref = ev.ref || ev.ref_no || "-";
                        const trace = ev.trace_id || ev.trace || "";

                        const isCount =
                          String(type).toUpperCase().includes("COUNT");
                        const isInbound =
                          String(type).toUpperCase().includes("INBOUND") ||
                          String(type).toUpperCase().includes("RECEIPT");
                        const isOutbound =
                          String(type).toUpperCase().includes("OUT") ||
                          String(type).toUpperCase().includes("SHIP") ||
                          String(type).toUpperCase().includes("PICK");

                        let rowClass = "";
                        if (isCount) {
                          rowClass =
                            "bg-sky-50 border-l-4 border-sky-400";
                        } else if (isInbound) {
                          rowClass =
                            "bg-emerald-50 border-l-4 border-emerald-400";
                        } else if (isOutbound) {
                          rowClass =
                            "bg-rose-50 border-l-4 border-rose-400";
                        }

                        const whNum =
                          initialWarehouseId !== undefined
                            ? initialWarehouseId
                            : wh
                            ? Number(wh)
                            : undefined;
                        const itemNum =
                          initialItemId !== undefined
                            ? initialItemId
                            : item
                            ? Number(item)
                            : undefined;
                        const batchCode =
                          initialBatchCode ?? batch;

                        const ledgerHref =
                          whNum !== undefined &&
                          itemNum !== undefined &&
                          batchCode
                            ? `/tools/ledger?tab=tool&warehouse_id=${whNum}&item_id=${itemNum}&batch_code=${encodeURIComponent(
                                batchCode,
                              )}`
                            : null;

                        const stockHref =
                          whNum !== undefined &&
                          itemNum !== undefined &&
                          batchCode
                            ? `/tools/stocks?warehouse_id=${whNum}&item_id=${itemNum}&batch_code=${encodeURIComponent(
                                batchCode,
                              )}`
                            : null;

                        const traceHref = trace
                          ? `/trace?tab=trace&trace_id=${encodeURIComponent(
                              trace,
                            )}${
                              ref
                                ? `&focus_ref=${encodeURIComponent(ref)}`
                                : ""
                            }`
                          : null;

                        return (
                          <tr
                            key={idx}
                            className={
                              rowClass || "border-l-4 border-transparent"
                            }
                          >
                            <td className="px-2 py-1 text-slate-500">
                              {idx + 1}
                            </td>
                            <td className="px-2 py-1 text-slate-700">
                              {fmt(ts)}
                            </td>
                            <td className="px-2 py-1 text-slate-800">
                              {type}
                            </td>
                            <td className="px-2 py-1 text-right font-mono">
                              {before}
                            </td>
                            <td className="px-2 py-1 text-right font-mono">
                              {delta}
                            </td>
                            <td className="px-2 py-1 text-right font-mono">
                              {after}
                            </td>
                            <td className="px-2 py-1 text-slate-700 font-mono">
                              {prod}
                            </td>
                            <td className="px-2 py-1 text-slate-700 font-mono">
                              {exp}
                            </td>
                            <td className="px-2 py-1 text-slate-600">
                              {ref}
                              {trace && (
                                <span className="block text-[10px] text-slate-400">
                                  trace={trace}
                                </span>
                              )}
                            </td>
                            <td className="px-2 py-1 text-[11px] text-right whitespace-nowrap space-x-1">
                              {traceHref && (
                                <a
                                  href={traceHref}
                                  className="inline-flex items-center rounded border border-slate-300 px-2 py-0.5 hover:bg-slate-50 text-sky-700"
                                >
                                  Trace
                                </a>
                              )}

                              {ledgerHref && (
                                <a
                                  href={ledgerHref}
                                  className="inline-flex items-center rounded border border-slate-300 px-2 py-0.5 hover:bg-slate-50"
                                >
                                  Ledger
                                </a>
                              )}

                              {stockHref && (
                                <a
                                  href={`${stockHref}#lifeline`}
                                  className="inline-flex items-center rounded border border-slate-300 px-2 py-0.5 hover:bg-slate-50"
                                >
                                  库存
                                </a>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="text-[11px] text-slate-500">
                  说明：蓝色条为盘点（COUNT）事件，绿色为入库，红色为出库/发货等事件。
                  生产/到期日期来自批次/台账记录。
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 mt-2">
                lifeline 中未发现 events 数组，仅显示原始 JSON。
              </div>
            )}

            {/* 原始 JSON，保留完整视图 */}
            <pre className="text-xs bg-slate-50 p-3 rounded max-h-[60vh] overflow-auto mt-4">
              {JSON.stringify(data, null, 2)}
            </pre>
          </>
        )}
      </SectionCard>
    </div>
  );
};

export default BatchLifelinePage;
