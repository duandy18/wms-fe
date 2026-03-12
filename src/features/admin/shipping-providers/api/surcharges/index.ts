// src/features/admin/shipping-providers/api/surcharges/index.ts
import { apiDelete, apiPatch, apiPost } from "../../../../../lib/api";
import type {
  PricingSchemeSurchargeConfig,
  PricingSchemeSurchargeConfigCity,
} from "../../api/types";

export type SurchargeConfigCityWritePayload = {
  city_code: string;
  city_name?: string | null;
  fixed_amount: number;
  active?: boolean;
};

export type SurchargeConfigCreatePayload = {
  province_code: string;
  province_name?: string | null;
  province_mode: "province" | "cities";
  fixed_amount: number;
  active?: boolean;
  cities?: SurchargeConfigCityWritePayload[];
};

export type SurchargeConfigUpdatePayload = Partial<{
  province_code: string;
  province_name: string | null;
  province_mode: "province" | "cities";
  fixed_amount: number;
  active: boolean;
  cities: SurchargeConfigCityWritePayload[];
}>;

export type SurchargeBatchProvinceItemPayload = {
  province_code: string;
  province_name?: string | null;
  fixed_amount: number;
  active?: boolean;
};

export type SurchargeBatchProvinceCreatePayload = {
  items: SurchargeBatchProvinceItemPayload[];
};

export type SurchargeBatchProvinceSkipped = {
  province_code: string;
  province_name?: string | null;
  reason: "already_exists" | "duplicate_in_payload";
};

export type SurchargeBatchProvinceCreateResult = {
  created: PricingSchemeSurchargeConfig[];
  skipped: SurchargeBatchProvinceSkipped[];
};

export type SurchargeCityContainerCreatePayload = {
  province_code: string;
  province_name?: string | null;
  active?: boolean;
};

function normalizeCityPayload(
  payload: SurchargeConfigCityWritePayload,
): SurchargeConfigCityWritePayload {
  return {
    city_code: String(payload.city_code || "").trim(),
    city_name: payload.city_name == null ? null : String(payload.city_name).trim() || null,
    fixed_amount: Number(payload.fixed_amount),
    active: typeof payload.active === "boolean" ? payload.active : true,
  };
}

function normalizeCreatePayload(
  payload: SurchargeConfigCreatePayload,
): SurchargeConfigCreatePayload {
  return {
    province_code: String(payload.province_code || "").trim(),
    province_name: payload.province_name == null ? null : String(payload.province_name).trim() || null,
    province_mode: payload.province_mode,
    fixed_amount: Number(payload.fixed_amount),
    active: typeof payload.active === "boolean" ? payload.active : true,
    cities: Array.isArray(payload.cities) ? payload.cities.map(normalizeCityPayload) : [],
  };
}

function normalizeUpdatePayload(
  payload: SurchargeConfigUpdatePayload,
): SurchargeConfigUpdatePayload {
  const next: SurchargeConfigUpdatePayload = { ...payload };

  if ("province_code" in next && next.province_code !== undefined) {
    next.province_code = String(next.province_code || "").trim();
  }

  if ("province_name" in next) {
    next.province_name =
      next.province_name == null ? null : String(next.province_name).trim() || null;
  }

  if ("fixed_amount" in next && next.fixed_amount !== undefined) {
    next.fixed_amount = Number(next.fixed_amount);
  }

  if ("cities" in next && Array.isArray(next.cities)) {
    next.cities = next.cities.map(normalizeCityPayload);
  }

  return next;
}

function normalizeBatchProvincePayload(
  payload: SurchargeBatchProvinceCreatePayload,
): SurchargeBatchProvinceCreatePayload {
  return {
    items: Array.isArray(payload.items)
      ? payload.items.map((item) => ({
          province_code: String(item.province_code || "").trim(),
          province_name:
            item.province_name == null ? null : String(item.province_name).trim() || null,
          fixed_amount: Number(item.fixed_amount),
          active: typeof item.active === "boolean" ? item.active : true,
        }))
      : [],
  };
}

function normalizeCityContainerPayload(
  payload: SurchargeCityContainerCreatePayload,
): SurchargeCityContainerCreatePayload {
  return {
    province_code: String(payload.province_code || "").trim(),
    province_name: payload.province_name == null ? null : String(payload.province_name).trim() || null,
    active: typeof payload.active === "boolean" ? payload.active : true,
  };
}

export async function createSurchargeConfig(
  schemeId: number,
  payload: SurchargeConfigCreatePayload,
): Promise<PricingSchemeSurchargeConfig> {
  return apiPost<PricingSchemeSurchargeConfig>(
    `/pricing-schemes/${schemeId}/surcharge-configs`,
    normalizeCreatePayload(payload),
  );
}

export async function batchCreateProvinceSurchargeConfigs(
  schemeId: number,
  payload: SurchargeBatchProvinceCreatePayload,
): Promise<SurchargeBatchProvinceCreateResult> {
  return apiPost<SurchargeBatchProvinceCreateResult>(
    `/pricing-schemes/${schemeId}/surcharge-configs/batch-province`,
    normalizeBatchProvincePayload(payload),
  );
}

export async function createSurchargeCityContainer(
  schemeId: number,
  payload: SurchargeCityContainerCreatePayload,
): Promise<PricingSchemeSurchargeConfig> {
  return apiPost<PricingSchemeSurchargeConfig>(
    `/pricing-schemes/${schemeId}/surcharge-configs/city-container`,
    normalizeCityContainerPayload(payload),
  );
}

export async function patchSurchargeConfig(
  configId: number,
  payload: SurchargeConfigUpdatePayload,
): Promise<PricingSchemeSurchargeConfig> {
  return apiPatch<PricingSchemeSurchargeConfig>(
    `/surcharge-configs/${configId}`,
    normalizeUpdatePayload(payload),
  );
}

export async function deleteSurchargeConfig(configId: number): Promise<{ ok: boolean }> {
  return apiDelete<{ ok: boolean }>(`/surcharge-configs/${configId}`);
}

export type {
  PricingSchemeSurchargeConfig,
  PricingSchemeSurchargeConfigCity,
};
