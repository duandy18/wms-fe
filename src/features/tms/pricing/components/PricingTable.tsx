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
};

function statusBadge(status: PricingStatus) {
  switch (status) {
    case "ready":
      return {
        text: "已就绪",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    case "no_active_template":
      return {
        text: "未挂模板",
        className: "bg-amber-50 text-amber-700 border-amber-200",
      };
    case "binding_disabled":
      return {
        text: "绑定停用",
        className: "bg-slate-50 text-slate-700 border-slate-300",
      };
    case "provider_disabled":
      return {
        text: "网点停用",
        className: "bg-slate-50 text-slate-700 border-slate-300",
      };
    case "template_archived":
      return {
        text: "模板已归档",
        className: "bg-rose-50 text-rose-700 border-rose-200",
      };
    default:
      return {
        text: status,
        className: "bg-slate-50 text-slate-700 border-slate-200",
      };
  }
}

const PricingTable: React.FC<Props> = ({
  rows,
  loading,
  error,
  bindRow,
  toggleBinding,
}) => {
  const nav = useNavigate();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <div className="text-base font-semibold text-slate-900">
          运价管理
        </div>
        <div className="mt-1 text-sm text-slate-500">
          仓库 × 快递网点 运行关系（binding、当前模板、运行状态）
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
              <th className="px-3 py-3 text-left">服务关系</th>
              <th className="px-3 py-3 text-left">当前模板</th>
              <th className="px-3 py-3 text-left">运行状态</th>
              <th className="px-3 py-3 text-left">操作</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-slate-500">
                  加载中...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-slate-500">
                  暂无数据
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const status = statusBadge(row.pricing_status);

                return (
                  <tr key={`${row.provider_id}-${row.warehouse_id}`}>
                    <td className="px-3 py-3">
                      <div className="font-medium text-slate-900">
                        {row.provider_name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {row.provider_code}
                      </div>
                    </td>

                    <td className="px-3 py-3">{row.warehouse_name}</td>

                    <td className="px-3 py-3">
                      {row.binding_active ? (
                        <span className="text-emerald-600">已绑定</span>
                      ) : (
                        <span className="text-slate-400">未绑定</span>
                      )}
                    </td>

                    <td className="px-3 py-3">
                      {row.active_template_id ? (
                        <div>
                          <div className="font-medium text-slate-900">
                            {row.active_template_name || `模板 #${row.active_template_id}`}
                          </div>
                          <div className="text-xs text-slate-500">
                            模板 ID：{row.active_template_id}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">暂无模板</span>
                      )}
                    </td>

                    <td className="px-3 py-3">
                      <span
                        className={`rounded border px-2 py-1 text-xs ${status.className}`}
                      >
                        {status.text}
                      </span>
                    </td>

                    <td className="px-3 py-3">
                      <div className="flex gap-2">
                        {!row.binding_active && (
                          <button
                            className="rounded border px-3 py-1 text-xs"
                            onClick={() => void bindRow(row)}
                          >
                            绑定
                          </button>
                        )}

                        {row.binding_active && (
                          <>
                            <button
                              className="rounded border px-3 py-1 text-xs"
                              onClick={() => void toggleBinding(row)}
                            >
                              {row.pricing_status === "binding_disabled" ? "启用" : "停用"}
                            </button>

                            {row.active_template_id ? (
                              <button
                                className="rounded border border-sky-300 px-3 py-1 text-xs text-sky-700"
                                onClick={() =>
                                  nav(
                                    `/tms/templates/${row.active_template_id}?provider_id=${row.provider_id}&warehouse_id=${row.warehouse_id}`,
                                  )
                                }
                              >
                                查看模板
                              </button>
                            ) : (
                              <span className="px-3 py-1 text-xs text-slate-400">
                                暂无模板
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default PricingTable;
