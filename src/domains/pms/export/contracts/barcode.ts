// src/domains/pms/export/contracts/barcode.ts

export interface PmsExportBarcode {
  id: number;
  item_id: number;
  item_uom_id: number;

  barcode: string;
  symbology: string;

  active: boolean;
  is_primary: boolean;

  uom: string;
  display_name: string | null;
  uom_name: string;
  ratio_to_base: number;
}
