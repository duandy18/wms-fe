// src/features/operations/inbound/cockpit/po.ts

import { fetchPurchaseOrderV2, type PurchaseOrderWithLines } from "../../../purchase-orders/api";
import { getErrMsg } from "./utils";

export async function loadPoById(args: {
  poIdInput: string;
  setPoError: (v: string | null) => void;
  setLoadingPo: (v: boolean) => void;
  setCurrentPo: (v: PurchaseOrderWithLines | null) => void;
}) {
  const { poIdInput, setPoError, setLoadingPo, setCurrentPo } = args;

  const raw = poIdInput.trim();
  if (!raw) {
    setPoError("请输入采购单 ID");
    return;
  }
  const id = Number(raw);
  if (!Number.isFinite(id) || id <= 0) {
    setPoError("采购单 ID 必须为正整数");
    return;
  }

  setLoadingPo(true);
  setPoError(null);
  try {
    const po = await fetchPurchaseOrderV2(id);
    setCurrentPo(po);
  } catch (err: unknown) {
    console.error("fetchPurchaseOrderV2 error", err);
    setCurrentPo(null);
    setPoError(getErrMsg(err, "加载采购单失败"));
  } finally {
    setLoadingPo(false);
  }
}
