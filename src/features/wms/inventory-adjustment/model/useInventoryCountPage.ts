import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchActiveWarehouses } from "../../warehouses/api";
import {
  createCountDoc,
  fetchCountDocExecutionDetail,
  fetchCountDocs,
  freezeCountDoc,
  postCountDoc,
  updateCountDocLines,
} from "../api/countDocApi";
import type {
  CountDocExecutionDetailOut,
  CountDocLineCountPatch,
  CountDocOut,
} from "../contracts/countDoc";
import { formatCountDocStatus, formatDateTime } from "../contracts/countDoc";
import type { CountDocLineDraft } from "../components/CountDocLinesTable";

type WarehouseOption = Awaited<ReturnType<typeof fetchActiveWarehouses>>[number];

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}

function nowLocalDateTimeValue(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function warehouseLabel(warehouse: WarehouseOption): string {
  const code =
    typeof warehouse.code === "string" && warehouse.code.trim()
      ? warehouse.code.trim()
      : "";
  return code ? `${warehouse.name}（${code}）` : warehouse.name;
}

function normalizeOptionalString(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function docOptionLabel(doc: CountDocOut): string {
  return `${doc.count_no} · ${formatCountDocStatus(doc.status)} · ${formatDateTime(
    doc.snapshot_at,
  )}`;
}

function parsePositiveIntString(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) return null;
  return n;
}

export function useInventoryCountPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const queryWarehouseId = Number(searchParams.get("warehouse_id") ?? "");
  const queryDocId = Number(searchParams.get("doc_id") ?? "");

  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);
  const [warehousesLoading, setWarehousesLoading] = useState(false);
  const [warehousesError, setWarehousesError] = useState("");

  const [warehouseId, setWarehouseId] = useState<string>(
    Number.isFinite(queryWarehouseId) && queryWarehouseId > 0
      ? String(queryWarehouseId)
      : "",
  );
  const [snapshotAt, setSnapshotAt] = useState<string>(nowLocalDateTimeValue());
  const [remark, setRemark] = useState("");

  const [rows, setRows] = useState<CountDocOut[]>([]);
  const [rowsLoading, setRowsLoading] = useState(false);
  const [rowsError, setRowsError] = useState("");
  const [rowsReloadToken, setRowsReloadToken] = useState(0);

  const [currentDocId, setCurrentDocId] = useState<number | null>(
    Number.isFinite(queryDocId) && queryDocId > 0 ? queryDocId : null,
  );
  const [detail, setDetail] = useState<CountDocExecutionDetailOut | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  const [freezeLoading, setFreezeLoading] = useState(false);
  const [freezeError, setFreezeError] = useState("");
  const [freezeSuccess, setFreezeSuccess] = useState("");

  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  const [postLoading, setPostLoading] = useState(false);
  const [postError, setPostError] = useState("");
  const [postSuccess, setPostSuccess] = useState("");

  const [countedByNameSnapshot, setCountedByNameSnapshot] = useState("");
  const [reviewedByNameSnapshot, setReviewedByNameSnapshot] = useState("");

  const [draftsByLineId, setDraftsByLineId] = useState<Record<number, CountDocLineDraft>>(
    {},
  );

  const parsedWarehouseId = useMemo(() => {
    const n = Number(warehouseId);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [warehouseId]);

  const selectedWarehouse = useMemo(() => {
    if (parsedWarehouseId == null) return null;
    return warehouses.find((item) => item.id === parsedWarehouseId) ?? null;
  }, [parsedWarehouseId, warehouses]);

  const currentDocOption = useMemo(() => {
    if (currentDocId == null) return null;
    return rows.find((row) => row.id === currentDocId) ?? null;
  }, [currentDocId, rows]);

  const currentDocSelectableOptions = useMemo(() => {
    return rows.map((row) => ({
      id: row.id,
      label: docOptionLabel(row),
    }));
  }, [rows]);

  const interactionDisabled = useMemo(() => {
    if (!detail) return false;
    return detail.status === "POSTED" || saveLoading || postLoading || freezeLoading;
  }, [detail, freezeLoading, postLoading, saveLoading]);

  const syncSearch = useCallback(
    (next: { warehouseId?: number | null; docId?: number | null }) => {
      const params = new URLSearchParams(searchParams);

      const warehouseToSet =
        next.warehouseId !== undefined ? next.warehouseId : parsedWarehouseId;
      const docToSet = next.docId !== undefined ? next.docId : currentDocId;

      if (warehouseToSet != null && warehouseToSet > 0) {
        params.set("warehouse_id", String(warehouseToSet));
      } else {
        params.delete("warehouse_id");
      }

      if (docToSet != null && docToSet > 0) {
        params.set("doc_id", String(docToSet));
      } else {
        params.delete("doc_id");
      }

      setSearchParams(params);
    },
    [currentDocId, parsedWarehouseId, searchParams, setSearchParams],
  );

  const loadWarehouses = useCallback(async () => {
    setWarehousesLoading(true);
    setWarehousesError("");
    try {
      const data = await fetchActiveWarehouses();
      setWarehouses(Array.isArray(data) ? data : []);
    } catch (error) {
      setWarehouses([]);
      setWarehousesError(getErrorMessage(error, "加载仓库列表失败"));
    } finally {
      setWarehousesLoading(false);
    }
  }, []);

  const loadRows = useCallback(async () => {
    setRowsLoading(true);
    setRowsError("");
    try {
      const data = await fetchCountDocs({
        warehouse_id: parsedWarehouseId,
        active_only: true,
        limit: 100,
        offset: 0,
      });
      setRows(Array.isArray(data.items) ? data.items : []);
    } catch (error) {
      setRows([]);
      setRowsError(getErrorMessage(error, "加载盘点单列表失败"));
    } finally {
      setRowsLoading(false);
    }
  }, [parsedWarehouseId]);

  const loadDetail = useCallback(
    async (docId: number, forceWarehouseId?: number | null) => {
      setDetailLoading(true);
      setDetailError("");
      try {
        const data = await fetchCountDocExecutionDetail(docId);
        setDetail(data);
        setCurrentDocId(docId);

        const nextWarehouseId = forceWarehouseId ?? data.warehouse_id;
        if (nextWarehouseId != null && String(nextWarehouseId) !== warehouseId) {
          setWarehouseId(String(nextWarehouseId));
        }
        syncSearch({
          warehouseId: nextWarehouseId,
          docId,
        });
      } catch (error) {
        setDetail(null);
        setDetailError(getErrorMessage(error, "加载盘点单详情失败"));
      } finally {
        setDetailLoading(false);
      }
    },
    [syncSearch, warehouseId],
  );

  useEffect(() => {
    void loadWarehouses();
  }, [loadWarehouses]);

  useEffect(() => {
    void loadRows();
  }, [loadRows, rowsReloadToken]);

  useEffect(() => {
    if (currentDocId == null) {
      setDetail(null);
      setDetailError("");
      return;
    }
    void loadDetail(currentDocId);
  }, [currentDocId, loadDetail]);

  useEffect(() => {
    if (!detail) {
      setDraftsByLineId({});
      setCountedByNameSnapshot("");
      setReviewedByNameSnapshot("");
      return;
    }

    const nextDrafts: Record<number, CountDocLineDraft> = {};
    for (const line of detail.lines) {
      nextDrafts[line.id] = {
        counted_qty_input:
          line.counted_qty_input != null ? String(line.counted_qty_input) : "",
      };
    }
    setDraftsByLineId(nextDrafts);
    setCountedByNameSnapshot(detail.counted_by_name_snapshot ?? "");
    setReviewedByNameSnapshot(detail.reviewed_by_name_snapshot ?? "");
  }, [detail]);

  const refreshRows = useCallback(() => {
    setRowsReloadToken((value) => value + 1);
  }, []);

  const refreshCurrent = useCallback(async () => {
    if (currentDocId == null) {
      refreshRows();
      return;
    }
    await loadDetail(currentDocId);
    refreshRows();
  }, [currentDocId, loadDetail, refreshRows]);

  const selectWarehouseId = useCallback(
    (value: string) => {
      setWarehouseId(value);
      setCurrentDocId(null);
      setDetail(null);
      setDetailError("");

      const n = Number(value);
      syncSearch({
        warehouseId: Number.isFinite(n) && n > 0 ? n : null,
        docId: null,
      });
    },
    [syncSearch],
  );

  const selectCurrentDocId = useCallback(
    (value: string) => {
      const nextId = Number(value);
      if (!Number.isFinite(nextId) || nextId <= 0) {
        setCurrentDocId(null);
        setDetail(null);
        setDetailError("");
        syncSearch({ docId: null });
        return;
      }

      const row = rows.find((item) => item.id === nextId) ?? null;
      if (row) {
        setWarehouseId(String(row.warehouse_id));
        syncSearch({
          warehouseId: row.warehouse_id,
          docId: nextId,
        });
      } else {
        syncSearch({ docId: nextId });
      }

      setCurrentDocId(nextId);
    },
    [rows, syncSearch],
  );

  const updateLineDraft = useCallback(
    (lineId: number, patch: Partial<CountDocLineDraft>) => {
      setDraftsByLineId((prev) => {
        const current = prev[lineId] ?? {
          counted_qty_input: "",
        };
        return {
          ...prev,
          [lineId]: {
            ...current,
            ...patch,
          },
        };
      });
    },
    [],
  );

  const createAndFreeze = useCallback(async () => {
    if (parsedWarehouseId == null) {
      setCreateError("请先选择仓库。");
      return;
    }
    if (!snapshotAt.trim()) {
      setCreateError("请先填写盘点时点。");
      return;
    }

    const snapshotDate = new Date(snapshotAt);
    if (Number.isNaN(snapshotDate.getTime())) {
      setCreateError("盘点时点格式非法。");
      return;
    }

    setCreateLoading(true);
    setCreateError("");
    setCreateSuccess("");
    setFreezeError("");
    setFreezeSuccess("");
    setSaveError("");
    setSaveSuccess("");
    setPostError("");
    setPostSuccess("");

    try {
      const created = await createCountDoc({
        warehouse_id: parsedWarehouseId,
        snapshot_at: snapshotDate.toISOString(),
        remark: normalizeOptionalString(remark),
      });

      try {
        const freezeOut = await freezeCountDoc(created.id);
        setCreateSuccess(
          `已创建并冻结盘点单：${created.count_no}，生成 ${freezeOut.line_count} 条主行。`,
        );
        setCurrentDocId(created.id);
        syncSearch({
          warehouseId: parsedWarehouseId,
          docId: created.id,
        });
        refreshRows();
        await loadDetail(created.id, parsedWarehouseId);
      } catch (freezeErrorInner) {
        setCreateError(
          `盘点单已创建：${created.count_no}；但冻结失败：${getErrorMessage(
            freezeErrorInner,
            "冻结盘点单失败",
          )}`,
        );
        setCurrentDocId(created.id);
        syncSearch({
          warehouseId: parsedWarehouseId,
          docId: created.id,
        });
        refreshRows();
        await loadDetail(created.id, parsedWarehouseId);
      }
    } catch (error) {
      setCreateError(getErrorMessage(error, "创建盘点单失败"));
    } finally {
      setCreateLoading(false);
    }
  }, [loadDetail, parsedWarehouseId, refreshRows, remark, snapshotAt, syncSearch]);

  const freezeCurrentDoc = useCallback(async () => {
    if (currentDocId == null) {
      setFreezeError("当前没有可冻结的盘点单。");
      return;
    }

    setFreezeLoading(true);
    setFreezeError("");
    setFreezeSuccess("");
    try {
      const out = await freezeCountDoc(currentDocId);
      setFreezeSuccess(
        `冻结成功：生成 ${out.line_count} 条主行，${out.lot_snapshot_count} 条 lot 快照。`,
      );
      refreshRows();
      await loadDetail(currentDocId);
    } catch (error) {
      setFreezeError(getErrorMessage(error, "冻结盘点单失败"));
    } finally {
      setFreezeLoading(false);
    }
  }, [currentDocId, loadDetail, refreshRows]);

  const saveCurrentLines = useCallback(async () => {
    if (!detail || currentDocId == null) {
      setSaveError("当前没有可保存的盘点单。");
      return;
    }

    const countedBy = normalizeOptionalString(countedByNameSnapshot);
    if (!countedBy) {
      setSaveError("保存盘点录入前请先填写盘点人。");
      return;
    }

    const payloadLines: CountDocLineCountPatch[] = [];
    for (const line of detail.lines) {
      const draft = draftsByLineId[line.id];
      if (!draft) continue;

      if (!draft.counted_qty_input.trim()) continue;

      const countedQtyInput = parsePositiveIntString(draft.counted_qty_input);
      if (countedQtyInput == null) {
        setSaveError(`第 ${line.line_no} 行的实盘数量必须是大于等于 0 的整数。`);
        return;
      }

      payloadLines.push({
        line_id: line.id,
        counted_qty_input: countedQtyInput,
      });
    }

    if (payloadLines.length === 0) {
      setSaveError("请至少录入一条盘点结果。");
      return;
    }

    setSaveLoading(true);
    setSaveError("");
    setSaveSuccess("");
    try {
      const out = await updateCountDocLines(currentDocId, {
        counted_by_name_snapshot: countedBy,
        lines: payloadLines,
      });
      setSaveSuccess(`保存成功：已更新 ${out.updated_count} 条盘点行。`);
      refreshRows();
      await loadDetail(currentDocId);
    } catch (error) {
      setSaveError(getErrorMessage(error, "保存盘点录入失败"));
    } finally {
      setSaveLoading(false);
    }
  }, [
    countedByNameSnapshot,
    currentDocId,
    detail,
    draftsByLineId,
    loadDetail,
    refreshRows,
  ]);

  const postCurrent = useCallback(async () => {
    if (!detail || currentDocId == null) {
      setPostError("当前没有可过账的盘点单。");
      return;
    }

    const reviewedBy = normalizeOptionalString(reviewedByNameSnapshot);
    if (!reviewedBy) {
      setPostError("提交盘点结果并过账前请先填写复核人。");
      return;
    }

    setPostLoading(true);
    setPostError("");
    setPostSuccess("");
    try {
      const out = await postCountDoc(currentDocId, {
        reviewed_by_name_snapshot: reviewedBy,
      });
      setPostSuccess(
        `过账成功：事件 #${out.posted_event_id}，过账时间 ${formatDateTime(out.posted_at)}。`,
      );
      refreshRows();
      await loadDetail(currentDocId);
    } catch (error) {
      setPostError(getErrorMessage(error, "提交盘点结果并过账失败"));
    } finally {
      setPostLoading(false);
    }
  }, [currentDocId, detail, loadDetail, refreshRows, reviewedByNameSnapshot]);

  return {
    warehouses,
    warehousesLoading,
    warehousesError,
    warehouseId,
    selectedWarehouse,
    warehouseLabel,
    selectWarehouseId,

    snapshotAt,
    setSnapshotAt,
    remark,
    setRemark,

    rows,
    rowsLoading,
    rowsError,
    refreshRows,
    currentDocOption,
    currentDocSelectableOptions,
    currentDocId,
    selectCurrentDocId,

    detail,
    detailLoading,
    detailError,
    refreshCurrent,

    createLoading,
    createError,
    createSuccess,
    createAndFreeze,

    freezeLoading,
    freezeError,
    freezeSuccess,
    freezeCurrentDoc,

    saveLoading,
    saveError,
    saveSuccess,
    saveCurrentLines,

    postLoading,
    postError,
    postSuccess,
    postCurrent,

    countedByNameSnapshot,
    setCountedByNameSnapshot,
    reviewedByNameSnapshot,
    setReviewedByNameSnapshot,

    draftsByLineId,
    updateLineDraft,
    interactionDisabled,
  };
}
