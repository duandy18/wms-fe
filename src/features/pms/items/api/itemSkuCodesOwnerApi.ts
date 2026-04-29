// src/features/pms/items/api/itemSkuCodesOwnerApi.ts
import { apiGet, apiPost } from "../../../../lib/api";

export type ItemSkuCodeType = "PRIMARY" | "ALIAS" | "LEGACY" | "MANUAL";

export type ItemSkuCode = {
  id: number;
  item_id: number;
  code: string;
  code_type: ItemSkuCodeType;
  is_primary: boolean;
  is_active: boolean;
  effective_from?: string | null;
  effective_to?: string | null;
  remark?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ItemSkuCodeCreateInput = {
  code: string;
  code_type: Exclude<ItemSkuCodeType, "PRIMARY">;
  is_active?: boolean;
  effective_from?: string | null;
  effective_to?: string | null;
  remark?: string | null;
};

export type ItemSkuCodeChangePrimaryInput = {
  code: string;
  remark?: string | null;
};

function normalizeSkuCode(code: string): string {
  return String(code ?? "").trim().toUpperCase();
}

export async function fetchItemSkuCodes(itemId: number): Promise<ItemSkuCode[]> {
  return apiGet<ItemSkuCode[]>(`/items/${itemId}/sku-codes`);
}

export async function createItemSkuCode(
  itemId: number,
  input: ItemSkuCodeCreateInput,
): Promise<ItemSkuCode> {
  const code = normalizeSkuCode(input.code);
  if (!code) throw new Error("SKU 编码不能为空");
  if (code.length > 128) throw new Error("SKU 编码不能超过 128 个字符");

  return apiPost<ItemSkuCode>(`/items/${itemId}/sku-codes`, {
    code,
    code_type: input.code_type,
    is_active: input.is_active ?? true,
    effective_from: input.effective_from ?? null,
    effective_to: input.effective_to ?? null,
    remark: input.remark?.trim() || null,
  });
}

export async function disableItemSkuCode(itemId: number, codeId: number): Promise<ItemSkuCode> {
  return apiPost<ItemSkuCode>(`/items/${itemId}/sku-codes/${codeId}/disable`, {});
}

export async function enableItemSkuCode(itemId: number, codeId: number): Promise<ItemSkuCode> {
  return apiPost<ItemSkuCode>(`/items/${itemId}/sku-codes/${codeId}/enable`, {});
}

export async function changePrimaryItemSkuCode(
  itemId: number,
  input: ItemSkuCodeChangePrimaryInput,
): Promise<ItemSkuCode> {
  const code = normalizeSkuCode(input.code);
  if (!code) throw new Error("新主 SKU 不能为空");
  if (code.length > 128) throw new Error("新主 SKU 不能超过 128 个字符");

  return apiPost<ItemSkuCode>(`/items/${itemId}/sku-codes/change-primary`, {
    code,
    remark: input.remark?.trim() || null,
  });
}
