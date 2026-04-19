import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchActiveWarehouses } from "../../warehouses/api";
import type { WarehouseListItem } from "../../warehouses/types";
import {
  createManualOutboundDoc,
  fetchManualOutboundDoc,
  fetchManualOutboundDocs,
  releaseManualOutboundDoc,
  voidManualOutboundDoc,
} from "../api/outboundApi";
import type {
  ManualOutboundDocCreateIn,
  ManualOutboundDocCreateLineIn,
  ManualOutboundDocOut,
} from "../contracts/outbound";

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

export interface ManualDocLineDraft {
  itemId: string;
  requestedQty: string;
  remark: string;
}

function createEmptyLineDraft(): ManualDocLineDraft {
  return {
    itemId: "",
    requestedQty: "",
    remark: "",
  };
}

export function useOutboundManualDocsPage() {
  const [rows, setRows] = useState<ManualOutboundDocOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  const [warehouses, setWarehouses] = useState<WarehouseListItem[]>([]);
  const [warehousesLoading, setWarehousesLoading] = useState(false);
  const [warehousesError, setWarehousesError] = useState("");

  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  const [detail, setDetail] = useState<ManualOutboundDocOut | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  const [warehouseId, setWarehouseId] = useState("");
  const [docType, setDocType] = useState("MANUAL_OUTBOUND");
  const [recipientName, setRecipientName] = useState("");
  const [recipientType, setRecipientType] = useState("");
  const [recipientNote, setRecipientNote] = useState("");
  const [remark, setRemark] = useState("");
  const [lineDrafts, setLineDrafts] = useState<ManualDocLineDraft[]>([
    createEmptyLineDraft(),
  ]);

  const selectedWarehouse = useMemo(() => {
    const id = Number(warehouseId);
    if (!Number.isFinite(id) || id <= 0) return null;
    return warehouses.find((item) => item.id === id) ?? null;
  }, [warehouseId, warehouses]);

  const loadRows = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchManualOutboundDocs({ limit: 50, offset: 0 });
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setRows([]);
      setError(getErrorMessage(err, "加载手动出库单据失败"));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadWarehouses = useCallback(async () => {
    setWarehousesLoading(true);
    setWarehousesError("");
    try {
      const data = await fetchActiveWarehouses();
      setWarehouses(Array.isArray(data) ? data : []);
    } catch (err) {
      setWarehouses([]);
      setWarehousesError(getErrorMessage(err, "加载仓库列表失败"));
    } finally {
      setWarehousesLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRows();
  }, [loadRows, reloadToken]);

  useEffect(() => {
    void loadWarehouses();
  }, [loadWarehouses]);

  const loadDetail = useCallback(async (docId: number) => {
    setDetailLoading(true);
    setDetailError("");
    try {
      const data = await fetchManualOutboundDoc(docId);
      setDetail(data);
    } catch (err) {
      setDetail(null);
      setDetailError(getErrorMessage(err, "加载手动出库单据详情失败"));
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const selectDoc = useCallback(
    async (docId: number) => {
      setSelectedDocId(docId);
      await loadDetail(docId);
    },
    [loadDetail],
  );

  const updateLineDraft = useCallback(
    (index: number, patch: Partial<ManualDocLineDraft>) => {
      setLineDrafts((prev) =>
        prev.map((line, idx) => (idx === index ? { ...line, ...patch } : line)),
      );
    },
    [],
  );

  const addLineDraft = useCallback(() => {
    setLineDrafts((prev) => [...prev, createEmptyLineDraft()]);
  }, []);

  const removeLineDraft = useCallback((index: number) => {
    setLineDrafts((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, idx) => idx !== index);
    });
  }, []);

  const resetCreateForm = useCallback(() => {
    setWarehouseId("");
    setDocType("MANUAL_OUTBOUND");
    setRecipientName("");
    setRecipientType("");
    setRecipientNote("");
    setRemark("");
    setLineDrafts([createEmptyLineDraft()]);
  }, []);

  const createDoc = useCallback(async () => {
    setCreateError("");
    setCreateSuccess("");

    if (!selectedWarehouse) {
      setCreateError("请先选择仓库");
      return;
    }

    const recipient = recipientName.trim();
    if (!recipient) {
      setCreateError("请填写领用/收件人");
      return;
    }

    const lines: ManualOutboundDocCreateLineIn[] = [];
    for (const draft of lineDrafts) {
      const itemId = Number(draft.itemId.trim());
      const requestedQty = Number(draft.requestedQty.trim());

      const touched =
        draft.itemId.trim() || draft.requestedQty.trim() || draft.remark.trim();

      if (!touched) continue;

      if (!Number.isInteger(itemId) || itemId <= 0) {
        setCreateError("单据行 item_id 必须为正整数");
        return;
      }
      if (!Number.isInteger(requestedQty) || requestedQty <= 0) {
        setCreateError("单据行 requested_qty 必须为正整数");
        return;
      }

      lines.push({
        item_id: itemId,
        requested_qty: requestedQty,
        remark: draft.remark.trim() || null,
      });
    }

    if (lines.length === 0) {
      setCreateError("请至少填写一条单据行");
      return;
    }

    const payload: ManualOutboundDocCreateIn = {
      warehouse_id: selectedWarehouse.id,
      doc_type: docType.trim() || "MANUAL_OUTBOUND",
      recipient_name: recipient,
      recipient_type: recipientType.trim() || null,
      recipient_note: recipientNote.trim() || null,
      remark: remark.trim() || null,
      lines,
    };

    setCreating(true);
    try {
      const data = await createManualOutboundDoc(payload);
      setCreateSuccess(`建单成功：${data.doc_no}`);
      resetCreateForm();
      setSelectedDocId(data.id);
      setDetail(data);
      setReloadToken((v) => v + 1);
    } catch (err) {
      setCreateError(getErrorMessage(err, "创建手动出库单据失败"));
    } finally {
      setCreating(false);
    }
  }, [
    docType,
    lineDrafts,
    recipientName,
    recipientNote,
    recipientType,
    remark,
    resetCreateForm,
    selectedWarehouse,
  ]);

  const releaseDoc = useCallback(
    async (docId: number) => {
      setDetailError("");
      try {
        const data = await releaseManualOutboundDoc(docId);
        setDetail(data);
        setSelectedDocId(data.id);
        setReloadToken((v) => v + 1);
      } catch (err) {
        setDetailError(getErrorMessage(err, "发布单据失败"));
      }
    },
    [],
  );

  const voidDoc = useCallback(
    async (docId: number) => {
      setDetailError("");
      try {
        const data = await voidManualOutboundDoc(docId);
        setDetail(data);
        setSelectedDocId(data.id);
        setReloadToken((v) => v + 1);
      } catch (err) {
        setDetailError(getErrorMessage(err, "作废单据失败"));
      }
    },
    [],
  );

  return {
    rows,
    loading,
    error,
    reload: () => setReloadToken((v) => v + 1),

    warehouses,
    warehousesLoading,
    warehousesError,

    selectedDocId,
    detail,
    detailLoading,
    detailError,
    selectDoc,
    releaseDoc,
    voidDoc,

    creating,
    createError,
    createSuccess,

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
    remark,
    setRemark,

    lineDrafts,
    updateLineDraft,
    addLineDraft,
    removeLineDraft,
    createDoc,
  };
}
