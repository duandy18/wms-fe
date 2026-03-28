// src/features/admin/stores/useStoreDetailPresenter.ts

import { useEffect, useState } from "react";
import { fetchStoreDetail } from "./api";
import type { StoreDetailData } from "./types";
import { useAuth } from "../../../shared/useAuth";

type ApiErrorShape = {
  message?: string;
};

export function useStoreDetailPresenter(storeId: number) {
  const id = storeId;

  // ✅ 合同：店铺管理属于配置域，写权限必须来自 /users/me permissions[]
  // 与 menuConfig.tsx 保持一致：店铺管理 requiredPermissions = ["config.store.write"]
  const { can } = useAuth();
  const canWrite = can("config.store.write");

  const [detail, setDetail] = useState<StoreDetailData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadDetail() {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const detailResp = await fetchStoreDetail(id);
      setDetail(detailResp.data);
    } catch (err: unknown) {
      console.error("loadDetail failed", err);
      const e = err as ApiErrorShape;
      setDetail(null);
      setError(e?.message ?? "加载失败");
    } finally {
      setLoading(false);
    }
  }

  async function reloadDetail() {
    await loadDetail();
  }

  useEffect(() => {
    if (!id) return;

    setDetail(null);
    setError(null);

    void reloadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return {
    id,
    canWrite,

    detail,
    loading,
    error,

    reloadDetail,
  };
}
