import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchPurchaseOrdersCompletion,
  type PurchaseOrderCompletionListItem,
} from "../../api";
import {
  fetchSuppliersBasic,
  type SupplierBasic,
} from "../../../../domains/pms/public";
import type {
  PurchaseOrdersPageController,
  StatusFilter,
  SupplierOption,
} from "../types";
import {
  getPurchaseOrdersPageErrorMessage,
  matchesCompletionStatus,
} from "../utils";

type PurchaseOrdersQuery = {
  limit: number;
  skip: number;
  supplier_id?: number;
  q?: string;
};

export function usePurchaseOrdersPageController(): PurchaseOrdersPageController {
  const [rawRows, setRawRows] = useState<PurchaseOrderCompletionListItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [supplierFilter, setSupplierFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [searchText, setSearchText] = useState("");

  const [supplierOptions, setSupplierOptions] = useState<SupplierOption[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [suppliersError, setSuppliersError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function loadSuppliers() {
      setSuppliersLoading(true);
      setSuppliersError(null);

      try {
        const list: SupplierBasic[] = await fetchSuppliersBasic({ active: true });
        if (!alive) return;
        setSupplierOptions(list);
      } catch (err) {
        console.error("loadSuppliers failed", err);
        if (!alive) return;
        setSupplierOptions([]);
        setSuppliersError(
          getPurchaseOrdersPageErrorMessage(err, "供应商选项加载失败"),
        );
      } finally {
        if (alive) setSuppliersLoading(false);
      }
    }

    void loadSuppliers();

    return () => {
      alive = false;
    };
  }, []);

  const loadRows = useCallback(async () => {
    setLoadingList(true);
    setListError(null);

    try {
      const params: PurchaseOrdersQuery = { limit: 200, skip: 0 };

      if (supplierFilter.trim()) {
        const supplierId = Number(supplierFilter.trim());
        if (Number.isFinite(supplierId) && supplierId > 0) {
          params.supplier_id = supplierId;
        }
      }

      if (searchText.trim()) {
        params.q = searchText.trim();
      }

      const data = await fetchPurchaseOrdersCompletion(params);
      setRawRows(data);
    } catch (err) {
      console.error("loadRows failed", err);
      setListError(
        getPurchaseOrdersPageErrorMessage(err, "加载采购完成情况失败"),
      );
      setRawRows([]);
    } finally {
      setLoadingList(false);
    }
  }, [supplierFilter, searchText]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const rows = useMemo(
    () => rawRows.filter((row) => matchesCompletionStatus(row, statusFilter)),
    [rawRows, statusFilter],
  );

  return {
    rows,
    loadingList,
    listError,

    supplierFilter,
    statusFilter,
    searchText,

    supplierOptions,
    suppliersLoading,
    suppliersError,

    setSupplierFilter,
    setStatusFilter,
    setSearchText,
    reload: () => {
      void loadRows();
    },
  };
}
