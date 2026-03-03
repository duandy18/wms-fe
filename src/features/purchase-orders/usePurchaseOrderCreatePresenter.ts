// src/features/purchase-orders/usePurchaseOrderCreatePresenter.ts
// 采购单创建 Presenter（大字号 Cockpit 版）
//
// 终态合同（Phase M-6，对齐后端 PurchaseOrderCreateV2 / PurchaseOrderCreateLineV2）：
// - 头部必填：supplier_id / warehouse_id / purchaser / purchase_time
// - 行必填：item_id + uom_id + qty_input
// - qty_base（qty_ordered_base）由后端服务层通过 item_uoms.ratio_to_base 推导（前端不做推导、不做双轨）
//
// 红线：供应商强约束
// - items 下拉必须严格按 supplierId 过滤
// - 切换 supplier 必须清空行明细，禁止携带跨供应商商品形成事实污染

import { useState } from "react";
import { nowIsoMinuteForDatetimeLocal } from "./createV2/utils";

import { useSuppliersLoader } from "./createV2/presenter/useSuppliersLoader";
import { useItemsLoader } from "./createV2/presenter/useItemsLoader";
import { useLinesDraft } from "./createV2/presenter/useLinesDraft";
import { useSubmitPurchaseOrder } from "./createV2/presenter/useSubmitPurchaseOrder";

import type { PurchaseOrderCreateActions, PurchaseOrderCreateState } from "./createV2/presenter/types";

// ✅ 兼容旧 import 路径：让其它组件仍可从本文件导入 LineDraft
export type { LineDraft } from "./createV2/lineDraft";

export function usePurchaseOrderCreatePresenter(): [PurchaseOrderCreateState, PurchaseOrderCreateActions] {
  // 供应商
  const { supplierOptions, suppliersLoading, suppliersError } = useSuppliersLoader();
  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [supplierName, setSupplierName] = useState("");

  // 商品（严格按 supplierId）
  const { itemOptions, itemsLoading, itemsError } = useItemsLoader({ supplierId });

  // 基础字段
  const [warehouseId, setWarehouseId] = useState("1");
  const [purchaser, setPurchaser] = useState("");
  const [purchaseTime, setPurchaseTime] = useState(() => nowIsoMinuteForDatetimeLocal());
  const [remark, setRemark] = useState("");

  // 行编辑（依赖 itemOptions：用于回填 item_name/spec/uom_snapshot 等展示信息）
  const linesModel = useLinesDraft(itemOptions);

  // 提交（终态：payload 使用 supplierId + warehouseId + lines[{item_id,uom_id,qty_input}]）
  const submitModel = useSubmitPurchaseOrder({
    supplierId,
    supplierName,
    warehouseId,
    purchaser,
    purchaseTime,
    remark,
    lines: linesModel.lines,
    onAfterSuccessReset: () => {
      setRemark("");
      linesModel.resetLines();
    },
  });

  const selectSupplier = (id: number | null) => {
    setSupplierId(id);

    if (id == null) {
      setSupplierName("");
      // ✅ 清空行：避免“未选供应商仍可选商品”的暗示
      linesModel.resetLinesForSupplierChange();
      return;
    }

    const found = supplierOptions.find((s) => s.id === id);
    if (found) setSupplierName(found.name);

    // ✅ 切换供应商：行内商品必须重置（防止携带旧供应商商品形成事实污染）
    linesModel.resetLinesForSupplierChange();
    submitModel.setError("已切换供应商：已清空行明细，请重新选择该供应商提供的商品。");
  };

  const state: PurchaseOrderCreateState = {
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
    lines: linesModel.lines,

    lastCreatedPo: submitModel.lastCreatedPo,

    submitting: submitModel.submitting,
    error: submitModel.error,
  };

  const actions: PurchaseOrderCreateActions = {
    selectSupplier,
    selectItemForLine: linesModel.selectItemForLine,

    setWarehouseId,
    setPurchaser,
    setPurchaseTime,
    setRemark,
    setError: submitModel.setError,

    changeLineField: linesModel.changeLineField,
    addLine: linesModel.addLine,
    removeLine: linesModel.removeLine,

    submit: submitModel.submit,
  };

  return [state, actions];
}
