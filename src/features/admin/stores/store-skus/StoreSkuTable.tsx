import React from "react";
import type { StoreSkuListItem } from "../types";

export function StoreSkuTable(props: {
  rows: StoreSkuListItem[];
  loading: boolean;
  canWrite: boolean;
  onRemove: (itemId: number) => void;
}) {
  const { rows, loading, canWrite, onRemove } = props;

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-3 py-2 text-left">商品</th>
            <th className="px-3 py-2 text-left">履约仓（唯一）</th>
            <th className="px-3 py-2 text-right">可售库存</th>
            <th className="px-3 py-2 text-right w-56">操作</th>
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="px-3 py-3 text-slate-500" colSpan={4}>
                {loading ? "加载中…" : "暂无 SKU。请先搜索并加入商品到商铺。"}
              </td>
            </tr>
          ) : (
            rows.map((r) => {
              const name = (r.item_name ?? "").trim();
              const sku = (r.platform_sku ?? "").trim();

              // 规则层尚未接入：统一显示缺失
              const routeMissing = true;

              return (
                <tr key={r.item_id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-3 py-2">
                    <div className="font-medium text-slate-900">{name || `Item #${r.item_id}`}</div>
                    <div className="text-[11px] text-slate-500">
                      item_id: <span className="font-mono">{r.item_id}</span>
                      {sku ? (
                        <>
                          {" "}
                          · 平台 SKU: <span className="font-mono">{sku}</span>
                        </>
                      ) : null}
                    </div>
                  </td>

                  <td className="px-3 py-2">
                    {routeMissing ? (
                      <div>
                        <span className="text-amber-700 font-semibold">⚠️ 未设置</span>
                        <div className="text-[11px] text-slate-500">
                          缺失配置：该 SKU 下单将失败（不兜底、不拆单）。
                        </div>
                      </div>
                    ) : (
                      <span className="font-medium">（待接入）</span>
                    )}
                  </td>

                  <td className="px-3 py-2 text-right font-mono text-slate-500">—</td>

                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        disabled
                        className="rounded border border-slate-300 px-3 py-1 text-xs text-slate-600 disabled:opacity-60"
                        title="store_item_routes 尚未接入：将提供“SKU → 仓库（唯一）”设置入口"
                      >
                        设置履约仓
                      </button>

                      <button
                        type="button"
                        disabled={!canWrite || loading}
                        onClick={() => onRemove(r.item_id)}
                        className="rounded border border-rose-200 px-3 py-1 text-xs text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                      >
                        移除 SKU
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
