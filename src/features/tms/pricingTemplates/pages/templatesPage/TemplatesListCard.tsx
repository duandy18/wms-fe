// src/features/tms/pricingTemplates/pages/templatesPage/TemplatesListCard.tsx
//
// 分拆说明：
// - 本文件承接 TemplatesPage 的“下卡（模板列表）”。
// - 负责：
//   1) 模板列表表格展示
//   2) 状态 / 使用状态 / 配置状态 / 验证状态展示
//   3) 单一入口动作：进入收费表编辑页面
// - 不负责：
//   1) 列表数据加载
//   2) create / clone 表单
//   3) 页面级状态控制
// - 维护约束：
//   - 当前只保留一个操作按钮
//   - 不把 clone / delete / binding 操作塞回这里

import React from "react";
import { Link } from "react-router-dom";
import type { PricingTemplate } from "../../types";
import {
  configStatusBadgeClass,
  formatConfigStatusLabel,
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
};

const TemplatesListCard: React.FC<Props> = ({ rows, loading }) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-base font-semibold text-slate-900">
            模板列表
          </div>
          <div className="mt-1 text-sm leading-6 text-slate-600">
            列表直接展示模板资产状态、使用状态、配置状态和验证状态，不承载绑定或运行态操作。
          </div>
        </div>
        <div className="text-sm text-slate-500">共 {rows.length} 个模板</div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-slate-700">
                <th className="px-4 py-3 font-semibold">模板名称</th>
                <th className="px-4 py-3 font-semibold">快递公司</th>
                <th className="px-4 py-3 font-semibold">状态</th>
                <th className="px-4 py-3 font-semibold">使用状态</th>
                <th className="px-4 py-3 font-semibold">配置状态</th>
                <th className="px-4 py-3 font-semibold">验证状态</th>
                <th className="px-4 py-3 font-semibold">创建时间</th>
                <th className="px-4 py-3 font-semibold">操作</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                    模板列表加载中...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                    暂无模板，先创建一个模板。
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  return (
                    <tr key={row.id} className="align-top">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{row.name}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          ID: {row.id}
                        </div>
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
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-medium ${configStatusBadgeClass(
                              row.config_status,
                            )}`}
                          >
                            {formatConfigStatusLabel(row.config_status)}
                          </span>
                          <div className="text-xs text-slate-500">
                            ranges {row.ranges_count} / groups {row.groups_count} / cells{" "}
                            {row.matrix_cells_count}
                          </div>
                        </div>
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
                          <Link
                            to={`/tms/templates/${row.id}`}
                            className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                          >
                            进入收费表编辑页面
                          </Link>
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
