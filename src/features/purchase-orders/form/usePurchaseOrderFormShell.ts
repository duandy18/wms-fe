import { useState } from "react";
import type { PurchaseOrderDetail } from "../api";
import type { SupplierBasic } from "../../../domains/pms/public/contracts/supplierBasic";
import type { ItemBasic } from "../../../domains/pms/public/contracts/itemBasic";
import { useSuppliersLoader } from "../create/presenter/useSuppliersLoader";
import { useItemsLoader } from "../create/presenter/useItemsLoader";
import type { LineDraft } from "../create/presenter/lineDraft";
import { makeEmptyLine } from "../create/presenter/lineDraft";
import { useLinesDraft } from "../create/presenter/useLinesDraft";

export interface PurchaseOrderFormShellState {
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
  purchaseTime: string;
  remark: string;
  lines: LineDraft[];
}

export interface PurchaseOrderFormShellActions {
  selectSupplier: (id: number | null) => void;
  setWarehouseId: (v: string) => void;
  setPurchaser: (v: string) => void;
  setPurchaseTime: (v: string) => void;
  setRemark: (v: string) => void;

  selectItemForLine: (lineId: number, itemId: number | null) => void;
  changeLineField: (lineId: number, field: keyof LineDraft, value: string) => void;
  addLine: () => void;
  removeLine: (lineId: number) => void;

  hydrateFromDetail: (po: PurchaseOrderDetail) => void;
  resetAfterCreateSuccess: () => void;
}

function toDatetimeLocalValue(ts: string | null | undefined): string {
  if (!ts) return "";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";

  const pad = (n: number) => String(n).padStart(2, "0");

  return [
    d.getFullYear(),
    "-",
    pad(d.getMonth() + 1),
    "-",
    pad(d.getDate()),
    "T",
    pad(d.getHours()),
    ":",
    pad(d.getMinutes()),
  ].join("");
}

function makeInitialBlankLines(): LineDraft[] {
  return [makeEmptyLine(1), makeEmptyLine(2), makeEmptyLine(3)];
}

function buildDraftLinesFromPo(po: PurchaseOrderDetail): LineDraft[] {
  if (!po.lines.length) return makeInitialBlankLines();

  return po.lines.map((line) => ({
    id: line.id,
    item_id: String(line.item_id),
    item_name: line.item_name ?? "",
    spec_text: line.spec_text ?? "",
    uom_id: String(line.purchase_uom_id_snapshot),
    qty_input: String(line.qty_ordered_input),
    supply_price: line.supply_price ?? "",
    discount_amount: line.discount_amount ?? "",
    discount_note: line.discount_note ?? "",
    remark: line.remark ?? "",
  }));
}

function freshPurchaseTime(getFreshPurchaseTime?: (() => string) | undefined): string {
  return getFreshPurchaseTime ? getFreshPurchaseTime() : "";
}

export function usePurchaseOrderFormShell(args?: {
  getFreshPurchaseTime?: () => string;
}): [PurchaseOrderFormShellState, PurchaseOrderFormShellActions] {
  const { supplierOptions, suppliersLoading, suppliersError } = useSuppliersLoader();
  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [supplierName, setSupplierName] = useState("");

  const { itemOptions, itemsLoading, itemsError } = useItemsLoader({ supplierId });

  const [warehouseId, setWarehouseId] = useState("");
  const [purchaser, setPurchaser] = useState("");
  const [purchaseTime, setPurchaseTime] = useState(() =>
    freshPurchaseTime(args?.getFreshPurchaseTime),
  );
  const [remark, setRemark] = useState("");

  const linesModel = useLinesDraft(itemOptions);

  const selectSupplier = (id: number | null) => {
    setSupplierId(id);

    if (id == null) {
      setSupplierName("");
      linesModel.resetLinesForSupplierChange();
      return;
    }

    const found = supplierOptions.find((s) => s.id === id);
    setSupplierName(found?.name ?? "");
    linesModel.resetLinesForSupplierChange();
  };

  const hydrateFromDetail = (po: PurchaseOrderDetail) => {
    setSupplierId(po.supplier_id);
    setSupplierName(po.supplier_name);
    setWarehouseId(String(po.warehouse_id ?? ""));
    setPurchaser(po.purchaser ?? "");
    setPurchaseTime(toDatetimeLocalValue(po.purchase_time));
    setRemark(po.remark ?? "");
    linesModel.setLines(buildDraftLinesFromPo(po));
  };

  const resetAfterCreateSuccess = () => {
    setRemark("");
    setPurchaseTime(freshPurchaseTime(args?.getFreshPurchaseTime));
    linesModel.resetLines();
  };

  const state: PurchaseOrderFormShellState = {
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
  };

  const actions: PurchaseOrderFormShellActions = {
    selectSupplier,
    setWarehouseId,
    setPurchaser,
    setPurchaseTime,
    setRemark,

    selectItemForLine: linesModel.selectItemForLine,
    changeLineField: linesModel.changeLineField,
    addLine: linesModel.addLine,
    removeLine: linesModel.removeLine,

    hydrateFromDetail,
    resetAfterCreateSuccess,
  };

  return [state, actions];
}
