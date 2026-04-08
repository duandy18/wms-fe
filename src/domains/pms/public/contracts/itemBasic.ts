// src/domains/pms/public/contracts/itemBasic.ts

export interface ItemBasic {
  id: number;
  sku: string;
  name: string;
  spec: string | null;
  uom: string | null;
  enabled: boolean;

  // ⭐
  spec_family: string | null;

  // ✅ 品牌 / 分类（展示用）
  brand_name: string | null;
  category_name: string | null;

  /**
   * ✅ 主条码（展示冗余）
   * 终态合同：条码真相在 item_barcodes 子表。这里仅提供“主条码展示字段”。
   */
  main_barcode: string | null;
}
