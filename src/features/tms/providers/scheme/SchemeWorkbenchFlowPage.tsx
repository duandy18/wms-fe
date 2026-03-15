// src/features/tms/providers/scheme/SchemeWorkbenchFlowPage.tsx
//
// ✅ 运价方案工作台（新主线）
// - 页面顺序：
//   1) 运价编辑工作台（四卡：重量段 / 区域范围 / 价格矩阵 / 附加费）
//   2) 算价解释（只读）
//
// 当前页面只承载三阶段模块模型：
// - modules
// - ranges
// - groups
// - matrix_cells
// - surcharges
//
// 历史旧矩阵整表链路已退出主线页，不再参与渲染。

import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { UI } from "./ui";
import { useSchemeWorkbench } from "./useSchemeWorkbench";

import { WorkbenchHeaderCard } from "./components/WorkbenchHeaderCard";
import SuccessBar from "./workbench/SuccessBar";
import { useFlashOkBar } from "./workbench/useFlashOkBar";

import PricingSection from "./flow/sections/PricingSection";
import ExplainSection from "./flow/sections/ExplainSection";

type WorkbenchLocationState = {
  from?: string;
};

export const SchemeWorkbenchFlowPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ schemeId: string }>();
  const schemeId = params.schemeId ? Number(params.schemeId) : null;

  const wb = useSchemeWorkbench({ open: true, schemeId });
  const pageDisabled = wb.loading || wb.refreshing || wb.mutating;

  const { okMsg, flashOk, clearOk } = useFlashOkBar({ autoHideMs: 2500 });

  const onBack = () => {
    const st = (location.state ?? {}) as WorkbenchLocationState;
    if (typeof st.from === "string" && st.from.trim()) {
      navigate(st.from, { replace: true });
      return;
    }

    const providerId = wb.detail?.shipping_provider_id ?? null;
    if (typeof providerId === "number" && providerId > 0) {
      navigate(`/tms/providers/${providerId}/edit`, { replace: true });
      return;
    }

    navigate("/tms/providers", { replace: true });
  };

  const draftOnlyDisabled = pageDisabled || (wb.detail?.status ?? "draft") !== "draft";

  return (
    <div className={UI.page}>
      <WorkbenchHeaderCard
        schemeId={schemeId}
        loading={wb.loading}
        mutating={wb.mutating}
        summary={wb.summary ? { id: wb.summary.id, name: wb.summary.name } : null}
        providerName={wb.providerName}
        onBack={onBack}
      />

      {wb.refreshing ? <div className={UI.workbenchSyncBar}>正在同步最新数据…</div> : null}

      <SuccessBar msg={okMsg} onClose={clearOk} />
      {wb.error ? <div className={UI.error}>{wb.error}</div> : null}

      <div className="space-y-4">
        {wb.loading && !wb.detail ? (
          <div className={UI.zonePageHint}>正在加载…</div>
        ) : !wb.detail ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">暂无数据</div>
        ) : (
          <>
            {wb.detail.status !== "draft" ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                当前方案状态为 <span className="font-semibold">{wb.detail.status}</span>，前端已切为只读。
                如需修改，请先克隆为新的 draft，再进入编辑。
              </div>
            ) : null}

            <PricingSection
              detail={wb.detail}
              disabled={draftOnlyDisabled}
              onError={(msg) => wb.setError(msg)}
            />

            <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
              算价解释基于<strong>当前已保存版本</strong>执行。
              若你刚修改了重量段、区域范围、价格矩阵或附加费但尚未保存，这里的试算结果不会反映未保存改动。
            </div>

            <ExplainSection
              schemeId={wb.detail.id}
              selectedZoneId={null}
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

export default SchemeWorkbenchFlowPage;
