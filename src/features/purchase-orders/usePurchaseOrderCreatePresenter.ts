// src/features/purchase-orders/usePurchaseOrderCreatePresenter.ts

import { useEffect, useState } from "react";
import {
  createPurchaseOrderV2,
  type PurchaseOrderLineCreatePayload,
  type PurchaseOrderWithLines,
} from "./api";
import {
  fetchSuppliersBasic,
  type SupplierBasic,
} from "../../master-data/suppliersApi";
import {
  fetchItemsBasic,
  type ItemBasic,
} from "../../master-data/itemsApi";

export type LineDraft = {
  id: number;

  item_id: string;
  item_name: string;
  spec_text: string;

  purchase_uom: string;
  units_per_case: string;

  qty_ordered: string;
  supply_price: string;

  category: string;
};

const makeEmptyLine = (id: number): LineDraft => ({
  id,
  item_id: "",
  item_name: "",
  spec_text: "",
  purchase_uom: "",
  units_per_case: "",
  qty_ordered: "",
  supply_price: "",
  category: "",
});

type ApiErrorShape = {
  message?: string;
};

const getErrorMessage = (err: unknown, fallback: string): string => {
  const e = err as ApiErrorShape;
  return e?.message ?? fallback;
};

export interface PurchaseOrderCreateState {
  supplierId: number | null;
  supplierName: string;
  supplierOptions: SupplierBasic[];
  suppliersLoading: boolean;
  suppliersError: string | null;

  itemOptions: ItemBasic[];
  itemsLoading: boolean;
  itemsError: string | null;

  warehouseId: string;
  remark: string;

  lines: LineDraft[];

  lastCreatedPo: PurchaseOrderWithLines | null;

  submitting: boolean;
  error: string | null;
}

export interface PurchaseOrderCreateActions {
  selectSupplier: (id: number | null) => void;
  selectItemForLine: (lineId: number, itemId: number | null) => void;

  setWarehouseId: (v: string) => void;
  setRemark: (v: string) => void;
  setError: (v: string | null) => void;

  changeLineField: (
    lineId: number,
    field: keyof LineDraft,
    value: string,
  ) => void;
  addLine: () => void;
  removeLine: (lineId: number) => void;

  submit: (onSuccess?: (poId: number) => void) => Promise<void>;
}

export function usePurchaseOrderCreatePresenter(): [
  PurchaseOrderCreateState,
  PurchaseOrderCreateActions,
] {
  const [supplierOptions, setSupplierOptions] = useState<SupplierBasic[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [suppliersError, setSuppliersError] = useState<string | null>(null);

  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [supplierName, setSupplierName] = useState("");

  const [itemOptions, setItemOptions] = useState<ItemBasic[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState<string | null>(null);

  const [warehouseId, setWarehouseId] = useState("1");
  const [remark, setRemark] = useState("");

  const [lines, setLines] = useState<LineDraft[]>([
    makeEmptyLine(1),
    makeEmptyLine(2),
    makeEmptyLine(3),
  ]);

  const [lastCreatedPo, setLastCreatedPo] =
    useState<PurchaseOrderWithLines | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSuppliers = async () => {
      setSuppliersLoading(true);
      setSuppliersError(null);
      try {
        const data = await fetchSuppliersBasic();
        setSupplierOptions(data);
      } catch (err) {
        console.error("fetchSuppliersBasic failed", err);
        setSuppliersError(
          getErrorMessage(err, "加载供应商列表失败"),
        );
      } finally {
        setSuppliersLoading(false);
      }
    };
    void loadSuppliers();
  }, []);

  useEffect(() => {
    const loadItems = async () => {
      setItemsLoading(true);
      setItemsError(null);
      try {
        const data = await fetchItemsBasic();
        setItemOptions(data);
      } catch (err) {
        console.error("fetchItemsBasic failed", err);
        setItemsError(getErrorMessage(err, "加载商品列表失败"));
      } finally {
        setItemsLoading(false);
      }
    };
    void loadItems();
  }, []);

  const selectSupplier = (id: number | null) => {
    setSupplierId(id);
    if (id == null) {
      setSupplierName("");
      return;
    }
    const found = supplierOptions.find((s) => s.id === id);
    if (found) {
      setSupplierName(found.name);
    }
  };

  const selectItemForLine = (lineId: number, itemId: number | null) => {
    setLines((prev) =>
      prev.map((l) => {
        if (l.id !== lineId) return l;

        if (!itemId) {
          return {
            ...l,
            item_id: "",
            item_name: "",
            spec_text: "",
            purchase_uom: "",
          };
        }

        const found = itemOptions.find((it) => it.id === itemId);
        if (!found) {
          return {
            ...l,
            item_id: String(itemId),
          };
        }

        return {
          ...l,
          item_id: String(found.id),
          item_name: found.name,
          spec_text: found.spec ?? "",
          purchase_uom: found.uom ?? l.purchase_uom,
        };
      }),
    );
  };

  const changeLineField = (
    lineId: number,
    field: keyof LineDraft,
    value: string,
  ) => {
    setLines((prev) =>
      prev.map((l) =>
        l.id === lineId
          ? {
              ...l,
              [field]: value,
            }
          : l,
      ),
    );
  };

  const addLine = () => {
    setLines((prev) => [...prev, makeEmptyLine(prev.length + 1)]);
  };

  const removeLine = (lineId: number) => {
    setLines((prev) =>
      prev.length <= 1 ? prev : prev.filter((l) => l.id !== lineId),
    );
  };

  const buildPayloadLines = (): PurchaseOrderLineCreatePayload[] => {
    const normalized: PurchaseOrderLineCreatePayload[] = [];

    for (const [idx, l] of lines.entries()) {
      if (!l.item_id.trim() && !l.qty_ordered.trim() && !l.item_name.trim()) {
        continue;
      }

      const itemId = Number(l.item_id.trim());
      const qty = Number(l.qty_ordered.trim());

      const supplyPrice = l.supply_price.trim()
        ? Number(l.supply_price.trim())
        : null;

      const unitsPerCase = l.units_per_case.trim()
        ? Number(l.units_per_case.trim())
        : null;

      if (Number.isNaN(itemId) || itemId <= 0) {
        throw new Error(`第 ${idx + 1} 行：item_id 非法`);
      }
      if (Number.isNaN(qty) || qty <= 0) {
        throw new Error(`第 ${idx + 1} 行：订购数量必须 > 0`);
      }
      if (supplyPrice != null && (Number.isNaN(supplyPrice) || supplyPrice < 0)) {
        throw new Error(`第 ${idx + 1} 行：采购价格非法`);
      }
      if (
        unitsPerCase != null &&
        (Number.isNaN(unitsPerCase) || unitsPerCase <= 0)
      ) {
        throw new Error(`第 ${idx + 1} 行：每件数量必须为正整数`);
      }

      normalized.push({
        line_no: idx + 1,
        item_id: itemId,
        category: l.category.trim() || null,

        spec_text: l.spec_text.trim() || null,
        purchase_uom: l.purchase_uom.trim() || null,
        units_per_case: unitsPerCase,

        qty_cases: qty,
        qty_ordered: qty,

        supply_price: supplyPrice,
      });
    }

    return normalized;
  };

  const submit = async (onSuccess?: (poId: number) => void) => {
    setError(null);

    if (!supplierId || !supplierName) {
      setError("请选择供应商");
      return;
    }

    const wid = Number(warehouseId.trim() || "1");
    if (Number.isNaN(wid) || wid <= 0) {
      setError("仓库 ID 非法");
      return;
    }

    let normalizedLines: PurchaseOrderLineCreatePayload[];
    try {
      normalizedLines = buildPayloadLines();
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "行校验失败";
      setError(msg);
      return;
    }

    if (normalizedLines.length === 0) {
      setError("请至少填写一行有效的商品行");
      return;
    }

    setSubmitting(true);
    try {
      const po = await createPurchaseOrderV2({
        supplier: supplierName,
        supplier_id: supplierId,
        supplier_name: supplierName,
        warehouse_id: wid,
        remark: remark.trim() || null,
        lines: normalizedLines,
      });

      setLastCreatedPo(po);

      setRemark("");
      setLines([
        makeEmptyLine(1),
        makeEmptyLine(2),
        makeEmptyLine(3),
      ]);

      onSuccess?.(po.id);
    } catch (err) {
      console.error("createPurchaseOrderV2 failed", err);
      setError(getErrorMessage(err, "创建多行采购单失败"));
    } finally {
      setSubmitting(false);
    }
  };

  return [
    {
      supplierId,
      supplierName,
      supplierOptions,
      suppliersLoading,
      suppliersError,

      itemOptions,
      itemsLoading,
      itemsError,

      warehouseId,
      remark,
      lines,
      lastCreatedPo,
      submitting,
      error,
    },
    {
      selectSupplier,
      selectItemForLine,
      setWarehouseId,
      setRemark,
      setError,
      changeLineField,
      addLine,
      removeLine,
      submit,
    },
  ];
}
