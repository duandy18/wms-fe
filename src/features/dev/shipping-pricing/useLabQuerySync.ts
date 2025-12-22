// src/features/dev/shipping-pricing/useLabQuerySync.ts
//
// 只认标准 query keys（Phase 4 收敛）：
// - scheme_id
// - province / city / district
// - real_weight_kg
// - flags
// - length_cm / width_cm / height_cm
//
// ❌ 不再兼容旧键：w / l / w_cm / h

import { useEffect, useRef } from "react";

type Setters = {
  setSchemeIdText: (v: string) => void;
  setProvince: (v: string) => void;
  setCity: (v: string) => void;
  setDistrict: (v: string) => void;
  setRealWeightKg: (v: string) => void;
  setFlags: (v: string) => void;
  setLengthCm: (v: string) => void;
  setWidthCm: (v: string) => void;
  setHeightCm: (v: string) => void;
};

function pick(qs: URLSearchParams, key: string): string | null {
  const v = qs.get(key);
  if (!v) return null;
  const t = v.trim();
  return t ? t : null;
}

export function useLabQuerySync(setters: Setters) {
  const once = useRef(false);

  useEffect(() => {
    if (once.current) return;
    once.current = true;

    const qs = new URLSearchParams(window.location.search);

    const schemeId = pick(qs, "scheme_id");
    const province = pick(qs, "province");
    const city = pick(qs, "city");
    const district = pick(qs, "district");

    const realWeightKg = pick(qs, "real_weight_kg");
    const flags = pick(qs, "flags");

    const lengthCm = pick(qs, "length_cm");
    const widthCm = pick(qs, "width_cm");
    const heightCm = pick(qs, "height_cm");

    if (schemeId) setters.setSchemeIdText(schemeId);
    if (province) setters.setProvince(province);
    if (city) setters.setCity(city);
    if (district) setters.setDistrict(district);

    if (realWeightKg) setters.setRealWeightKg(realWeightKg);
    if (flags) setters.setFlags(flags);

    if (lengthCm) setters.setLengthCm(lengthCm);
    if (widthCm) setters.setWidthCm(widthCm);
    if (heightCm) setters.setHeightCm(heightCm);
  }, [setters]);
}
