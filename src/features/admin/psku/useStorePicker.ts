// src/features/admin/psku/useStorePicker.ts

import { useEffect, useMemo, useState } from "react";
import { fetchPlatformOptions, fetchStoresForPicker, type PlatformCode, type PlatformOption, type StorePickerOption } from "./api";

export function useStorePicker() {
  const [platformOptions, setPlatformOptions] = useState<PlatformOption[]>([]);
  const [platformLoading, setPlatformLoading] = useState<boolean>(false);
  const [platformErr, setPlatformErr] = useState<string>("");

  const [platform, setPlatform] = useState<PlatformCode>(""); // ✅ 由后端平台枚举决定默认值
  const [storeQ, setStoreQ] = useState<string>("");

  const [storeOptions, setStoreOptions] = useState<StorePickerOption[]>([]);
  const [storeLoading, setStoreLoading] = useState<boolean>(false);
  const [storeErr, setStoreErr] = useState<string>("");

  const [storeId, setStoreId] = useState<number | null>(null);

  // 拉平台枚举（事实）
  useEffect(() => {
    let alive = true;
    setPlatformLoading(true);
    setPlatformErr("");

    fetchPlatformOptions()
      .then((opts) => {
        if (!alive) return;
        setPlatformOptions(opts);

        // ✅ 仅在当前 platform 为空/不合法时自动选择默认平台
        const set = new Set(opts.map((x) => x.platform));
        const cur = (platform || "").trim().toUpperCase();
        if (!cur || !set.has(cur)) {
          const fallback = opts[0]?.platform ?? "";
          setPlatform(fallback);
        }
      })
      .catch((e: unknown) => {
        if (!alive) return;
        setPlatformOptions([]);
        setPlatformErr(e instanceof Error ? e.message : "加载平台失败");
      })
      .finally(() => {
        if (!alive) return;
        setPlatformLoading(false);
      });

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 平台切换：清理 store 选择（避免跨平台串台）
  useEffect(() => {
    setStoreId(null);
  }, [platform]);

  // 拉店铺列表（依赖平台事实）
  useEffect(() => {
    if (!platform) {
      setStoreOptions([]);
      setStoreLoading(false);
      setStoreErr("");
      return;
    }

    let alive = true;
    setStoreLoading(true);
    setStoreErr("");

    fetchStoresForPicker({
      platform,
      q: storeQ.trim() ? storeQ.trim() : null,
      limit: 200,
      offset: 0,
    })
      .then((opts) => {
        if (!alive) return;
        setStoreOptions(opts);
      })
      .catch((e: unknown) => {
        if (!alive) return;
        setStoreOptions([]);
        setStoreErr(e instanceof Error ? e.message : "加载店铺失败");
      })
      .finally(() => {
        if (!alive) return;
        setStoreLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [platform, storeQ]);

  const storeLabel = useMemo(() => {
    const hit = storeId == null ? null : storeOptions.find((o) => o.id === storeId) ?? null;
    return hit?.label ?? "";
  }, [storeId, storeOptions]);

  return {
    platformOptions,
    platformLoading,
    platformErr,

    platform,
    setPlatform,

    storeQ,
    setStoreQ,

    storeOptions,
    storeLoading,
    storeErr,

    storeId,
    setStoreId,

    storeLabel,
  };
}
