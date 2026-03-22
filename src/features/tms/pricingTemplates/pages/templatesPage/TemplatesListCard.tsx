// src/features/tms/pricingTemplates/pages/templatesPage/TemplatesListCard.tsx
//
// 分拆说明：
// - 本文件承接 TemplatesPage 的“下卡（收费表列表）”。
// - 负责：
//   1) 收费表列表表格展示
//   2) 状态 / 使用状态 / 重量段 / 区域数量 / 验证状态展示
//   3) 单行收费表动作区（编辑 / 归档）
// - 不负责：
//   1) 列表数据加载
//   2) create / clone 表单
//   3) 页面级状态控制
// - 维护约束：
//   - 动作裁决统一以后端 capabilities 为准
//   - status / validation_status / used_binding_count / ranges_count / groups_count 只做展示

import React from "react";
import type { PricingTemplate } from "../../types";
import {
  formatDateTime,
  formatTemplateStatusLabel,
  formatUsageStatusLabel,
  formatValidationStatusLabel,
  templateStatusBadgeClass,
  usageStatusBadgeClass,
  validationStatusBadgeClass,
} from "./types";

type Props = {
  rows: PricingTemplate[];
  loading: boolean;
  actingTemplateId: number | null;
  highlightTemplateId?: number | null;
  onOpenWorkbench: (templateId: number) => void;
  onArchive: (templateId: number) => void;
};

function buildReadonlyReasonText(row: PricingTemplate): string | null {
  const reason = row.capabilities.readonly_reason;
  if (reason === "validated_template") {
    return "已人工验证通过，当前只读";
  }
  if (reason === "archived_template") {
    return "已归档，当前只读";
  }
  return null;
}

const TemplatesListCard: React.FC<Props> = ({
  rows,
  loading,
  actingTemplateId,
  highlightTemplateId,
  onOpenWorkbench,
  onArchive,
}) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-base font-semibold text-slate-900">
            收费标准列表
          </div>
        </div>
        <div className="text-sm text-slate-500">共 {rows.length} 个收费表</div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-slate-700">
                <th className="px-4 py-3 font-semibold">收费表名称</th>
                <th className="px-4 py-3 font-semibold">快递公司</th>
                <th className="px-4 py-3 font-semibold">状态</th>
                <th className="px-4 py-3 font-semibold">使用状态</th>
                <th className="px-4 py-3 font-semibold">重量段</th>
                <th className="px-4 py-3 font-semibold">区域数量</th>
                <th className="px-4 py-3 font-semibold">验证状态</th>
                <th className="px-4 py-3 font-semibold">创建时间</th>
                <th className="px-4 py-3 font-semibold">操作</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-slate-500">
                    收费标准加载中...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-slate-500">
                    暂无收费表，先创建一个收费表。
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const rowActing = actingTemplateId === row.id;
                  const canArchive = row.capabilities.can_archive;
                  const readonlyReasonText = buildReadonlyReasonText(row);
                  const isHighlighted = highlightTemplateId === row.id;

                  return (
                    <tr
                      key={row.id}
                      className={`align-top ${isHighlighted ? "bg-emerald-50" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{row.name}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          ID: {row.id}
                        </div>
                        {readonlyReasonText ? (
                          <div className="mt-1 text-xs text-slate-500">
                            {readonlyReasonText}
                          </div>
                        ) : null}
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        <div>{row.shipping_provider_name || "-"}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          provider_id: {row.shipping_provider_id}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${templateStatusBadgeClass(
                            row.status,
                          )}`}
                        >
                          {formatTemplateStatusLabel(row.status)}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${usageStatusBadgeClass(
                            row.used_binding_count,
                          )}`}
                        >
                          {formatUsageStatusLabel(row.used_binding_count)}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-slate-700">{row.ranges_count}</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-slate-700">{row.groups_count}</div>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${validationStatusBadgeClass(
                            row.validation_status,
                          )}`}
                        >
                          {formatValidationStatusLabel(row.validation_status)}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        {formatDateTime(row.created_at)}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => onOpenWorkbench(row.id)}
                            className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                          >
                            编辑
                          </button>

                          <button
                            type="button"
                            onClick={() => onArchive(row.id)}
                            disabled={rowActing || !canArchive}
                            className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {rowActing ? "处理中..." : "归档"}
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
      </div>
    </section>
  );
};

export default TemplatesListCard;
