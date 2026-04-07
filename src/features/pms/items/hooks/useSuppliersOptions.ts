// src/features/pms/items/hooks/useSuppliersOptions.ts

import { useCallback, useState } from "react";
import { fetchSuppliers, type Supplier } from "@/features/pms/suppliers/api/suppliersApi";
import { errMsg } from "../utils/itemsHelpers";

export function useSuppliersOptions() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supLoading, setSupLoading] = useState(false);
  const [supError, setSupError] = useState<string | null>(null);

  const ensureSuppliers = useCallback(async () => {
    if (suppliers.length || supLoading) return;
    setSupLoading(true);
    setSupError(null);
    try {
      const list = await fetchSuppliers({ active: true });
      setSuppliers(list);
    } catch (e: unknown) {
      setSupError(errMsg(e, "加载供货商失败"));
      setSuppliers([]);
    } finally {
      setSupLoading(false);
    }
  }, [suppliers.length, supLoading]);

  const resetSuppliersError = useCallback(() => setSupError(null), []);

  return {
    suppliers,
    supLoading,
    supError,
    ensureSuppliers,
    resetSuppliersError,
  };
}
