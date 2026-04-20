import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchActiveWarehouses } from "../../warehouses/api";
import type { WarehouseListItem } from "../../warehouses/types";
import {
  createManualOutboundDoc,
  fetchManualDocItemOptions,
  fetchManualOutboundDoc,
  fetchManualOutboundDocs,
  fetchPublicItemAggregate,
  fetchPublicSuppliers,
  releaseManualOutboundDoc,
  voidManualOutboundDoc,
} from "../api/outboundApi";
import type {
  ManualOutboundDocCreateIn,
  ManualOutboundDocCreateLineIn,
  ManualOutboundDocOut,
  PublicItemAggregateUomOut,
  PublicItemBasicOut,
  PublicSupplierBasicOut,
} from "../contracts/outbound";

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

export interface ManualDocLineDraft {
  itemId: string;
  itemUomId: string;
  requestedQty: string;
}

function createEmptyLineDraft(): ManualDocLineDraft {
  return {
    itemId: "",
    itemUomId: "",
    requestedQty: "",
  };
}

function pickDefaultUom(uoms: PublicItemAggregateUomOut[]): PublicItemAggregateUomOut | null {
  if (!uoms.length) return null;
  return uoms[0] ?? null;
}

export function useOutboundManualDocsPage() {
  const [rows, setRows] = useState<ManualOutboundDocOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  const [warehouses, setWarehouses] = useState<WarehouseListItem[]>([]);
  const [warehousesLoading, setWarehousesLoading] = useState(false);
  const [warehousesError, setWarehousesError] = useState("");

  const [suppliers, setSuppliers] = useState<PublicSupplierBasicOut[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [suppliersError, setSuppliersError] = useState("");

  const [items, setItems] = useState<PublicItemBasicOut[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState("");
  const [itemCacheById, setItemCacheById] = useState<Record<number, PublicItemBasicOut>>(
    {},
  );
  const [itemUomsByItemId, setItemUomsByItemId] = useState<
    Record<number, PublicItemAggregateUomOut[]>
  >({});

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
  const [remark, setRemark] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [itemQuery, setItemQuery] = useState("");
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

  const loadSuppliers = useCallback(async () => {
    setSuppliersLoading(true);
    setSuppliersError("");
    try {
      const data = await fetchPublicSuppliers();
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (err) {
      setSuppliers([]);
      setSuppliersError(getErrorMessage(err, "加载供应商列表失败"));
    } finally {
      setSuppliersLoading(false);
    }
  }, []);

  const loadItems = useCallback(async () => {
    setItemsLoading(true);
    setItemsError("");
    try {
      const supplierIdNum = Number(supplierId);
      const data = await fetchManualDocItemOptions({
        supplier_id:
          Number.isFinite(supplierIdNum) && supplierIdNum > 0
            ? supplierIdNum
            : undefined,
        q: itemQuery.trim() || undefined,
        limit: 100,
      });
      const nextItems = Array.isArray(data) ? data : [];
      setItems(nextItems);
      setItemCacheById((prev) => {
        const next = { ...prev };
        for (const item of nextItems) {
          next[item.id] = item;
        }
        return next;
      });
    } catch (err) {
      setItems([]);
      setItemsError(getErrorMessage(err, "加载商品选项失败"));
    } finally {
      setItemsLoading(false);
    }
  }, [itemQuery, supplierId]);

  useEffect(() => {
    void loadRows();
  }, [loadRows, reloadToken]);

  useEffect(() => {
    void loadWarehouses();
    void loadSuppliers();
  }, [loadSuppliers, loadWarehouses]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

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

  const ensureItemUoms = useCallback(async (itemId: number) => {
    if (itemUomsByItemId[itemId]) {
      return itemUomsByItemId[itemId];
    }
    const aggregate = await fetchPublicItemAggregate(itemId);
    const uoms = Array.isArray(aggregate.uoms) ? aggregate.uoms : [];
    setItemUomsByItemId((prev) => ({
      ...prev,
      [itemId]: uoms,
    }));
    return uoms;
  }, [itemUomsByItemId]);

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

  const selectLineItem = useCallback(
    async (index: number, itemIdValue: string) => {
      updateLineDraft(index, { itemId: itemIdValue, itemUomId: "" });

      const itemId = Number(itemIdValue);
      if (!Number.isFinite(itemId) || itemId <= 0) {
        return;
      }

      try {
        const uoms = await ensureItemUoms(itemId);
        const defaultUom = pickDefaultUom(uoms);
        if (defaultUom) {
          updateLineDraft(index, { itemUomId: String(defaultUom.id) });
        }
      } catch {
        // 这里不主动抛出；建单时仍有必填校验
      }
    },
    [ensureItemUoms, updateLineDraft],
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
    setRemark("");
    setSupplierId("");
    setItemQuery("");
    setLineDrafts([createEmptyLineDraft()]);
  }, []);

  const getItemOptionById = useCallback(
    (itemIdValue: string | number | null | undefined): PublicItemBasicOut | null => {
      const id = Number(itemIdValue);
      if (!Number.isFinite(id) || id <= 0) return null;
      return itemCacheById[id] ?? null;
    },
    [itemCacheById],
  );

  const getUomOptionsByItemId = useCallback(
    (itemIdValue: string | number | null | undefined): PublicItemAggregateUomOut[] => {
      const id = Number(itemIdValue);
      if (!Number.isFinite(id) || id <= 0) return [];
      return itemUomsByItemId[id] ?? [];
    },
    [itemUomsByItemId],
  );

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
      const itemUomId = Number(draft.itemUomId.trim());
      const requestedQty = Number(draft.requestedQty.trim());

      const touched = draft.itemId.trim() || draft.itemUomId.trim() || draft.requestedQty.trim();

      if (!touched) continue;

      if (!Number.isInteger(itemId) || itemId <= 0) {
        setCreateError("单据行商品不能为空");
        return;
      }
      if (!Number.isInteger(itemUomId) || itemUomId <= 0) {
        setCreateError("单据行包装单位不能为空");
        return;
      }
      if (!Number.isInteger(requestedQty) || requestedQty <= 0) {
        setCreateError("单据行数量必须为正整数");
        return;
      }

      const item = getItemOptionById(itemId);
      const uom = getUomOptionsByItemId(itemId).find((x) => x.id === itemUomId) ?? null;

      lines.push({
        item_id: itemId,
        item_uom_id: itemUomId,
        requested_qty: requestedQty,
        item_name_snapshot: item?.name ?? null,
        item_spec_snapshot: item?.spec ?? null,
        uom_name_snapshot: uom?.display_name ?? uom?.uom ?? null,
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
    getItemOptionById,
    getUomOptionsByItemId,
    lineDrafts,
    recipientName,
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

    suppliers,
    suppliersLoading,
    suppliersError,
    supplierId,
    setSupplierId,

    items,
    itemsLoading,
    itemsError,
    itemQuery,
    setItemQuery,
    getItemOptionById,
    getUomOptionsByItemId,
    selectLineItem,

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
    remark,
    setRemark,

    lineDrafts,
    updateLineDraft,
    addLineDraft,
    removeLineDraft,
    createDoc,
  };
}
