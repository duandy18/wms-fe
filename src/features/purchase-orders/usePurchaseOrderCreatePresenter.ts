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
  id: number; // 前端本地行 ID

  // 系统主键（只为系统使用，不给供应商看）
  item_id: string;

  // 供应商视角：商品名称 + 规格
  item_name: string;
  spec_text: string;

  // 单位（现在用“最小单位”，直接来自 ItemBasic.uom）
  purchase_uom: string;
  units_per_case: string; // 每件包含多少最小单位（可选）

  // 数量 & 采购价格
  qty_ordered: string;
  supply_price: string; // 唯一价格字段：采购价格

  // 业务分组
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

export interface PurchaseOrderCreateState {
  // 供应商相关
  supplierId: number | null;
  supplierName: string;
  supplierOptions: SupplierBasic[];
  suppliersLoading: boolean;
  suppliersError: string | null;

  // 商品主数据
  itemOptions: ItemBasic[];
  itemsLoading: boolean;
  itemsError: string | null;

  // 头部其它字段
  warehouseId: string;
  remark: string;

  // 行
  lines: LineDraft[];

  // 最近一次成功创建的采购单（Cockpit 下方报告用）
  lastCreatedPo: PurchaseOrderWithLines | null;

  submitting: boolean;
  error: string | null;
}

export interface PurchaseOrderCreateActions {
  // 供应商
  selectSupplier: (id: number | null) => void;

  // 商品
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

/**
 * 多行采购单创建 Presenter：
 * - 供应商来源于主数据；
 * - 商品来源于主数据，选 item 后自动联动 item_id + 名称 + 规格 + 最小单位；
 * - 行上仍可以手动微调名称/规格/单位。
 */
export function usePurchaseOrderCreatePresenter(): [
  PurchaseOrderCreateState,
  PurchaseOrderCreateActions,
] {
  // 供应商主数据
  const [supplierOptions, setSupplierOptions] = useState<SupplierBasic[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [suppliersError, setSuppliersError] = useState<string | null>(null);

  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [supplierName, setSupplierName] = useState("");

  // 商品主数据
  const [itemOptions, setItemOptions] = useState<ItemBasic[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState<string | null>(null);

  // 头部其它字段
  const [warehouseId, setWarehouseId] = useState("1");
  const [remark, setRemark] = useState("");

  // 行
  const [lines, setLines] = useState<LineDraft[]>([
    makeEmptyLine(1),
    makeEmptyLine(2),
    makeEmptyLine(3),
  ]);

  // 最近一次成功创建的采购单（Cockpit 报告使用）
  const [lastCreatedPo, setLastCreatedPo] =
    useState<PurchaseOrderWithLines | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- 拉供应商 ---
  useEffect(() => {
    const loadSuppliers = async () => {
      setSuppliersLoading(true);
      setSuppliersError(null);
      try {
        const data = await fetchSuppliersBasic();
        setSupplierOptions(data);
      } catch (err: any) {
        console.error("fetchSuppliersBasic failed", err);
        setSuppliersError(err?.message ?? "加载供应商列表失败");
      } finally {
        setSuppliersLoading(false);
      }
    };
    void loadSuppliers();
  }, []);

  // --- 拉商品 ---
  useEffect(() => {
    const loadItems = async () => {
      setItemsLoading(true);
      setItemsError(null);
      try {
        const data = await fetchItemsBasic();
        setItemOptions(data);
      } catch (err: any) {
        console.error("fetchItemsBasic failed", err);
        setItemsError(err?.message ?? "加载商品列表失败");
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

  /**
   * 选中某一行的系统商品：
   * - item_id = ItemBasic.id
   * - item_name = ItemBasic.name
   * - spec_text = ItemBasic.spec
   * - purchase_uom = ItemBasic.uom（最小单位）
   */
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
          // 找不到就只记 ID
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
      // 完全空行就跳过
      if (!l.item_id.trim() && !l.qty_ordered.trim() && !l.item_name.trim()) {
        continue;
      }

      const itemId = Number(l.item_id.trim());
      const qty = Number(l.qty_ordered.trim());

      // 唯一价格：采购价格
      const supplyPrice = l.supply_price.trim()
        ? Number(l.supply_price.trim())
        : null;

      // 单位换算
      const unitsPerCase = l.units_per_case.trim()
        ? Number(l.units_per_case.trim())
        : null;

      // 校验
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

        // 供应商视角快照：商品名称 + 规格 + 单位
        item_name: l.item_name.trim() || null,
        spec_text: l.spec_text.trim() || null,
        purchase_uom: l.purchase_uom.trim() || null,
        units_per_case: unitsPerCase,

        // 数量体系：默认“件数 = 订购数量”
        qty_cases: qty,
        qty_ordered: qty,

        // 价格体系：唯一的采购价格
        supply_price: supplyPrice,
      });
    }

    return normalized;
  };

  const submit = async (onSuccess?: (poId: number) => void) => {
    setError(null);

    // 供应商必须选
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
    } catch (e: any) {
      setError(e?.message ?? "行校验失败");
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

      // 保存最近一次创建的采购单 → Cockpit 报告使用
      setLastCreatedPo(po);

      // 保留供应商 / 仓库，只清空备注和行，方便同一供应商连开多张单
      setRemark("");
      setLines([
        makeEmptyLine(1),
        makeEmptyLine(2),
        makeEmptyLine(3),
      ]);

      onSuccess?.(po.id);
    } catch (err: any) {
      console.error("createPurchaseOrderV2 failed", err);
      setError(err?.message ?? "创建多行采购单失败");
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
