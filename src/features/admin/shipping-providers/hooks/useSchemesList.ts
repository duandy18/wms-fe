// src/features/admin/shipping-providers/hooks/useSchemesList.ts

import { useCallback, useState } from "react";
import {
  fetchPricingSchemes,
  createPricingScheme,
  patchPricingScheme,
  type PricingScheme,
} from "../api";
import type { SchemeDefaultPricingMode } from "../api/types";

type ApiErrorShape = { message?: string; detail?: string };

function getErrorMessage(err: unknown, fallback: string): string {
  const e = err as ApiErrorShape | undefined;
  return e?.message ?? e?.detail ?? fallback;
}

function todayYmd(): string {
  // YYYY-MM-DD
  return new Date().toISOString().slice(0, 10);
}

function defaultSchemeNameByDate(ymd: string): string {
  const ym = ymd.slice(0, 7);
  return `${ym} 运费表`;
}

function parseYmdToTs(ymd?: string | null): number {
  if (!ymd) return 0;
  // 允许 "YYYY-MM-DD" 或更长（后端可能带时间）
  const s = ymd.slice(0, 10);
  const ts = Date.parse(s);
  return Number.isFinite(ts) ? ts : 0;
}

function pickWinner(activeSchemes: PricingScheme[]): PricingScheme {
  // 规则：effective_from 最新优先；若相同/缺失，则 id 最大优先
  return activeSchemes.reduce((best, cur) => {
    const bt = parseYmdToTs(best.effective_from);
    const ct = parseYmdToTs(cur.effective_from);
    if (ct !== bt) return ct > bt ? cur : best;
    return cur.id > best.id ? cur : best;
  }, activeSchemes[0]);
}

export function useSchemesList() {
  const [schemes, setSchemes] = useState<PricingScheme[]>([]);
  const [loadingSchemes, setLoadingSchemes] = useState(false);
  const [schemesError, setSchemesError] = useState<string | null>(null);

  // ✅ 当前选中的方案（“进入工作台”的真实语义）
  const [selectedSchemeId, setSelectedSchemeId] = useState<number | null>(null);

  // 名称：可选（用于区分/对账，不影响算价）
  const [newSchemeName, setNewSchemeName] = useState("");
  const [newSchemePriority, setNewSchemePriority] = useState("100");
  const [newSchemeCurrency, setNewSchemeCurrency] = useState("CNY");

  // 默认口径：UI 已不展示，但系统仍保留默认
  const [newSchemeDefaultMode, setNewSchemeDefaultMode] =
    useState<SchemeDefaultPricingMode>("linear_total");

  const [newSchemeSaving, setNewSchemeSaving] = useState(false);

  const enforceSingleActive = useCallback(
    async (providerId: number, list: PricingScheme[]) => {
      const actives = list.filter((s) => s.active);
      if (actives.length <= 1) return list;

      const winner = pickWinner(actives);
      const losers = actives.filter((s) => s.id !== winner.id);

      // 前端止血：把其它 active 全部停用
      await Promise.all(losers.map((s) => patchPricingScheme(s.id, { active: false })));

      // 再拉一次，确保 UI 拿到后端真相
      const normalized = await fetchPricingSchemes(providerId);
      return normalized;
    },
    [],
  );

  const loadSchemes = useCallback(
    async (providerId: number) => {
      setLoadingSchemes(true);
      setSchemesError(null);
      try {
        const list = await fetchPricingSchemes(providerId);

        // ✅ 核心：加载时强制收敛“单一启用”
        const normalized = await enforceSingleActive(providerId, list);
        setSchemes(normalized);

        // 如果当前选中的方案已不存在，清空选中态
        if (selectedSchemeId && !normalized.some((s) => s.id === selectedSchemeId)) {
          setSelectedSchemeId(null);
        }

        return normalized;
      } catch (err) {
        setSchemesError(getErrorMessage(err, "加载运费表失败"));
        setSchemes([]);
        setSelectedSchemeId(null);
        return [];
      } finally {
        setLoadingSchemes(false);
      }
    },
    [enforceSingleActive, selectedSchemeId],
  );

  // ✅ 明确的“进入工作台”语义：选中方案
  const selectScheme = useCallback((schemeId: number) => {
    setSelectedSchemeId(schemeId);
  }, []);

  const selectedScheme = schemes.find((s) => s.id === selectedSchemeId) ?? null;

  const handleCreateScheme = useCallback(
    async (selectedProviderId: number | null) => {
      if (!selectedProviderId) {
        setSchemesError("请先选择一个公司");
        return false;
      }

      const pr = Number(newSchemePriority);
      if (!Number.isFinite(pr) || pr < 0) {
        setSchemesError("优先级必须是 >=0 的数字");
        return false;
      }

      setNewSchemeSaving(true);
      setSchemesError(null);
      try {
        const ymd = todayYmd();

        const n = newSchemeName.trim();
        const finalName = n ? n : defaultSchemeNameByDate(ymd);

        const created = await createPricingScheme(selectedProviderId, {
          name: finalName,
          active: true,
          priority: pr,
          currency: (newSchemeCurrency || "CNY").trim() || "CNY",
          default_pricing_mode: newSchemeDefaultMode,

          // ✅ 生效日期：让版本可区分
          effective_from: ymd,
          effective_to: null,
        });

        setNewSchemeName("");
        setNewSchemePriority("100");
        setNewSchemeDefaultMode("linear_total");

        // ✅ 创建后也执行一次“单一启用”收敛（防并发/历史脏数据）
        const list = await loadSchemes(selectedProviderId);

        // ✅ 自动选中新建方案
        const hit = list.find((s) => s.id === created.id);
        if (hit) setSelectedSchemeId(hit.id);

        return true;
      } catch (err) {
        setSchemesError(getErrorMessage(err, "录入运费表失败"));
        return false;
      } finally {
        setNewSchemeSaving(false);
      }
    },
    [
      newSchemeName,
      newSchemePriority,
      newSchemeCurrency,
      newSchemeDefaultMode,
      loadSchemes,
    ],
  );

  return {
    schemes,
    setSchemes,
    loadingSchemes,
    schemesError,
    setSchemesError,

    // ✅ 选中方案相关
    selectedSchemeId,
    selectedScheme,
    selectScheme,

    newSchemeName,
    setNewSchemeName,
    newSchemePriority,
    setNewSchemePriority,
    newSchemeCurrency,
    setNewSchemeCurrency,

    newSchemeDefaultMode,
    setNewSchemeDefaultMode,

    newSchemeSaving,

    loadSchemes,
    handleCreateScheme,
  };
}
