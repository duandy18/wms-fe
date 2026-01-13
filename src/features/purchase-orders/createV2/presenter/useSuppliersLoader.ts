// src/features/purchase-orders/createV2/presenter/useSuppliersLoader.ts

import { useEffect, useState } from "react";
import { fetchSuppliersBasic, type SupplierBasic } from "../../../../master-data/suppliersApi";
import { getErrorMessage } from "../utils";
import { normalizeSupplierOptions } from "../normalize";

export function useSuppliersLoader(): {
  supplierOptions: SupplierBasic[];
  suppliersLoading: boolean;
  suppliersError: string | null;
} {
  const [supplierOptions, setSupplierOptions] = useState<SupplierBasic[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [suppliersError, setSuppliersError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      setSuppliersLoading(true);
      setSuppliersError(null);

      try {
        const data = await fetchSuppliersBasic();
        if (alive) {
          setSupplierOptions(normalizeSupplierOptions(data, { activeOnly: true }));
        }
      } catch (err) {
         
        console.error("fetchSuppliersBasic failed", err);
        if (alive) setSuppliersError(getErrorMessage(err, "加载供应商列表失败"));
      }

      if (alive) setSuppliersLoading(false);
    }

    void load();
    return () => {
      alive = false;
    };
  }, []);

  return { supplierOptions, suppliersLoading, suppliersError };
}
