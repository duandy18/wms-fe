// src/domains/partners/export/suppliersClient.ts
import { apiGet } from "../../../lib/api";
import type { SupplierBasic } from "./contracts/supplierBasic";

type PublicSupplierApiRow = {
  id: number;
  name?: string | null;
  code?: string | null;
  active?: boolean;
};

export async function fetchSuppliersBasic(params?: {
  active?: boolean;
  q?: string;
}): Promise<SupplierBasic[]> {
  const qs = new URLSearchParams();

  if (params?.active !== undefined) {
    qs.set("active", String(params.active));
  }
  if (params?.q && params.q.trim()) {
    qs.set("q", params.q.trim());
  }

  const path = qs.toString()
    ? `/partners/export/suppliers?${qs.toString()}`
    : "/partners/export/suppliers";

  const raw = await apiGet<unknown>(path);
  if (!Array.isArray(raw)) return [];

  return raw.map((row) => {
    const it = row as PublicSupplierApiRow;

    return {
      id: Number(it.id),
      name: String(it.name ?? ""),
      code: typeof it.code === "string" ? it.code : null,
      active: typeof it.active === "boolean" ? it.active : true,
    };
  });
}
