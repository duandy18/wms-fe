// src/features/purchase-orders/detail/model/usePurchaseOrderDetailController.ts
// 拆分说明：从 PurchaseOrderViewPage.tsx 抽出详情页运行模型；统一承接详情加载、view/edit 双态、保存校验与提交流程。

import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  fetchPurchaseOrderV2,
  updatePurchaseOrder,
  type PurchaseOrderDetail,
} from "../../api";
import { buildPayloadLines } from "../../create/presenter/lineDraft";
import {
  datetimeLocalToIsoOrThrow,
  getErrorMessage,
} from "../../create/utils";
import { usePurchaseOrderFormShell } from "../../form/usePurchaseOrderFormShell";
import type { PageMode } from "../utils";

export function usePurchaseOrderDetailController() {
  const { poId } = useParams();

  const [po, setPo] = useState<PurchaseOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLineId, setSelectedLineId] = useState<number | null>(null);

  const [mode, setMode] = useState<PageMode>("view");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formState, formActions] = usePurchaseOrderFormShell();

  const canEdit = useMemo(() => {
    if (!po) return false;
    return po.editable === true;
  }, [po]);

  useEffect(() => {
    let alive = true;

    async function load() {
      const id = Number(poId);
      if (!Number.isInteger(id) || id <= 0) {
        if (!alive) return;
        setPo(null);
        setError("采购单 ID 非法");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await fetchPurchaseOrderV2(id);
        if (!alive) return;
        setPo(data);
        setSelectedLineId(data.lines[0]?.id ?? null);
        setMode("view");
        setFormError(null);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "加载采购单失败";
        if (!alive) return;
        setPo(null);
        setError(msg);
      } finally {
        if (alive) setLoading(false);
      }
    }

    void load();

    return () => {
      alive = false;
    };
  }, [poId]);

  function startEdit() {
    if (!po) return;
    formActions.hydrateFromDetail(po);
    setMode("edit");
    setFormError(null);
  }

  function cancelEdit() {
    setMode("view");
    setFormError(null);
  }

  function selectSupplier(id: number | null) {
    formActions.selectSupplier(id);

    if (id == null) {
      setFormError(null);
      return;
    }

    setFormError("已切换供应商：已清空行明细，请重新选择该供应商提供的商品。");
  }

  const saveEdit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    if (!po) return;

    setFormError(null);

    if (
      formState.supplierId == null ||
      !Number.isFinite(formState.supplierId) ||
      formState.supplierId <= 0
    ) {
      setFormError("请选择供应商");
      return;
    }

    const warehouseText = formState.warehouseId.trim();
    if (!warehouseText) {
      setFormError("请选择仓库");
      return;
    }

    const wid = Number(warehouseText);
    if (Number.isNaN(wid) || wid <= 0) {
      setFormError("仓库 ID 非法");
      return;
    }

    const purchaserTrimmed = formState.purchaser.trim();
    if (!purchaserTrimmed) {
      setFormError("请填写采购人");
      return;
    }

    let purchaseTimeIso: string;
    try {
      purchaseTimeIso = datetimeLocalToIsoOrThrow(formState.purchaseTime);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "采购时间格式非法，请重新选择",
      );
      return;
    }

    let normalizedLines;
    try {
      normalizedLines = buildPayloadLines(formState.lines);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "行校验失败");
      return;
    }

    if (normalizedLines.length === 0) {
      setFormError("请至少填写一行有效的商品行");
      return;
    }

    setSaving(true);
    try {
      const updated = await updatePurchaseOrder(po.id, {
        supplier_id: formState.supplierId,
        warehouse_id: wid,
        purchaser: purchaserTrimmed,
        purchase_time: purchaseTimeIso,
        remark: formState.remark.trim() || null,
        lines: normalizedLines,
      });

      setPo(updated);
      setSelectedLineId(updated.lines[0]?.id ?? null);
      setMode("view");
      setFormError(null);
    } catch (err) {
      console.error("updatePurchaseOrder failed", err);
      setFormError(getErrorMessage(err, "更新采购单失败"));
    } finally {
      setSaving(false);
    }
  };

  return {
    po,
    loading,
    error,
    selectedLineId,
    setSelectedLineId,

    mode,
    saving,
    formError,
    canEdit,

    formState,
    formActions,

    startEdit,
    cancelEdit,
    selectSupplier,
    saveEdit,
  };
}

export type PurchaseOrderDetailController = ReturnType<
  typeof usePurchaseOrderDetailController
>;
