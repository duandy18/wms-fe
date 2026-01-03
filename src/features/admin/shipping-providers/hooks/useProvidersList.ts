// src/features/admin/shipping-providers/hooks/useProvidersList.ts
import { useCallback, useMemo, useState } from "react";
import {
  fetchShippingProviders,
  createShippingProvider,
  updateShippingProvider,
  type ShippingProvider,
} from "../api";

type ApiErrorShape = { message?: string; detail?: string };

function getErrorMessage(err: unknown, fallback: string): string {
  const e = err as ApiErrorShape | undefined;
  return e?.message ?? e?.detail ?? fallback;
}

export function useProvidersList() {
  // Raw providers (unfiltered)
  const [allProviders, setAllProviders] = useState<ShippingProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter
  const [onlyActive, setOnlyActive] = useState(true);
  const [search, setSearch] = useState("");

  // Create provider
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Toggle active
  const [toggling, setToggling] = useState(false);

  // ✅ 前端视图层过滤：onlyActive 为真时立即生效（不需要 reload）
  const providers = useMemo(() => {
    const base = onlyActive ? allProviders.filter((p) => !!p.active) : allProviders;

    // 你要求 onlyActive=true 时搜索框无用，这里也就不做搜索过滤了
    const q = search.trim();
    if (!q || onlyActive) return base;

    const qq = q.toLowerCase();
    return base.filter((p) => {
      const nameHit = (p.name ?? "").toLowerCase().includes(qq);
      const codeHit = (p.code ?? "").toLowerCase().includes(qq);
      const contactHit = (p.contacts ?? []).some((c) => {
        const cn = (c.name ?? "").toLowerCase();
        const cp = (c.phone ?? "").toLowerCase();
        return cn.includes(qq) || cp.includes(qq);
      });
      return nameHit || codeHit || contactHit;
    });
  }, [allProviders, onlyActive, search]);

  // ✅ 永远拉全量（不传 active），避免后端默认只返回启用导致“勾选/不勾选一样”
  const loadProviders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = onlyActive ? undefined : search.trim() || undefined;
      const data = await fetchShippingProviders({ q }); // active 不传
      setAllProviders(data);
      return data;
    } catch (err) {
      setError(getErrorMessage(err, "加载物流/快递公司失败"));
      setAllProviders([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [onlyActive, search]);

  // ✅ onlyActive=true 时，搜索框无用 → 自动清空搜索词
  const setOnlyActiveSmart = useCallback((v: boolean) => {
    setOnlyActive(v);
    if (v) setSearch("");
  }, []);

  const handleCreateProvider = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setCreateError(null);

      const n = name.trim();
      if (!n) {
        setCreateError("公司名称必填");
        return false;
      }

      setCreating(true);
      try {
        await createShippingProvider({
          name: n,
          code: code.trim() || undefined,
          active: true, // ✅ 新建默认启用
          priority: 100,
        });
        setName("");
        setCode("");
        await loadProviders();
        return true;
      } catch (err) {
        setCreateError(getErrorMessage(err, "创建物流/快递公司失败"));
        return false;
      } finally {
        setCreating(false);
      }
    },
    [name, code, loadProviders],
  );

  const toggleProviderActive = useCallback(
    async (p: ShippingProvider) => {
      if (toggling) return false;

      if (p.active) {
        const ok = window.confirm(`确认停用「${p.name}」吗？停用后将不参与推荐与算价。`);
        if (!ok) return false;
      }

      setToggling(true);
      setError(null);
      try {
        await updateShippingProvider(p.id, { active: !p.active });
        await loadProviders();
        return true;
      } catch (err) {
        setError(getErrorMessage(err, "切换启用/停用失败"));
        return false;
      } finally {
        setToggling(false);
      }
    },
    [loadProviders, toggling],
  );

  return {
    providers, // ✅ 视图层 providers
    setProviders: setAllProviders, // 保持旧字段名，避免页面改动过大（不建议滥用）
    loading,
    error,

    onlyActive,
    setOnlyActive: setOnlyActiveSmart,
    search,
    setSearch,

    name,
    setName,
    code,
    setCode,
    creating,
    createError,

    toggling,

    loadProviders,
    handleCreateProvider,
    toggleProviderActive,
  };
}
