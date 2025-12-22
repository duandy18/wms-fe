// src/features/admin/shipping-providers/hooks/useSchemesList.ts
import { useCallback, useState } from "react";
import {
  fetchPricingSchemes,
  createPricingScheme,
  type PricingScheme,
} from "../api";

type ApiErrorShape = { message?: string; detail?: string };

function getErrorMessage(err: unknown, fallback: string): string {
  const e = err as ApiErrorShape | undefined;
  return e?.message ?? e?.detail ?? fallback;
}

export function useSchemesList() {
  const [schemes, setSchemes] = useState<PricingScheme[]>([]);
  const [loadingSchemes, setLoadingSchemes] = useState(false);
  const [schemesError, setSchemesError] = useState<string | null>(null);

  const [newSchemeName, setNewSchemeName] = useState("");
  const [newSchemePriority, setNewSchemePriority] = useState("100");
  const [newSchemeCurrency, setNewSchemeCurrency] = useState("CNY");
  const [newSchemeSaving, setNewSchemeSaving] = useState(false);

  const loadSchemes = useCallback(async (providerId: number) => {
    setLoadingSchemes(true);
    setSchemesError(null);
    try {
      const list = await fetchPricingSchemes(providerId);
      setSchemes(list);
      return list;
    } catch (err) {
      setSchemesError(getErrorMessage(err, "加载 Pricing Schemes 失败"));
      setSchemes([]);
      return [];
    } finally {
      setLoadingSchemes(false);
    }
  }, []);

  const handleCreateScheme = useCallback(
    async (selectedProviderId: number | null) => {
      if (!selectedProviderId) {
        setSchemesError("请先选择一个 Provider");
        return false;
      }

      const n = newSchemeName.trim();
      if (!n) {
        setSchemesError("方案名称必填");
        return false;
      }

      const pr = Number(newSchemePriority);
      if (!Number.isFinite(pr) || pr < 0) {
        setSchemesError("方案优先级必须是 >=0 的数字");
        return false;
      }

      setNewSchemeSaving(true);
      setSchemesError(null);
      try {
        await createPricingScheme(selectedProviderId, {
          name: n,
          active: true,
          priority: pr,
          currency: (newSchemeCurrency || "CNY").trim() || "CNY",
        });
        setNewSchemeName("");
        setNewSchemePriority("100");
        await loadSchemes(selectedProviderId);
        return true;
      } catch (err) {
        setSchemesError(getErrorMessage(err, "新建 Scheme 失败"));
        return false;
      } finally {
        setNewSchemeSaving(false);
      }
    },
    [newSchemeName, newSchemePriority, newSchemeCurrency, loadSchemes],
  );

  return {
    schemes,
    setSchemes,
    loadingSchemes,
    schemesError,
    setSchemesError,

    newSchemeName,
    setNewSchemeName,
    newSchemePriority,
    setNewSchemePriority,
    newSchemeCurrency,
    setNewSchemeCurrency,
    newSchemeSaving,

    loadSchemes,
    handleCreateScheme,
  };
}
