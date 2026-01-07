// src/features/operations/ship/internal-outbound/useInternalOutboundController.ts

import { useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import type { Item } from "@/features/admin/items/api";

import {
  DOC_TYPES,
  type InternalOutboundDoc,
  type InventorySnapshotRow,
  type StockHint,
} from "./types";
import { extractErrorMessage } from "./helpers";

export function useInternalOutboundController() {
  // 单据头字段
  const [warehouseId, setWarehouseId] = useState<number>(1);
  const [docType, setDocType] = useState<string>("SAMPLE_OUT");
  const [recipientName, setRecipientName] = useState<string>("");
  const [recipientType, setRecipientType] = useState<string>("EMPLOYEE");
  const [recipientNote, setRecipientNote] = useState<string>("");
  const [docNote, setDocNote] = useState<string>("");

  // 行表单字段
  const [itemIdInput, setItemIdInput] = useState<string>("");
  const [selectedItemName, setSelectedItemName] = useState<string>("");
  const [qtyInput, setQtyInput] = useState<string>("1");
  const [batchCodeInput, setBatchCodeInput] = useState<string>("");
  const [uomInput, setUomInput] = useState<string>("PCS");
  const [lineNoteInput, setLineNoteInput] = useState<string>("");

  // 当前单据
  const [doc, setDoc] = useState<InternalOutboundDoc | null>(null);

  // UI 状态
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // SKU 选择器
  const [itemSelectorOpen, setItemSelectorOpen] = useState(false);

  // 简单库存提示
  const [stockHint, setStockHint] = useState<StockHint>({
    loading: false,
    qty: null,
    batches: null,
  });

  async function loadStockHint(warehouseIdValue: number, itemIdValue: number) {
    if (!warehouseIdValue || !itemIdValue) {
      setStockHint({ loading: false, qty: null, batches: null });
      return;
    }

    setStockHint((prev) => ({ ...prev, loading: true }));

    try {
      const rows = await apiGet<InventorySnapshotRow[]>("/inventory/snapshot", {
        warehouse_id: warehouseIdValue,
        item_id: itemIdValue,
        limit: 50,
      });

      let qty: number | null = null;
      let batches: number | null = null;

      if (Array.isArray(rows) && rows.length > 0) {
        batches = rows.length;
        const first = rows[0];
        qty = first.available_qty ?? first.qty ?? first.onhand_qty ?? null;
      }

      setStockHint({ loading: false, qty, batches });
    } catch {
      setStockHint({ loading: false, qty: null, batches: null });
    }
  }

  async function createDoc() {
    setError(null);

    if (!recipientName.trim()) {
      setError("请填写领取人姓名");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        warehouse_id: warehouseId,
        doc_type: docType,
        recipient_name: recipientName.trim(),
        recipient_type: recipientType || null,
        recipient_note: recipientNote || null,
        note: docNote || null,
      };

      const data = await apiPost<InternalOutboundDoc>("/internal-outbound/docs", payload);
      setDoc(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function addLine() {
    if (!doc) {
      setError("请先创建内部出库单");
      return;
    }
    setError(null);

    const itemId = Number(itemIdInput);
    const qty = Number(qtyInput);

    if (!itemId || !Number.isFinite(itemId)) {
      setError("请填写有效的 item_id 或通过选择商品填充");
      return;
    }
    if (!qty || !Number.isFinite(qty)) {
      setError("请填写有效的数量");
      return;
    }

    setLoading(true);
    try {
      const updated = await apiPost<InternalOutboundDoc>(
        `/internal-outbound/docs/${doc.id}/lines`,
        {
          item_id: itemId,
          qty,
          batch_code: batchCodeInput || null,
          uom: uomInput || null,
          note: lineNoteInput || null,
        },
      );
      setDoc(updated);

      setQtyInput("1");
      setLineNoteInput("");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function confirmDoc() {
    if (!doc) {
      setError("请先创建内部出库单并添加行");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const updated = await apiPost<InternalOutboundDoc>(
        `/internal-outbound/docs/${doc.id}/confirm`,
        { trace_id: null as string | null },
      );
      setDoc(updated);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const handleSelectItem = (item: Item) => {
    setItemIdInput(String(item.id));
    setSelectedItemName(item.name ?? item.sku ?? String(item.id));
    void loadStockHint(warehouseId, item.id);
  };

  const handleItemIdBlur: React.FocusEventHandler<HTMLInputElement> = (event) => {
    const val = Number(event.target.value);
    if (!Number.isFinite(val) || val <= 0) {
      setStockHint({ loading: false, qty: null, batches: null });
      return;
    }
    void loadStockHint(warehouseId, val);
  };

  const disabled = loading;

  return {
    DOC_TYPES,

    // header fields
    warehouseId,
    setWarehouseId,
    docType,
    setDocType,
    recipientName,
    setRecipientName,
    recipientType,
    setRecipientType,
    recipientNote,
    setRecipientNote,
    docNote,
    setDocNote,

    // line fields
    itemIdInput,
    setItemIdInput,
    selectedItemName,
    setSelectedItemName,
    qtyInput,
    setQtyInput,
    batchCodeInput,
    setBatchCodeInput,
    uomInput,
    setUomInput,
    lineNoteInput,
    setLineNoteInput,

    // doc & ui
    doc,
    setDoc,
    loading,
    error,
    setError,
    disabled,

    // selector
    itemSelectorOpen,
    setItemSelectorOpen,

    // stock hint
    stockHint,
    loadStockHint,

    // actions
    createDoc,
    addLine,
    confirmDoc,
    handleSelectItem,
    handleItemIdBlur,
  };
}
