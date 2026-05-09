// src/domains/pms/export/contracts/uom.ts

export interface PmsExportUom {
  id: number;
  item_id: number;

  uom: string;
  display_name: string | null;
  uom_name: string;

  ratio_to_base: number;
  net_weight_kg: number | null;

  is_base: boolean;
  is_purchase_default: boolean;
  is_inbound_default: boolean;
  is_outbound_default: boolean;
}
