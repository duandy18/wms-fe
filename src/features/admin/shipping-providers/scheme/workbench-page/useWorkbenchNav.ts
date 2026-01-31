// src/features/admin/shipping-providers/scheme/workbench-page/useWorkbenchNav.ts

import { useCallback } from "react";
import type { Location, NavigateFunction } from "react-router-dom";
import type { SchemeTabKey } from "../types";
import type { WorkbenchLocationState } from "./types";

export function useWorkbenchNav(params: {
  schemeId: number | null;
  location: Location;
  navigate: NavigateFunction;
  providerId: number | null;
}) {
  const { schemeId, location, navigate, providerId } = params;

  const goTab = useCallback(
    (k: SchemeTabKey) => {
      if (!schemeId || schemeId <= 0) return;
      navigate(`/admin/shipping-providers/schemes/${schemeId}/workbench/${k}`);
    },
    [navigate, schemeId],
  );

  const goFlowPage = useCallback(() => {
    if (!schemeId || schemeId <= 0) return;
    navigate(`/admin/shipping-providers/schemes/${schemeId}/workbench-flow`, { replace: false });
  }, [navigate, schemeId]);

  const onBack = useCallback(() => {
    const st = (location.state ?? {}) as WorkbenchLocationState;
    if (typeof st.from === "string" && st.from.trim()) {
      navigate(st.from, { replace: true });
      return;
    }

    if (typeof providerId === "number" && providerId > 0) {
      navigate(`/admin/shipping-providers/${providerId}/edit`, { replace: true });
      return;
    }

    navigate("/admin/shipping-providers", { replace: true });
  }, [location.state, navigate, providerId]);

  return { goTab, goFlowPage, onBack };
}
