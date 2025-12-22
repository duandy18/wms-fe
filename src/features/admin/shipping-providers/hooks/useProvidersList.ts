// src/features/admin/shipping-providers/hooks/useProvidersList.ts
import { useCallback, useMemo, useState } from "react";
import {
  fetchShippingProviders,
  createShippingProvider,
  type ShippingProvider,
} from "../api";

type ApiErrorShape = { message?: string; detail?: string };

function getErrorMessage(err: unknown, fallback: string): string {
  const e = err as ApiErrorShape | undefined;
  return e?.message ?? e?.detail ?? fallback;
}

export function useProvidersList() {
  // Providers
  const [providers, setProviders] = useState<ShippingProvider[]>([]);
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

  const queryParams = useMemo(() => {
    return {
      active: onlyActive ? true : undefined,
      q: search.trim() || undefined,
    };
  }, [onlyActive, search]);

  const loadProviders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchShippingProviders(queryParams);
      setProviders(data);
      return data;
    } catch (err) {
      setError(getErrorMessage(err, "加载物流/快递公司失败"));
      setProviders([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

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
          active: true,
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

  return {
    providers,
    setProviders, // 给页面做“选择校验”时可用（不建议滥用，但保留）
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

    loadProviders,
    handleCreateProvider,
  };
}
