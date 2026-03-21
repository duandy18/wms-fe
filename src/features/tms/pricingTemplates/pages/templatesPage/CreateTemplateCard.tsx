// src/features/tms/pricingTemplates/pages/templatesPage/CreateTemplateCard.tsx
//
// 分拆说明：
// - 本文件承接 TemplatesPage 的“上卡”。
// - 负责：
//   1) 创建方式切换（新建 / 基于模板创建）
//   2) provider / 基础模板 / 模板名称表单
//   3) 成功提示与进入收费表编辑页面按钮
//   4) 刷新列表 / 返回运价管理按钮
// - 不负责：
//   1) API 调用
//   2) 页面级状态持有
//   3) 列表表格展示
// - 维护约束：
//   - 保持为纯展示组件
//   - 所有动作通过 props 回调回到页面层处理

import React from "react";
import type { PricingProviderOption } from "../../../pricing/api";
import type { PricingTemplate } from "../../types";
import type { CreateFormState, SuccessState } from "./types";

type Props = {
  loading: boolean;
  providerOptions: PricingProviderOption[];
  providersLoading: boolean;
  createForm: CreateFormState;
  visibleSourceTemplates: PricingTemplate[];
  submitting: boolean;
  successState: SuccessState;
  error: string;
  onRefresh: () => void;
  onBackToPricing: () => void;
  onChangeField: <K extends keyof CreateFormState>(
    key: K,
    value: CreateFormState[K],
  ) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
  onOpenWorkbench: (templateId: number) => void;
};

const CreateTemplateCard: React.FC<Props> = ({
  loading,
  providerOptions,
  providersLoading,
  createForm,
  visibleSourceTemplates,
  submitting,
  successState,
  error,
  onRefresh,
  onBackToPricing,
  onChangeField,
  onSubmit,
  onReset,
  onOpenWorkbench,
}) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-base font-semibold text-slate-900">
            创建模板
          </div>
          <div className="mt-1 text-sm leading-6 text-slate-600">
            这里只创建模板资产。创建后停留当前页，再决定是否进入收费表编辑页面继续配置。
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "刷新中..." : "刷新列表"}
          </button>

          <button
            type="button"
            onClick={onBackToPricing}
            className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            返回运价管理
          </button>
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="block">
            <div className="mb-1 text-sm font-medium text-slate-700">
              创建方式
            </div>
            <select
              value={createForm.mode}
              onChange={(e) =>
                onChangeField("mode", e.target.value as CreateFormState["mode"])
              }
              disabled={submitting}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-slate-500 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              <option value="create">新建模板</option>
              <option value="clone">基于模板创建</option>
            </select>
          </label>

          <label className="block">
            <div className="mb-1 text-sm font-medium text-slate-700">
              快递公司
            </div>
            <select
              value={createForm.shipping_provider_id}
              onChange={(e) =>
                onChangeField("shipping_provider_id", e.target.value)
              }
              disabled={submitting || providersLoading}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-slate-500 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              <option value="">
                {providersLoading ? "快递公司加载中..." : "请选择快递公司"}
              </option>
              {providerOptions.map((item) => (
                <option key={item.provider_id} value={String(item.provider_id)}>
                  {item.provider_code
                    ? `${item.provider_code} ${item.provider_name}`
                    : item.provider_name}
                  {item.provider_active ? "" : "（已停用）"}
                </option>
              ))}
            </select>
          </label>

          {createForm.mode === "clone" ? (
            <label className="block">
              <div className="mb-1 text-sm font-medium text-slate-700">
                基础模板
              </div>
              <select
                value={createForm.source_template_id}
                onChange={(e) =>
                  onChangeField("source_template_id", e.target.value)
                }
                disabled={submitting}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-slate-500 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <option value="">请选择基础模板</option>
                {visibleSourceTemplates.map((item) => (
                  <option key={item.id} value={String(item.id)}>
                    {item.name}（{item.shipping_provider_name || "未命名快递公司"}）
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <label className="block">
            <div className="mb-1 text-sm font-medium text-slate-700">
              模板名称
            </div>
            <input
              type="text"
              value={createForm.name}
              onChange={(e) => onChangeField("name", e.target.value)}
              disabled={submitting}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-slate-500 disabled:cursor-not-allowed disabled:bg-slate-100"
              placeholder="例如：申通-江浙沪模板"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={submitting || providersLoading}
            className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "处理中..."
              : createForm.mode === "create"
                ? "创建模板"
                : "基于模板创建"}
          </button>

          <button
            type="button"
            onClick={onReset}
            disabled={submitting}
            className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            重置
          </button>
        </div>
      </form>

      {successState ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
          <div className="font-medium">
            {successState.action === "create" ? "模板创建成功" : "模板克隆成功"}：
            {successState.templateName}
          </div>
          <div className="mt-3">
            <button
              type="button"
              onClick={() => onOpenWorkbench(successState.templateId)}
              className="inline-flex items-center rounded-xl bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
            >
              进入收费表编辑页面
            </button>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}
    </section>
  );
};

export default CreateTemplateCard;
