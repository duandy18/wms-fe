// src/features/tms/pricingTemplates/pages/templatesPage/CreateTemplateCard.tsx
//
// 分拆说明：
// - 本文件承接 TemplatesPage 的“上卡”。
// - 负责：
//   1) 创建方式切换（新建 / 基于模板创建）
//   2) provider / 基础模板 / 模板名称表单
//   3) 重量段数量 / 区域数量输入
//   4) 成功提示
//   5) 刷新列表 / 返回运价管理按钮
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
}) => {
  const cloneMode = createForm.mode === "clone";
  const noProviderSelected =
    cloneMode && !createForm.shipping_provider_id.trim();
  const noCloneableTemplates =
    cloneMode &&
    !noProviderSelected &&
    visibleSourceTemplates.length === 0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-base font-semibold text-slate-900">
            创建收费表
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
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
              <option value="create">新建</option>
              <option value="clone">用模板创建</option>
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

          {cloneMode ? (
            <label className="block">
              <div className="mb-1 text-sm font-medium text-slate-700">
                基础模板
              </div>
              <select
                value={createForm.source_template_id}
                onChange={(e) =>
                  onChangeField("source_template_id", e.target.value)
                }
                disabled={submitting || noProviderSelected || noCloneableTemplates}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-slate-500 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <option value="">
                  {noProviderSelected
                    ? "请先选择快递公司"
                    : noCloneableTemplates
                      ? "当前快递公司下没有可克隆模板"
                      : "请选择基础模板"}
                </option>
                {visibleSourceTemplates.map((item) => (
                  <option key={item.id} value={String(item.id)}>
                    {item.name}
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

          <label className="block">
            <div className="mb-1 text-sm font-medium text-slate-700">
              重量段数量
            </div>
            <input
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={createForm.ranges_count}
              onChange={(e) => onChangeField("ranges_count", e.target.value)}
              disabled={submitting || cloneMode}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-slate-500 disabled:cursor-not-allowed disabled:bg-slate-100"
              placeholder={cloneMode ? "选择基础模板后自动带出" : "例如：5"}
            />
          </label>

          <label className="block">
            <div className="mb-1 text-sm font-medium text-slate-700">
              区域数量
            </div>
            <input
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={createForm.groups_count}
              onChange={(e) => onChangeField("groups_count", e.target.value)}
              disabled={submitting || cloneMode}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-slate-500 disabled:cursor-not-allowed disabled:bg-slate-100"
              placeholder={cloneMode ? "选择基础模板后自动带出" : "例如：3"}
            />
          </label>
        </div>

        {cloneMode && noProviderSelected ? (
          <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
            请先选择快递公司，再选择基础模板。
          </div>
        ) : null}

        {cloneMode && noCloneableTemplates ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            当前快递公司下没有可克隆模板。基础模板来源以后端 capabilities 为准；
            只有后端判定 can_clone=true 的模板才会出现在这里。
          </div>
        ) : null}


        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={
              submitting ||
              providersLoading ||
              noProviderSelected ||
              noCloneableTemplates
            }
            className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "处理中..."
              : createForm.mode === "create"
                ? "创建收费表"
                : "用模板创建"}
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
            {successState.action === "create" ? "收费表创建成功" : "收费表克隆成功"}：
            {successState.templateName}
          </div>
          <div className="mt-1 text-sm text-emerald-700">
            请在下方列表进入收费表编辑页面。
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
