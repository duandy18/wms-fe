// src/features/tms/providers/hooks/useProvidersList.ts
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

  // ✅ 前端视图层过滤：
  // - onlyActive 与 search 可同时生效
  // - 列表页始终拉全量，再做本地过滤
  const providers = useMemo(() => {
    const q = search.trim().toLowerCase();

    return allProviders.filter((p) => {
      if (onlyActive && !p.active) {
        return false;
      }

      if (!q) {
        return true;
      }

      const nameHit = (p.name ?? "").toLowerCase().includes(q);
      const codeHit = (p.code ?? "").toLowerCase().includes(q);
      const addressHit = (p.address ?? "").toLowerCase().includes(q);
      const contactHit = (p.contacts ?? []).some((c) => {
        const cn = (c.name ?? "").toLowerCase();
        const cp = (c.phone ?? "").toLowerCase();
        return cn.includes(q) || cp.includes(q);
      });

      return nameHit || codeHit || addressHit || contactHit;
    });
  }, [allProviders, onlyActive, search]);

  // ✅ 永远拉全量，列表页不把过滤语义压给后端
  const loadProviders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchShippingProviders();
      setAllProviders(data);
      return data;
    } catch (err) {
      setError(getErrorMessage(err, "加载快递网点失败"));
      setAllProviders([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreateProvider = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setCreateError(null);

      const n = name.trim();
      if (!n) {
        setCreateError("网点名称必填");
        return false;
      }

      const codeTrimmed = code.trim();
      if (!codeTrimmed) {
        setCreateError("网点编号必填");
        return false;
      }

      setCreating(true);
      try {
        await createShippingProvider({
          name: n,
          code: codeTrimmed,
          active: true,
          priority: 100,
        });
        setName("");
        setCode("");
        await loadProviders();
        return true;
      } catch (err) {
        setCreateError(getErrorMessage(err, "创建快递网点失败"));
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
    providers,
    setProviders: setAllProviders,
    loading,
    error,

    onlyActive,
    setOnlyActive,
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
