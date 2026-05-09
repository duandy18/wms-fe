// src/features/pms/items/hooks/useSuppliersOptions.ts

import { useEffect, useState } from "react";
import {
  fetchSuppliersBasic,
  type SupplierBasic,
} from "@/domains/partners/export";

export function useSuppliersOptions() {
  const [suppliers, setSuppliers] = useState<SupplierBasic[]>([]);
  const [supLoading, setSupLoading] = useState(false);
  const [supError, setSupError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      setSupLoading(true);
      setSupError(null);
      try {
        const list = await fetchSuppliersBasic({ active: true });
        if (!alive) return;
        setSuppliers(list);
      } catch (e: unknown) {
        if (!alive) return;
        const msg = e instanceof Error ? e.message : "加载供应商失败";
        setSuppliers([]);
        setSupError(msg);
      } finally {
        if (alive) setSupLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return { suppliers, supLoading, supError };
}
