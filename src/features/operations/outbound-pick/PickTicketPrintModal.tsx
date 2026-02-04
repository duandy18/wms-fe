// src/features/operations/outbound-pick/PickTicketPrintModal.tsx
//
// 拣货单打印层（瑞幸小票范式）：
// - 仅打印这一块内容（@media print 隐藏页面其它区域）
// - 打开后自动 window.print()
// - Phase 2：删除订单确认码（不生成条码、不做扫码确认）

import React, { useEffect, useMemo } from "react";
import type { PickTask } from "./pickTasksApi";

export type ItemBasicLite = {
  name?: string;
  sku?: string;
  item_name?: string;
  item_code?: string;
  title?: string;
  code?: string;
};

export type ItemMetaMap = Record<number, ItemBasicLite>;

type PickTaskLineLite = {
  item_id: number;
  batch_code?: string | null;
  req_qty?: number | null;
  picked_qty?: number | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  task: PickTask;
  platform: string;
  shopId: string;
  itemMetaMap?: ItemMetaMap | null;
};

export const PickTicketPrintModal: React.FC<Props> = ({ open, onClose, task, platform, shopId, itemMetaMap }) => {
  const orderRef = String(task.ref || `PICKTASK:${task.id}`);

  const lines = useMemo(() => {
    const raw = (task.lines ?? []) as unknown as PickTaskLineLite[];
    return raw
      .map((ln) => {
        const itemId = Number(ln.item_id);
        const req = Number(ln.req_qty ?? 0);
        const picked = Number(ln.picked_qty ?? 0);

        const meta = itemMetaMap ? itemMetaMap[itemId] : undefined;
        const name =
          meta?.name ??
          meta?.item_name ??
          meta?.title ??
          (Number.isFinite(itemId) ? `商品#${itemId}` : "商品");

        const sku = meta?.sku ?? meta?.item_code ?? meta?.code ?? "";

        return { itemId, name, sku, req, picked };
      })
      .filter((x) => x.req > 0); // ✅ 打印的是“订单要求”，不是“已拣”
  }, [task.lines, itemMetaMap]);

  // 打开后自动打印
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => window.print(), 250);
    return () => clearTimeout(timer);
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/40" onClick={onClose} role="presentation" />

      <div className="fixed inset-0 z-[61] flex items-center justify-center p-4">
        <div
          id="pick-ticket-print"
          className="w-[420px] rounded-xl border border-slate-300 bg-white p-4 text-slate-900 shadow-lg"
          onClick={(e) => e.stopPropagation()}
          role="presentation"
        >
          <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-2">
            <div>
              <div className="text-sm font-semibold">拣货单（订单要求）</div>
              <div className="mt-1 text-[11px] text-slate-600">
                平台 <span className="font-mono">{platform}</span> · 店铺 <span className="font-mono">{shopId}</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-600">
                任务ID <span className="font-mono">#{task.id}</span> · 仓库{" "}
                <span className="font-mono">{String(task.warehouse_id ?? "-")}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] text-slate-500">订单引用</div>
              <div className="max-w-[200px] truncate font-mono text-[12px]">{orderRef}</div>
            </div>
          </div>

          <div className="mt-3 text-[11px] text-slate-600">
            Phase 2：按拣货单执行拣货 → 回到系统核对差异（diff）→ 直接提交出库（commit）。
          </div>

          <div className="mt-3 rounded-lg border border-slate-200">
            <table className="w-full text-[12px]">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-2 py-2 text-left">商品</th>
                  <th className="px-2 py-2 text-right">应拣</th>
                  <th className="px-2 py-2 text-right">已拣</th>
                </tr>
              </thead>
              <tbody>
                {lines.length === 0 ? (
                  <tr>
                    <td className="px-2 py-3 text-slate-500" colSpan={3}>
                      该任务暂无 req_qty&gt;0 的订单行。
                    </td>
                  </tr>
                ) : (
                  lines.map((ln, idx) => (
                    <tr key={`${ln.itemId}-${idx}`} className="border-t border-slate-200">
                      <td className="px-2 py-2">
                        <div className="font-medium text-slate-900">{ln.name}</div>
                        {ln.sku ? <div className="font-mono text-[10px] text-slate-500">{ln.sku}</div> : null}
                      </td>
                      <td className="px-2 py-2 text-right font-semibold">{ln.req}</td>
                      <td className="px-2 py-2 text-right font-mono text-slate-700">{ln.picked}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px]"
              onClick={onClose}
            >
              关闭
            </button>
          </div>

          <style>{`
            @media print {
              body { margin: 0; padding: 0; }
              #root > * { display: none !important; }
              #pick-ticket-print {
                display: block !important;
                width: 380px !important;
                border: none !important;
                box-shadow: none !important;
              }
            }
          `}</style>
        </div>
      </div>
    </>
  );
};
