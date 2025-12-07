// src/components/snapshot/InventoryDrawer.tsx
import React from "react";
import type { ItemDetailResponse } from "../../features/inventory/snapshot/api";

interface Props {
  open: boolean;
  loading?: boolean;
  item: ItemDetailResponse | null;
  onClose: () => void;
}

export default function InventoryDrawer({
  open,
  loading = false,
  item,
  onClose,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex">
      {/* 背景遮罩 */}
      <div
        className="flex-1 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 右侧抽屉 */}
      <div className="w-full max-w-xl bg-white shadow-xl h-full flex flex-col">
        {/* 头部：标题 + 关闭 */}
        <header className="h-16 flex items-center justify-between border-b border-slate-200 px-6">
          <div>
            {/* 主标题：24px */}
            <div className="text-2xl font-semibold text-slate-900">
              单品明细
            </div>
            {item && (
              <div className="mt-1 text-base text-slate-600">
                #{item.item_id} {item.item_name}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-base text-slate-500 hover:text-slate-800"
          >
            关闭
          </button>
        </header>

        {/* 主体内容 */}
        <main className="flex-1 overflow-auto p-5 space-y-5">
          {loading && (
            <div className="text-base text-slate-600">加载中…</div>
          )}

          {!loading && item && (
            <>
              {/* 汇总区域 */}
              <section className="border border-slate-200 rounded-lg p-4">
                <div className="text-lg font-semibold text-slate-800 mb-3">
                  汇总
                </div>
                <div className="flex gap-8 text-base">
                  <div>
                    <div className="text-sm text-slate-500 mb-1">
                      在库 on_hand
                    </div>
                    <div className="text-xl font-semibold text-slate-900">
                      {item.totals.on_hand_qty}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 mb-1">
                      可用 available
                    </div>
                    <div className="text-xl font-semibold text-slate-900">
                      {item.totals.available_qty}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 mb-1">
                      预占 reserved
                    </div>
                    <div className="text-xl font-semibold text-slate-900">
                      {item.totals.reserved_qty}
                    </div>
                  </div>
                </div>
              </section>

              {/* 仓 + 批次切片列表 */}
              <section className="border border-slate-200 rounded-lg">
                {/* 表头标题 */}
                <div className="px-4 py-3 border-b border-slate-200 text-lg font-semibold text-slate-800">
                  仓 + 批次切片
                </div>
                <div className="max-h-[440px] overflow-auto">
                  <table className="min-w-full text-base">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2 text-left text-sm text-slate-600">
                          仓库
                        </th>
                        <th className="px-3 py-2 text-left text-sm text-slate-600">
                          批次
                        </th>
                        <th className="px-3 py-2 text-right text-sm text-slate-600">
                          在库
                        </th>
                        <th className="px-3 py-2 text-right text-sm text-slate-600">
                          可用
                        </th>
                        <th className="px-3 py-2 text-left text-sm text-slate-600">
                          生产日
                        </th>
                        <th className="px-3 py-2 text-left text-sm text-slate-600">
                          到期日
                        </th>
                        <th className="px-3 py-2 text-left text-sm text-slate-600">
                          标记
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {item.slices.map((s, idx) => (
                        <tr
                          key={`${s.warehouse_id}-${s.batch_code}-${idx}`}
                          className="border-b border-slate-100 text-base"
                        >
                          <td className="px-3 py-2 whitespace-nowrap">
                            {s.warehouse_name}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {s.batch_code}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {s.on_hand_qty}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {s.available_qty}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {s.production_date || "-"}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {s.expiry_date || "-"}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {s.is_top && (
                              <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-700 mr-2 text-sm">
                                TOP
                              </span>
                            )}
                            {s.near_expiry && (
                              <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm">
                                临期
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}

                      {item.slices.length === 0 && (
                        <tr>
                          <td
                            className="px-3 py-4 text-center text-slate-400 text-base"
                            colSpan={7}
                          >
                            无在库批次
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          {!loading && !item && (
            <div className="text-base text-slate-500">暂无数据。</div>
          )}
        </main>
      </div>
    </div>
  );
}
