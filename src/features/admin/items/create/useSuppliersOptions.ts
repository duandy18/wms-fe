// src/features/admin/items/create/useSuppliersOptions.ts

import { useEffect, useState } from "react";
import { fetchSuppliers, type Supplier } from "../../suppliers/api";

export function useSuppliersOptions() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supLoading, setSupLoading] = useState(false);
  const [supError, setSupError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      setSupLoading(true);
      setSupError(null);
      try {
        const list = await fetchSuppliers({ active: true });
        if (!alive) return;
        setSuppliers(list);
      } catch (e: unknown) {
        if (!alive) return;
        const msg = e instanceof Error ? e.message : "加载供货商失败";
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
