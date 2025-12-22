// src/features/purchase-orders/usePurchaseOrderCreatePresenter.ts
// 采购单创建 Presenter（大字号 Cockpit 版）
// - 支持：供应商 / 仓库 / 采购人 / 采购时间 必填
// - 行：最小单位 / 采购单位 / 每件数量 / 订购件数 / 单价 / 行金额（按最小单位）

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

  base_uom: string; // 最小单位（如 袋 / 罐 / PCS）
  purchase_uom: string; // 采购单位（件 / 箱 / 托）
  units_per_case: string;

  qty_ordered: string;
  supply_price: string;
};

const makeEmptyLine = (id: number): LineDraft => ({
  id,
  item_id: "",
  item_name: "",
  spec_text: "",
  base_uom: "",
  purchase_uom: "",
  units_per_case: "",
  qty_ordered: "",
  supply_price: "",
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

  purchaser: string;
  purchaseTime: string; // 形如 "2025-12-11T21:30" 的 datetime-local 字符串

  remark: string; // 可选备注，当前 UI 可以先不用

  lines: LineDraft[];

  lastCreatedPo: PurchaseOrderWithLines | null;

  submitting: boolean;
  error: string | null;
}

export interface PurchaseOrderCreateActions {
  selectSupplier: (id: number | null) => void;
  selectItemForLine: (lineId: number, itemId: number | null) => void;

  setWarehouseId: (v: string) => void;
  setPurchaser: (v: string) => void;
  setPurchaseTime: (v: string) => void;
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

  const [purchaser, setPurchaser] = useState("");
  const [purchaseTime, setPurchaseTime] = useState(() => {
    // 初始值：当前时间截到分钟，适配 <input type="datetime-local">
    const d = new Date();
    const iso = d.toISOString(); // 2025-12-11T21:30:00.000Z
    // datetime-local 需要本地时间，不带 Z，这里直接截前 16 个字符（YYYY-MM-DDTHH:mm）
    return iso.slice(0, 16);
  });

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
            base_uom: "",
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

        // found.uom 视为最小单位（base_uom），采购单位由用户在表格中单独填写
        return {
          ...l,
          item_id: String(found.id),
          item_name: found.name,
          spec_text: found.spec ?? "",
          base_uom: found.uom ?? l.base_uom,
          purchase_uom: l.purchase_uom || "",
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
      if (
        !l.item_id.trim() &&
        !l.qty_ordered.trim() &&
        !l.item_name.trim()
      ) {
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
      if (
        supplyPrice != null &&
        (Number.isNaN(supplyPrice) || supplyPrice < 0)
      ) {
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
        category: null, // 当前前端不编辑分类，统一传 null

        spec_text: l.spec_text.trim() || null,
        base_uom: l.base_uom.trim() || null,
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

    // 供应商必选
    if (!supplierId || !supplierName) {
      setError("请选择供应商");
      return;
    }

    // 仓库必填
    const wid = Number(warehouseId.trim() || "1");
    if (Number.isNaN(wid) || wid <= 0) {
      setError("仓库 ID 非法");
      return;
    }

    // 采购人必填
    const purchaserTrimmed = purchaser.trim();
    if (!purchaserTrimmed) {
      setError("请填写采购人");
      return;
    }

    // 采购时间必填
    const purchaseTimeTrimmed = purchaseTime.trim();
    if (!purchaseTimeTrimmed) {
      setError("请填写采购时间");
      return;
    }

    let purchaseTimeIso: string;
    try {
      const d = new Date(purchaseTimeTrimmed);
      if (Number.isNaN(d.getTime())) {
        throw new Error("时间格式非法");
      }
      purchaseTimeIso = d.toISOString();
    } catch {
      setError("采购时间格式非法，请重新选择");
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
        purchaser: purchaserTrimmed,
        purchase_time: purchaseTimeIso,
        remark: remark.trim() || null,
        lines: normalizedLines,
      });

      setLastCreatedPo(po);

      // 重置部分字段（采购人/时间通常不重置，方便连续录入）
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

      purchaser,
      purchaseTime,

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
      setPurchaser,
      setPurchaseTime,
      setRemark,
      setError,
      changeLineField,
      addLine,
      removeLine,
      submit,
    },
  ];
}
