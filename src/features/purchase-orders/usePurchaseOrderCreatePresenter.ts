// src/features/purchase-orders/usePurchaseOrderCreatePresenter.ts
// 采购单创建 Presenter
//
// 当前 create 合同：
// - 头部必填：supplier_id / warehouse_id / purchaser / purchase_time
// - 头部可选：remark
// - 行必填：item_id + uom_id + qty_input
// - 行可选商业字段：supply_price / discount_amount / discount_note / remark
// - qty_base（qty_ordered_base）由后端服务层通过 item_uoms.ratio_to_base 推导

import { useState } from "react";
import { nowIsoMinuteForDatetimeLocal } from "./create/utils";

import { useSuppliersLoader } from "./create/presenter/useSuppliersLoader";
import { useItemsLoader } from "./create/presenter/useItemsLoader";
import { useLinesDraft } from "./create/presenter/useLinesDraft";
import { useSubmitPurchaseOrder } from "./create/presenter/useSubmitPurchaseOrder";

import type {
  PurchaseOrderCreateActions,
  PurchaseOrderCreateState,
} from "./create/presenter/types";

// ✅ 兼容旧 import 路径：让其它组件仍可从本文件导入 LineDraft
export type { LineDraft } from "./create/presenter/lineDraft";

export function usePurchaseOrderCreatePresenter(): [
  PurchaseOrderCreateState,
  PurchaseOrderCreateActions,
] {
  const { supplierOptions, suppliersLoading, suppliersError } = useSuppliersLoader();
  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [supplierName, setSupplierName] = useState("");

  const { itemOptions, itemsLoading, itemsError } = useItemsLoader({ supplierId });

  // ✅ 仓库不再默认写死为 1，要求用户明确选择
  const [warehouseId, setWarehouseId] = useState("");
  const [purchaser, setPurchaser] = useState("");
  const [purchaseTime, setPurchaseTime] = useState(() => nowIsoMinuteForDatetimeLocal());
  const [remark, setRemark] = useState("");

  const linesModel = useLinesDraft(itemOptions);

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
      setPurchaseTime(nowIsoMinuteForDatetimeLocal());
      linesModel.resetLines();
    },
  });

  const selectSupplier = (id: number | null) => {
    setSupplierId(id);

    if (id == null) {
      setSupplierName("");
      linesModel.resetLinesForSupplierChange();
      return;
    }

    const found = supplierOptions.find((s) => s.id === id);
    if (found) {
      setSupplierName(found.name);
    } else {
      setSupplierName("");
    }

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
