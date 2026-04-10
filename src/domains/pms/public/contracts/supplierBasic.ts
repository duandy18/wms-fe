// src/domains/pms/public/contracts/supplierBasic.ts

export interface SupplierBasic {
  id: number;
  name: string;
  code: string | null;
  active: boolean;
}
