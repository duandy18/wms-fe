// src/features/tms/pricingTemplates/pages/TemplatesPage.tsx
//
// 分拆说明：
// - 本文件只保留页面级编排逻辑：
//   1) 数据加载
//   2) 表单状态
//   3) 页面动作（create / clone / refresh / navigate）
//   4) 上下卡片装配
// - 具体 UI 已拆到：
//   - ./templatesPage/CreateTemplateCard
//   - ./templatesPage/TemplatesListCard
// - 维护约束：
//   - 不要把大段 JSX 再塞回本文件
//   - 页面级 hook / 业务状态可以留在这里
//   - 展示格式化函数放到 templatesPage/types.ts 统一管理

import React from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "../../../../components/ui/PageTitle";
import type { PricingProviderOption } from "../../pricing/api";
import { fetchPricingProviderOptions } from "../../pricing/api";
import {
  archivePricingTemplate,
  clonePricingTemplate,
  createPricingTemplate,
  fetchPricingTemplates,
} from "../api";
import type { PricingTemplate, PricingTemplateCreateInput } from "../types";
import CreateTemplateCard from "./templatesPage/CreateTemplateCard";
import TemplatesListCard from "./templatesPage/TemplatesListCard";
import type {
  CreateFormState,
  SuccessState,
} from "./templatesPage/types";
import { DEFAULT_CREATE_FORM } from "./templatesPage/types";

function parsePositiveInteger(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  if (!/^\d+$/.test(trimmed)) {
    return null;
  }
  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

const TemplatesPage: React.FC = () => {
  const navigate = useNavigate();

  const [rows, setRows] = React.useState<PricingTemplate[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const [providerOptions, setProviderOptions] = React.useState<
    PricingProviderOption[]
  >([]);
  const [providersLoading, setProvidersLoading] = React.useState(false);
  const [providersError, setProvidersError] = React.useState("");

  const [createForm, setCreateForm] =
    React.useState<CreateFormState>(DEFAULT_CREATE_FORM);
  const [submitting, setSubmitting] = React.useState(false);
  const [successState, setSuccessState] = React.useState<SuccessState>(null);
  const [actingTemplateId, setActingTemplateId] = React.useState<number | null>(null);

  const loadTemplates = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchPricingTemplates();
      setRows(data);
    } catch (err) {
      setRows([]);
      setError(err instanceof Error ? err.message : "收费表列表加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadProviders = React.useCallback(async () => {
    setProvidersLoading(true);
    setProvidersError("");
    try {
      const data = await fetchPricingProviderOptions();
      setProviderOptions(data);
    } catch (err) {
      setProviderOptions([]);
      setProvidersError(
        err instanceof Error ? err.message : "快递公司选项加载失败",
      );
    } finally {
      setProvidersLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadTemplates();
    void loadProviders();
  }, [loadTemplates, loadProviders]);

  const updateCreateField = React.useCallback(
    <K extends keyof CreateFormState>(key: K, value: CreateFormState[K]) => {
      setCreateForm((prev) => {
        const next = { ...prev, [key]: value };

        if (key === "mode") {
          if (value === "create") {
            next.source_template_id = "";
          } else {
            next.source_template_id = "";
            next.ranges_count = "";
            next.groups_count = "";
          }
        }

        if (key === "shipping_provider_id") {
          if (next.mode === "create") {
            next.source_template_id = "";
          } else {
            next.source_template_id = "";
            next.ranges_count = "";
            next.groups_count = "";
          }
        }

        if (key === "source_template_id") {
          const templateId = Number(value);
          if (Number.isFinite(templateId) && templateId > 0) {
            const sourceTemplate = rows.find((item) => item.id === templateId);
            if (sourceTemplate) {
              next.shipping_provider_id = String(sourceTemplate.shipping_provider_id);
              next.ranges_count = String(sourceTemplate.ranges_count);
              next.groups_count = String(sourceTemplate.groups_count);
            }
          } else {
            next.ranges_count = "";
            next.groups_count = "";
          }
        }

        return next;
      });
    },
    [rows],
  );

  const resetCreateForm = React.useCallback(() => {
    setCreateForm(DEFAULT_CREATE_FORM);
  }, []);

  const visibleSourceTemplates = React.useMemo(() => {
    const cloneableRows = rows.filter((row) => row.capabilities.can_clone);
    const providerId = Number(createForm.shipping_provider_id);

    if (!Number.isFinite(providerId) || providerId <= 0) {
      return [];
    }

    return cloneableRows.filter(
      (row) => Number(row.shipping_provider_id) === Number(providerId),
    );
  }, [createForm.shipping_provider_id, rows]);

  const buildCreatePayload = React.useCallback(
    (form: CreateFormState): PricingTemplateCreateInput => {
      const expectedRangesCount = parsePositiveInteger(form.ranges_count);
      const expectedGroupsCount = parsePositiveInteger(form.groups_count);

      if (expectedRangesCount == null) {
        throw new Error("请填写正确的重量段数量");
      }

      if (expectedGroupsCount == null) {
        throw new Error("请填写正确的区域数量");
      }

      return {
        shipping_provider_id: Number(form.shipping_provider_id),
        name: form.name.trim(),
        expected_ranges_count: expectedRangesCount,
        expected_groups_count: expectedGroupsCount,
      };
    },
    [],
  );

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError("");
      setSuccessState(null);

      if (!createForm.name.trim()) {
        setError("请填写收费表名称");
        return;
      }

      if (!createForm.shipping_provider_id.trim()) {
        setError("请选择快递公司");
        return;
      }

      if (createForm.mode === "create") {
        if (parsePositiveInteger(createForm.ranges_count) == null) {
          setError("请填写正确的重量段数量");
          return;
        }

        if (parsePositiveInteger(createForm.groups_count) == null) {
          setError("请填写正确的区域数量");
          return;
        }
      }

      if (createForm.mode === "clone") {
        if (!createForm.source_template_id.trim()) {
          setError("请选择基础模板");
          return;
        }
      }

      setSubmitting(true);
      try {
        if (createForm.mode === "create") {
          const created = await createPricingTemplate(
            buildCreatePayload(createForm),
          );
          setSuccessState({
            templateId: created.id,
            templateName: created.name,
            action: "create",
          });
        } else {
          const sourceTemplateId = Number(createForm.source_template_id);
          const cloned = await clonePricingTemplate(sourceTemplateId, {
            name: createForm.name.trim(),
          });
          setSuccessState({
            templateId: cloned.id,
            templateName: cloned.name,
            action: "clone",
          });
        }

        resetCreateForm();
        await loadTemplates();
      } catch (err) {
        setError(err instanceof Error ? err.message : "收费表操作失败");
      } finally {
        setSubmitting(false);
      }
    },
    [buildCreatePayload, createForm, loadTemplates, resetCreateForm],
  );

  const handleListArchive = React.useCallback(
    async (templateId: number) => {
      setError("");
      setSuccessState(null);
      setActingTemplateId(templateId);
      try {
        await archivePricingTemplate(templateId);
        await loadTemplates();
      } catch (err) {
        setError(err instanceof Error ? err.message : "归档收费表失败");
      } finally {
        setActingTemplateId(null);
      }
    },
    [loadTemplates],
  );

  return (
    <div className="space-y-4 p-6">
      <PageTitle
        title="收费表"
        description=""
      />

      {providersError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          快递公司选项加载失败：{providersError}
        </div>
      ) : null}

      <CreateTemplateCard
        loading={loading}
        providerOptions={providerOptions}
        providersLoading={providersLoading}
        createForm={createForm}
        visibleSourceTemplates={visibleSourceTemplates}
        submitting={submitting}
        successState={successState}
        error={error}
        onRefresh={() => void loadTemplates()}
        onBackToPricing={() => navigate("/tms/pricing")}
        onChangeField={updateCreateField}
        onSubmit={handleSubmit}
        onReset={() => {
          resetCreateForm();
          setError("");
          setSuccessState(null);
        }}
      />

      <TemplatesListCard
        rows={rows}
        loading={loading}
        actingTemplateId={actingTemplateId}
        highlightTemplateId={successState?.templateId ?? null}
        onOpenWorkbench={(templateId) => navigate(`/tms/templates/${templateId}`)}
        onArchive={handleListArchive}
      />
    </div>
  );
};

export default TemplatesPage;
