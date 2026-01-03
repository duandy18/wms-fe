// src/features/admin/shipping-providers/hooks/useSchemesList.ts
import { useCallback, useMemo, useState } from "react";
import {
  fetchPricingSchemes,
  createPricingScheme,
  patchPricingScheme,
  type PricingScheme,
} from "../api";

type ApiErrorShape = { message?: string; detail?: string };

function getErrorMessage(err: unknown, fallback: string): string {
  const e = err as ApiErrorShape | undefined;
  return e?.message ?? e?.detail ?? fallback;
}

function countActive(list: PricingScheme[]): number {
  return (list ?? []).filter((s) => !!s.active).length;
}

export function useSchemesList() {
  const [schemes, setSchemes] = useState<PricingScheme[]>([]);
  const [loadingSchemes, setLoadingSchemes] = useState(false);
  const [schemesError, setSchemesError] = useState<string | null>(null);

  const [newSchemeName, setNewSchemeName] = useState("");
  const [newSchemeCurrency, setNewSchemeCurrency] = useState("CNY");
  const [newSchemeSaving, setNewSchemeSaving] = useState(false);

  const [fixingActive, setFixingActive] = useState(false);
  const [settingActive, setSettingActive] = useState(false);

  const hasMultiActive = useMemo(() => countActive(schemes) > 1, [schemes]);
  const hasAnyActive = useMemo(() => countActive(schemes) >= 1, [schemes]);

  const loadSchemes = useCallback(async (providerId: number) => {
    setLoadingSchemes(true);
    setSchemesError(null);
    try {
      const list = await fetchPricingSchemes(providerId);
      setSchemes(list);

      // 多启用只提示，不自动修（避免“偷偷改数据”）
      if (countActive(list) > 1) {
        setSchemesError("检测到多条收费标准处于“启用”状态：应当只保留 1 条启用。请点击“一键修复”。");
      }

      return list;
    } catch (err) {
      setSchemesError(getErrorMessage(err, "加载收费标准失败"));
      setSchemes([]);
      return [];
    } finally {
      setLoadingSchemes(false);
    }
  }, []);

  const fixMultiActive = useCallback(
    async (providerId: number) => {
      const actives = (schemes ?? []).filter((s) => !!s.active);
      if (actives.length <= 1) return true;

      // 保留“启用中 id 最大”的那条（调试阶段：最新）
      const winner = [...actives].sort((a, b) => b.id - a.id)[0]!;
      const losers = actives.filter((s) => s.id !== winner.id);

      setFixingActive(true);
      setSchemesError(null);
      try {
        for (const s of losers) {
          await patchPricingScheme(s.id, { active: false });
        }
        await patchPricingScheme(winner.id, { active: true });
        await loadSchemes(providerId);
        return true;
      } catch (err) {
        setSchemesError(getErrorMessage(err, "修复“多启用”失败"));
        return false;
      } finally {
        setFixingActive(false);
      }
    },
    [schemes, loadSchemes],
  );

  const setActiveScheme = useCallback(
    async (providerId: number, schemeId: number) => {
      if (settingActive) return false;

      setSettingActive(true);
      setSchemesError(null);
      try {
        // 先停用其它所有启用项
        const actives = (schemes ?? []).filter((s) => !!s.active && s.id !== schemeId);
        for (const s of actives) {
          await patchPricingScheme(s.id, { active: false });
        }

        // 再启用目标
        await patchPricingScheme(schemeId, { active: true });

        await loadSchemes(providerId);
        return true;
      } catch (err) {
        setSchemesError(getErrorMessage(err, "设为启用失败"));
        return false;
      } finally {
        setSettingActive(false);
      }
    },
    [schemes, loadSchemes, settingActive],
  );

  const handleCreateScheme = useCallback(
    async (selectedProviderId: number | null) => {
      if (!selectedProviderId) {
        setSchemesError("请先选择一个物流/快递公司");
        return false;
      }

      const n = newSchemeName.trim();
      if (!n) {
        setSchemesError("收费标准名称必填");
        return false;
      }

      setNewSchemeSaving(true);
      setSchemesError(null);
      try {
        // ✅ 单启用收敛：如果当前没有任何启用项，则新建为启用；否则新建为停用
        const active = !hasAnyActive;

        await createPricingScheme(selectedProviderId, {
          name: n,
          active,
          currency: (newSchemeCurrency || "CNY").trim() || "CNY",
        });

        setNewSchemeName("");
        await loadSchemes(selectedProviderId);
        return true;
      } catch (err) {
        setSchemesError(getErrorMessage(err, "新建收费标准失败"));
        return false;
      } finally {
        setNewSchemeSaving(false);
      }
    },
    [newSchemeName, newSchemeCurrency, loadSchemes, hasAnyActive],
  );

  return {
    schemes,
    setSchemes,
    loadingSchemes,
    schemesError,
    setSchemesError,

    newSchemeName,
    setNewSchemeName,
    newSchemeCurrency,
    setNewSchemeCurrency,
    newSchemeSaving,

    hasMultiActive,
    fixingActive,
    fixMultiActive,

    settingActive,
    setActiveScheme,

    loadSchemes,
    handleCreateScheme,
  };
}
