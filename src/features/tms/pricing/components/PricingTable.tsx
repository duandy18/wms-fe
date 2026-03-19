// src/features/tms/pricing/components/PricingTable.tsx

import React from "react";
import { useNavigate } from "react-router-dom";
import type { PricingListRow, PricingStatus } from "../types";

type Props = {
  rows: PricingListRow[];
  loading: boolean;
  error: string;
  bindRow: (row: PricingListRow) => Promise<void>;
  toggleBinding: (row: PricingListRow) => Promise<void>;
  createSchemeRow: (row: PricingListRow) => Promise<number>;
};

function statusBadgeClass(status: PricingStatus): string {
  switch (status) {
    case "ready":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "no_active_scheme":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "binding_disabled":
      return "border-orange-200 bg-orange-50 text-orange-700";
    case "provider_disabled":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function statusLabel(status: PricingStatus): string {
  switch (status) {
    case "ready":
      return "已就绪";
    case "no_active_scheme":
      return "缺启用运价";
    case "binding_disabled":
      return "未绑定/已停用";
    case "provider_disabled":
      return "网点停用";
    default:
      return status;
  }
}

const PricingTable: React.FC<Props> = ({
  rows,
  loading,
  error,
  bindRow,
  toggleBinding,
  createSchemeRow,
}) => {
  const nav = useNavigate();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <div className="text-base font-semibold text-slate-900">服务关系管理</div>
        <div className="mt-1 text-sm text-slate-500">
          网点 × 仓库 服务关系操作入口（绑定 / 启停 / 运价）
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="px-3 py-3 text-left">网点</th>
              <th className="px-3 py-3 text-left">仓库</th>
              <th className="px-3 py-3 text-left">绑定状态</th>
              <th className="px-3 py-3 text-left">运价状态</th>
              <th className="px-3 py-3 text-left">操作</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-slate-500">
                  加载中...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-slate-500">
                  暂无数据
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={`${row.provider_id}-${row.warehouse_id}`}>
                  <td className="px-3 py-3">{row.provider_name}</td>
                  <td className="px-3 py-3">{row.warehouse_name}</td>

                  <td className="px-3 py-3">
                    {row.binding_active ? (
                      <span className="text-emerald-600">已启用</span>
                    ) : (
                      <span className="text-slate-400">未绑定/停用</span>
                    )}
                  </td>

                  <td className="px-3 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${statusBadgeClass(
                        row.pricing_status,
                      )}`}
                    >
                      {statusLabel(row.pricing_status)}
                    </span>
                  </td>

                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      {!row.binding_active ? (
                        <button
                          className="px-3 py-1 text-xs border rounded"
                          onClick={() => void bindRow(row)}
                        >
                          绑定
                        </button>
                      ) : (
                        <button
                          className="px-3 py-1 text-xs border rounded"
                          onClick={() => void toggleBinding(row)}
                        >
                          停用
                        </button>
                      )}

                      {row.binding_active && row.active_scheme_id ? (
                        <button
                          type="button"
                          className="px-3 py-1 text-xs border rounded text-sky-700 border-sky-300"
                          onClick={() => {
                            nav(
                              `/tms/pricing/workbench/${row.active_scheme_id}?provider_id=${row.provider_id}&warehouse_id=${row.warehouse_id}`,
                            );
                          }}
                        >
                          进入运价
                        </button>
                      ) : null}

                      {row.binding_active && !row.active_scheme_id ? (
                        <button
                          type="button"
                          className="px-3 py-1 text-xs border rounded text-sky-700 border-sky-300"
                          onClick={async () => {
                            const schemeId = await createSchemeRow(row);
                            nav(
                              `/tms/pricing/workbench/${schemeId}?provider_id=${row.provider_id}&warehouse_id=${row.warehouse_id}`,
                            );
                          }}
                        >
                          创建运价
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default PricingTable;
