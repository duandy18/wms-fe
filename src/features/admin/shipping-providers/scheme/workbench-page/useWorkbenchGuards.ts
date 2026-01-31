// src/features/admin/shipping-providers/scheme/workbench-page/useWorkbenchGuards.ts

import { useEffect } from "react";
import type { NavigateFunction } from "react-router-dom";
import type { SchemeTabKey } from "../types";

export function useWorkbenchGuards(params: {
  schemeId: number | null;
  routeTab: SchemeTabKey | null;
  paramsTab?: string;
  wbTab: SchemeTabKey;
  setWbTab: (t: SchemeTabKey) => void;
  gateCheckingTemplates: boolean;
  gateHasAnyTemplate: boolean;
  navigate: NavigateFunction;
}) {
  const { schemeId, routeTab, paramsTab, wbTab, setWbTab, gateCheckingTemplates, gateHasAnyTemplate, navigate } = params;

  // ✅ 默认进入 table（二维价格表）
  useEffect(() => {
    if (!schemeId || schemeId <= 0) return;
    if (paramsTab) return;
    navigate(`/admin/shipping-providers/schemes/${schemeId}/workbench/table`, { replace: true });
  }, [navigate, paramsTab, schemeId]);

  // ✅ 无模板时：禁止直达其它 tab；允许停留在 table/segments
  useEffect(() => {
    if (!schemeId || schemeId <= 0) return;
    if (gateCheckingTemplates) return;
    if (gateHasAnyTemplate) return;

    const t = routeTab ?? wbTab;
    if (t !== "segments" && t !== "table") {
      navigate(`/admin/shipping-providers/schemes/${schemeId}/workbench/segments`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schemeId, gateCheckingTemplates, gateHasAnyTemplate, routeTab]);

  // ✅ URL tab 变化时同步到 wb.tab（避免页面自己发散）
  useEffect(() => {
    if (!routeTab) return;
    if (wbTab === routeTab) return;
    setWbTab(routeTab);
  }, [routeTab, setWbTab, wbTab]);
}
