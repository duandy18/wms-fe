// src/features/purchase-orders/usePurchaseOrderCreatePresenter.ts
// 采购单创建 Presenter（大字号 Cockpit 版）
// - 支持：供应商 / 仓库 / 采购人 / 采购时间 必填
// - 行：最小单位 / 采购单位 / 每件数量 / 订购件数 / 单价 / 行金额（按最小单位）

import { useState } from "react";
import { nowIsoMinuteForDatetimeLocal } from "./createV2/utils";

import { useSuppliersLoader } from "./createV2/presenter/useSuppliersLoader";
import { useItemsLoader } from "./createV2/presenter/useItemsLoader";
import { useLinesDraft } from "./createV2/presenter/useLinesDraft";
import { useSubmitPurchaseOrder } from "./createV2/presenter/useSubmitPurchaseOrder";

import type { PurchaseOrderCreateActions, PurchaseOrderCreateState } from "./createV2/presenter/types";

// ✅ 兼容旧 import 路径：让其它组件仍可从本文件导入 LineDraft
export type { LineDraft } from "./createV2/lineDraft";

export function usePurchaseOrderCreatePresenter(): [
  PurchaseOrderCreateState,
  PurchaseOrderCreateActions,
] {
  // 供应商
  const { supplierOptions, suppliersLoading, suppliersError } = useSuppliersLoader();
  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [supplierName, setSupplierName] = useState("");

  // 商品
  const { itemOptions, itemsLoading, itemsError } = useItemsLoader();

  // 基础字段
  const [warehouseId, setWarehouseId] = useState("1");
  const [purchaser, setPurchaser] = useState("");
  const [purchaseTime, setPurchaseTime] = useState(() => nowIsoMinuteForDatetimeLocal());
  const [remark, setRemark] = useState("");

  // 行编辑
  const linesModel = useLinesDraft(itemOptions);

  const selectSupplier = (id: number | null) => {
    setSupplierId(id);
    if (id == null) {
      setSupplierName("");
      return;
    }
    const found = supplierOptions.find((s) => s.id === id);
    if (found) setSupplierName(found.name);
  };

  // 提交
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
