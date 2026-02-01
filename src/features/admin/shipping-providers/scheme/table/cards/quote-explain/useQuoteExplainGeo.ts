// src/features/admin/shipping-providers/scheme/table/cards/quote-explain/useQuoteExplainGeo.ts

import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../../../../../../../lib/api";
import type { GeoItem } from "../../../preview/QuotePreviewForm";
import { isMunicipalityProvinceCode, municipalityCityCodeFromProvinceCode } from "./geo";

function toHumanError(e: unknown, fallback: string): string {
  if (!e) return fallback;
  if (typeof e === "string") return e;
  if (e instanceof Error && e.message) return e.message;
  const r = e as Record<string, unknown>;
  if (typeof r?.message === "string") return r.message;
  return fallback;
}

export function useQuoteExplainGeo(args: { onError: (msg: string) => void }) {
  const { onError } = args;

  const [geoLoading, setGeoLoading] = useState(false);
  const [provinces, setProvinces] = useState<GeoItem[]>([]);
  const [cities, setCities] = useState<GeoItem[]>([]);
  const [provinceCode, setProvinceCode] = useState<string>("");
  const [cityCode, setCityCode] = useState<string>("");

  const provinceName = useMemo(() => {
    const hit = provinces.find((x) => x.code === provinceCode);
    return hit?.name ?? "";
  }, [provinces, provinceCode]);

  const cityName = useMemo(() => {
    const hit = cities.find((x) => x.code === cityCode);
    return hit?.name ?? "";
  }, [cities, cityCode]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setGeoLoading(true);
      try {
        const list = await apiGet<GeoItem[]>("/geo/provinces");
        if (cancelled) return;
        setProvinces(Array.isArray(list) ? list : []);
      } catch (e) {
        if (!cancelled) onError(toHumanError(e, "加载省份失败"));
      } finally {
        if (!cancelled) setGeoLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [onError]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!provinceCode) {
        setCities([]);
        setCityCode("");
        return;
      }

      // ✅ 直辖市：city 是“事实确认”，不是选择题
      if (isMunicipalityProvinceCode(provinceCode)) {
        const cc = municipalityCityCodeFromProvinceCode(provinceCode);
        const label = provinceName || "直辖市";
        setCities(cc ? [{ code: cc, name: label }] : []);
        setCityCode(cc);
        return;
      }

      setGeoLoading(true);
      try {
        const list = await apiGet<GeoItem[]>(`/geo/provinces/${provinceCode}/cities`);
        if (cancelled) return;
        setCities(Array.isArray(list) ? list : []);
        setCityCode(""); // 切省必清市（普通省份）
      } catch (e) {
        if (!cancelled) onError(toHumanError(e, "加载城市失败"));
      } finally {
        if (!cancelled) setGeoLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [provinceCode, provinceName, onError]);

  function onChangeProvinceCode(v: string) {
    setProvinceCode(v);
    // ✅ 普通省份切省要清 city；直辖市会在 effect 里自动填充唯一 city
    setCityCode("");
  }

  return {
    geoLoading,
    provinces,
    cities,
    provinceCode,
    cityCode,
    provinceName,
    cityName,
    setCityCode,
    onChangeProvinceCode,
  };
}
