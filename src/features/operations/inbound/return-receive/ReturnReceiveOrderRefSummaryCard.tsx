// src/features/operations/inbound/return-receive/ReturnReceiveOrderRefSummaryCard.tsx

import React from "react";
import { InboundUI } from "../ui";
import type { ReturnOrderRefDetailOut, ReturnOrderRefSummaryLine } from "../../../return-tasks/api";

function fmtAddr(
  r?:
    | {
        province?: string | null;
        city?: string | null;
        district?: string | null;
        detail?: string | null;
      }
    | null,
) {
  if (!r) return "-";
  const parts = [r.province, r.city, r.district, r.detail].filter(Boolean);
  return parts.length ? parts.join("") : "-";
}

function lineTitle(ln: ReturnOrderRefSummaryLine): string {
  const name = (ln.item_name ?? "").trim();
  if (name) return name;
  return `商品#${ln.item_id}`;
}

export const ReturnReceiveOrderRefSummaryCard: React.FC<{
  detail: ReturnOrderRefDetailOut | null;
  loading: boolean;
  error: string | null;
}> = ({ detail, loading, error }) => {
  return (
    <section className={`${InboundUI.card} ${InboundUI.cardPad} space-y-3`}>
      <h2 className={InboundUI.title}>订单详情（只读）</h2>

      {!detail ? (
        <div className={InboundUI.quiet}>{loading ? "加载中…" : "请选择左侧订单。"} </div>
      ) : (
        <>
          {error ? <div className={InboundUI.danger}>{error}</div> : null}

          <div className="space-y-1 text-sm text-slate-700">
            <div>
              订单号：<span className="font-mono">{detail.order_ref}</span>
            </div>
            <div className="text-[12px] text-slate-600">
              剩余可退：<span className="font-semibold text-slate-900">{detail.remaining_qty ?? "-"}</span> 件
              <span className="mx-2 text-slate-400">·</span>
              平台：{detail.platform ?? "-"} / 店铺：{detail.shop_id ?? "-"}
              <span className="mx-2 text-slate-400">·</span>
              外部单号：<span className="font-mono">{detail.ext_order_no ?? "-"}</span>
            </div>
          </div>

          {/* 运单信息 */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
            <div className="text-sm font-medium text-slate-900">运单信息</div>
            <div className="text-[12px] text-slate-700">
              运单号：<span className="font-mono">{detail.shipping?.tracking_no ?? "-"}</span>
              <span className="mx-2 text-slate-400">·</span>
              快递：{detail.shipping?.carrier_name ?? "-"}
              <span className="mx-2 text-slate-400">·</span>
              状态：{detail.shipping?.status ?? "-"}
            </div>
            <div className="text-[12px] text-slate-700">
              收件人：{detail.shipping?.receiver?.name ?? "-"}{" "}
              <span className="mx-1 text-slate-400">·</span>
              {detail.shipping?.receiver?.phone ?? "-"}
            </div>
            <div className="text-[12px] text-slate-700">地址：{fmtAddr(detail.shipping?.receiver)}</div>
          </div>

          {/* 出库事实（作业人员视角） */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-900">出库事实（只读）</div>
            <div className="text-[12px] text-slate-600">
              出库原因：{detail.summary.ship_reasons?.length ? detail.summary.ship_reasons.join(", ") : "-"}
            </div>

            {detail.summary.lines.length === 0 ? (
              <div className={InboundUI.quiet}>该订单未找到可退回仓的出库行。</div>
            ) : (
              <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-2">
                {detail.summary.lines.map((ln, idx) => (
                  <div key={`${ln.warehouse_id}-${ln.item_id}-${ln.batch_code}-${idx}`} className="rounded-md border border-slate-100 bg-slate-50 px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-medium text-slate-900">{lineTitle(ln)}</div>
                      <div className="text-sm text-slate-900">
                        可退 <span className="font-semibold">{ln.shipped_qty}</span> 件
                      </div>
                    </div>

                    <div className="mt-1 text-[12px] text-slate-600">
                      批次：<span className="font-mono">{ln.batch_code}</span>
                      <span className="mx-2 text-slate-400">·</span>
                      仓库 {ln.warehouse_id}
                      <span className="mx-2 text-slate-400">·</span>
                      <span className="text-slate-500">item_id={ln.item_id}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
};
