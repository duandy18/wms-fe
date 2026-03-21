// src/features/tms/pricingTemplates/workbench/components/WorkbenchHeaderCard.tsx

import React, { useMemo } from "react";
import { UI } from "../ui";

type HeaderSummary = {
  id: number;
  name: string;
  status: "draft" | "archived";
  configStatus: "empty" | "incomplete" | "ready";
  validationStatus: "not_validated" | "passed" | "failed";
  usedBindingCount: number;
};

function buildHeaderTitle(args: { templateName?: string | null }): string {
  const templateName = (args.templateName ?? "").trim();
  if (templateName) return templateName;
  return "运价模板工作台";
}

function buildStatusText(status: HeaderSummary["status"]): string {
  return status === "archived" ? "已归档" : "草稿";
}

function buildStatusClass(status: HeaderSummary["status"]): string {
  if (status === "archived") {
    return "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200";
  }
  return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200";
}

function buildConfigStatusText(
  status: HeaderSummary["configStatus"],
): string {
  if (status === "ready") return "已完整";
  if (status === "incomplete") return "待完善";
  return "空白";
}

function buildConfigStatusClass(
  status: HeaderSummary["configStatus"],
): string {
  if (status === "ready") {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";
  }
  if (status === "incomplete") {
    return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200";
  }
  return "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200";
}

function buildValidationText(
  status: HeaderSummary["validationStatus"],
): string {
  if (status === "passed") return "已通过";
  if (status === "failed") return "失败";
  return "未验证";
}

function buildValidationClass(
  status: HeaderSummary["validationStatus"],
): string {
  if (status === "passed") {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";
  }
  if (status === "failed") {
    return "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200";
  }
  return "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200";
}

function buildBindingText(usedBindingCount: number): string {
  return usedBindingCount > 0 ? `已绑定 ${usedBindingCount} 处` : "未绑定";
}

function buildBindingClass(usedBindingCount: number): string {
  if (usedBindingCount > 0) {
    return "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200";
  }
  return "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200";
}

export const WorkbenchHeaderCard: React.FC<{
  templateId: number | null;
  loading?: boolean;
  mutating?: boolean;
  summary: HeaderSummary | null;
  providerName?: string | null;
  onBack: () => void;
}> = ({ loading, mutating, summary, providerName, onBack }) => {
  const templateName = summary?.name ?? null;

  const title = useMemo(() => {
    return buildHeaderTitle({ templateName });
  }, [templateName]);

  const providerText = (providerName ?? "").trim() || "未识别快递公司";

  return (
    <div className={UI.card}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className={`${UI.workbenchTitle} truncate`} title={title}>
            {title}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-slate-700 ring-1 ring-inset ring-slate-200">
              快递公司：{providerText}
            </span>

            {summary ? (
              <>
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-slate-700 ring-1 ring-inset ring-slate-200">
                  方案名称：{summary.name}
                </span>

                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-slate-700 ring-1 ring-inset ring-slate-200">
                  模板 ID：{summary.id}
                </span>

                <span
                  className={`inline-flex rounded-full px-3 py-1 ${buildStatusClass(
                    summary.status,
                  )}`}
                >
                  模板状态：{buildStatusText(summary.status)}
                </span>

                <span
                  className={`inline-flex rounded-full px-3 py-1 ${buildConfigStatusClass(
                    summary.configStatus,
                  )}`}
                >
                  配置状态：{buildConfigStatusText(summary.configStatus)}
                </span>

                <span
                  className={`inline-flex rounded-full px-3 py-1 ${buildValidationClass(
                    summary.validationStatus,
                  )}`}
                >
                  验证状态：{buildValidationText(summary.validationStatus)}
                </span>

                <span
                  className={`inline-flex rounded-full px-3 py-1 ${buildBindingClass(
                    summary.usedBindingCount,
                  )}`}
                >
                  使用状态：{buildBindingText(summary.usedBindingCount)}
                </span>
              </>
            ) : null}
          </div>
        </div>

        <div className={UI.workbenchHeaderActions}>
          <button type="button" className={UI.workbenchBackBtn} onClick={onBack}>
            返回
          </button>
        </div>
      </div>

      {loading || mutating ? (
        <div className="mt-3 text-sm text-slate-500">
          {loading ? "正在加载模板数据…" : null}
          {mutating ? "正在提交变更…" : null}
        </div>
      ) : null}
    </div>
  );
};

export default WorkbenchHeaderCard;
