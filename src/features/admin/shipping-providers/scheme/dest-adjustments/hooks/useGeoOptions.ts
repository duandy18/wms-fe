// src/features/admin/shipping-providers/scheme/dest-adjustments/hooks/useGeoOptions.ts
import { useEffect, useMemo, useState } from "react";
import type { GeoItem } from "../../../api/geo";
import { fetchGeoCities, fetchGeoProvinces } from "../../../api/geo";

export type GeoOptionsState = {
  provinces: GeoItem[];
  cities: GeoItem[];
  geoLoading: boolean;
  provinceName: string | null;
  cityName: string | null;
};

export function useGeoOptions(params: { provinceCode: string; cityCode: string; onError: (msg: string) => void }) {
  const { provinceCode, cityCode, onError } = params;

  const [provinces, setProvinces] = useState<GeoItem[]>([]);
  const [cities, setCities] = useState<GeoItem[]>([]);
  const [geoLoading, setGeoLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setGeoLoading(true);
      try {
        const arr = await fetchGeoProvinces();
        if (!mounted) return;
        setProvinces(Array.isArray(arr) ? arr : []);
      } catch (e) {
        if (!mounted) return;
        onError(e instanceof Error ? e.message : "加载省份字典失败");
      } finally {
        if (mounted) setGeoLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [onError]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!provinceCode) {
        setCities([]);
        return;
      }
      setGeoLoading(true);
      try {
        const arr = await fetchGeoCities(provinceCode);
        if (!mounted) return;
        setCities(Array.isArray(arr) ? arr : []);
      } catch (e) {
        if (!mounted) return;
        onError(e instanceof Error ? e.message : "加载城市字典失败");
        setCities([]);
      } finally {
        if (mounted) setGeoLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [provinceCode, onError]);

  const provinceName = useMemo(() => provinces.find((x) => x.code === provinceCode)?.name ?? null, [provinces, provinceCode]);
  const cityName = useMemo(() => cities.find((x) => x.code === cityCode)?.name ?? null, [cities, cityCode]);

  const state: GeoOptionsState = { provinces, cities, geoLoading, provinceName, cityName };
  return state;
}
