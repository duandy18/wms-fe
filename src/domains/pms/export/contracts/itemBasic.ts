// src/domains/pms/export/contracts/itemBasic.ts

export interface ItemBasic {
  id: number;
  sku: string;
  name: string;
  spec: string | null;
  enabled: boolean;

  supplier_id: number | null;
  brand: string | null;
  category: string | null;
}
