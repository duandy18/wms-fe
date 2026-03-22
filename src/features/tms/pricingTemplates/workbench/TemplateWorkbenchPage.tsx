// src/features/tms/pricingTemplates/workbench/TemplateWorkbenchPage.tsx
//
// ✅ 运价模板详情页（Template 主线）
// - 正式入口：/tms/templates/:templateId
// - 页面顺序：
//   1) 模板编辑工作台（四卡：重量段 / 区域范围 / 价格矩阵 / 附加费）
//   2) 算价解释（只读）
//
// 当前页面只负责把“模板页外壳”扶正；
// 内部四块编辑器继续使用当前 workbench 结构。

import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { submitPricingTemplateValidation } from "../api";
import { UI } from "./ui";
import { useTemplateWorkbench } from "./useTemplateWorkbench";

import { WorkbenchHeaderCard } from "./components/WorkbenchHeaderCard";
import SuccessBar from "./SuccessBar";
import { useFlashOkBar } from "./useFlashOkBar";

import PricingSection from "./flow/sections/PricingSection";
import ExplainSection from "./flow/sections/ExplainSection";

type WorkbenchLocationState = {
  from?: string;
};



export const TemplateWorkbenchPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ templateId: string }>();
  const templateId = params.templateId ? Number(params.templateId) : null;

  const wb = useTemplateWorkbench({ open: true, templateId });
  const pageDisabled = wb.loading || wb.refreshing || wb.mutating;

  const { okMsg, flashOk, clearOk } = useFlashOkBar({ autoHideMs: 2500 });

  const onBack = () => {
    const st = (location.state ?? {}) as WorkbenchLocationState;
    if (typeof st.from === "string" && st.from.trim()) {
      navigate(st.from, { replace: true });
      return;
    }

    navigate("/tms/templates", { replace: true });
  };

  const handleSubmitValidation = React.useCallback(() => {
    if (!templateId) return;
    void wb.mutate(async () => {
      await submitPricingTemplateValidation(templateId);
      flashOk("已提交人工验证");
    });
  }, [flashOk, templateId, wb]);

  const readonlyReason = wb.detail?.capabilities?.readonly_reason ?? null;
  const pageReadonly =
    readonlyReason === "validated_template" ||
    readonlyReason === "archived_template";

  const workbenchDisabled = pageDisabled || pageReadonly;

  

  return (
    <div className={UI.page}>
      <WorkbenchHeaderCard
        templateId={templateId}
        loading={wb.loading}
        mutating={wb.mutating}
        actionLoading={wb.mutating}
        summary={wb.summary}
        providerName={wb.providerName}
        onBack={onBack}
        onSubmitValidation={handleSubmitValidation}
      />

      {wb.refreshing ? (
        <div className={UI.workbenchSyncBar}>正在同步最新数据…</div>
      ) : null}

      <SuccessBar msg={okMsg} onClose={clearOk} />
      {wb.error ? <div className={UI.error}>{wb.error}</div> : null}

      <div className="space-y-4">
        {wb.loading && !wb.detail ? (
          <div className={UI.zonePageHint}>正在加载…</div>
        ) : !wb.detail ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
            暂无数据
          </div>
        ) : (
          <>
            

            <PricingSection
              detail={wb.detail}
              disabled={workbenchDisabled}
              onError={(msg) => wb.setError(msg)}
            />

            <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
              算价解释基于<strong>当前已保存版本</strong>执行。
              若你刚修改了重量段、区域范围、价格矩阵或附加费但尚未保存，这里的试算结果不会反映未保存改动。
            </div>

            <ExplainSection
              templateId={wb.detail.id}
              disabled={pageDisabled}
              onError={(msg) => {
                wb.setError(msg);
                flashOk("");
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default TemplateWorkbenchPage;
