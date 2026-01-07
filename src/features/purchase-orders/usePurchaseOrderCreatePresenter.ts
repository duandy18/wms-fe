// src/features/purchase-orders/usePurchaseOrderCreatePresenter.ts
// 采购单创建 Presenter（大字号 Cockpit 版）
// - 支持：供应商 / 仓库 / 采购人 / 采购时间 必填
// - 行：最小单位 / 采购单位 / 每件数量 / 订购件数 / 单价 / 行金额（按最小单位）

import { useEffect, useState } from "react";
import {
  createPurchaseOrderV2,
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

import {
  type LineDraft,
  makeEmptyLine,
  applySelectedItemToLine,
  buildPayloadLines,
} from "./createV2/lineDraft";
import {
  datetimeLocalToIsoOrThrow,
  getErrorMessage,
  nowIsoMinuteForDatetimeLocal,
} from "./createV2/utils";
import { normalizeSupplierOptions } from "./createV2/normalize";

// ✅ 兼容旧 import 路径：让其它组件仍可从本文件导入 LineDraft
export type { LineDraft } from "./createV2/lineDraft";

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
  purchaseTime: string; // datetime-local 字符串

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
  setPurchaser: (v: string) => void;
  setPurchaseTime: (v: string) => void;
  setRemark: (v: string) => void;
  setError: (v: string | null) => void;

  changeLineField: (lineId: number, field: keyof LineDraft, value: string) => void;
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
  const [purchaseTime, setPurchaseTime] = useState(() => nowIsoMinuteForDatetimeLocal());
  const [remark, setRemark] = useState("");

  const [lines, setLines] = useState<LineDraft[]>([
    makeEmptyLine(1),
    makeEmptyLine(2),
    makeEmptyLine(3),
  ]);

  const [lastCreatedPo, setLastCreatedPo] = useState<PurchaseOrderWithLines | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 加载供应商
  useEffect(() => {
    const loadSuppliers = async () => {
      setSuppliersLoading(true);
      setSuppliersError(null);
      try {
        const data = await fetchSuppliersBasic();
        setSupplierOptions(normalizeSupplierOptions(data, { activeOnly: true }));
      } catch (err) {
        console.error("fetchSuppliersBasic failed", err);
        setSuppliersError(getErrorMessage(err, "加载供应商列表失败"));
      } finally {
        setSuppliersLoading(false);
      }
    };
    void loadSuppliers();
  }, []);

  // 加载商品
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
    if (found) setSupplierName(found.name);
  };

  const selectItemForLine = (lineId: number, itemId: number | null) => {
    setLines((prev) =>
      prev.map((l) => (l.id === lineId ? applySelectedItemToLine(l, itemOptions, itemId) : l)),
    );
  };

  const changeLineField = (lineId: number, field: keyof LineDraft, value: string) => {
    setLines((prev) =>
      prev.map((l) => (l.id === lineId ? { ...l, [field]: value } : l)),
    );
  };

  const addLine = () => {
    setLines((prev) => [...prev, makeEmptyLine(prev.length + 1)]);
  };

  const removeLine = (lineId: number) => {
    setLines((prev) => (prev.length <= 1 ? prev : prev.filter((l) => l.id !== lineId)));
  };

  const submit = async (onSuccess?: (poId: number) => void) => {
    setError(null);

    // 供应商必选
    if (!supplierId || !supplierName.trim()) {
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
    let purchaseTimeIso: string;
    try {
      purchaseTimeIso = datetimeLocalToIsoOrThrow(purchaseTime);
    } catch (e) {
      setError(e instanceof Error ? e.message : "采购时间格式非法，请重新选择");
      return;
    }

    let normalizedLines;
    try {
      normalizedLines = buildPayloadLines(lines);
    } catch (e) {
      setError(e instanceof Error ? e.message : "行校验失败");
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
      setLines([makeEmptyLine(1), makeEmptyLine(2), makeEmptyLine(3)]);

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
