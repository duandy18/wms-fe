import React, { useEffect, useMemo, useState } from "react";
import PageTitle from "../../../../components/ui/PageTitle";
import type { PublicAggregateUom } from "../../../../domains/pms/public/contracts/itemAggregate";
import { fetchItemAggregate } from "../../../../domains/pms/public/itemAggregateClient";
import {
  probeReceivingTaskBarcode,
  submitReceiving,
} from "../api/receivingApi";
import ReceivingEditableBatchLines from "../components/ReceivingEditableBatchLines";
import {
  createEmptyReceivingEntryDraft,
  formatReceivingSourceType,
  formatReceivingStatus,
  type ReceivingActualUomOption,
  type ReceivingEntryDraft,
  type ReceivingLineIn,
  type ReceivingSubmitIn,
  type ReceivingSubmitOut,
  type ReceivingTaskProbeOut,
  type ReceivingTaskReadOut,
  receivingLineRequiresBatchField,
  receivingLineShowsBatchField,
  receivingLineShowsDateFields,
} from "../contracts/receiving";
import { useReceivingSummaryPage } from "../model/useReceivingSummaryPage";

function formatDateTime(value: string | null): string {
  if (!value) return "-";
  return value.replace("T", " ").replace("Z", "");
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

function normalizeOptionalString(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function isEntryTouched(entry: ReceivingEntryDraft): boolean {
  return Boolean(
    entry.qty_inbound.trim() ||
      entry.barcode_input.trim() ||
      entry.batch_no.trim() ||
      entry.production_date.trim() ||
      entry.expiry_date.trim() ||
      entry.remark.trim(),
  );
}

function formatQty(value: string | number | null | undefined): string {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return "0";
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(4).replace(/\.?0+$/, "");
}

function incrementQtyText(value: string): string {
  const n = Number(value.trim() || "0");
  const safe = Number.isFinite(n) && n > 0 ? n : 0;
  return String(safe + 1);
}

function sortAggregateUoms(uoms: PublicAggregateUom[]): PublicAggregateUom[] {
  const score = (u: PublicAggregateUom): number => {
    const inbound = u.is_inbound_default ? 0 : 10;
    const base = u.is_base ? 0 : 1;
    return inbound + base;
  };

  return [...uoms].sort(
    (a, b) =>
      score(a) - score(b) ||
      a.ratio_to_base - b.ratio_to_base ||
      a.id - b.id,
  );
}

function buildLineUomOptions(
  line: ReceivingTaskReadOut["lines"][number],
  aggregateUoms: PublicAggregateUom[] | undefined,
): ReceivingActualUomOption[] {
  const fallback: ReceivingActualUomOption = {
    actual_item_uom_id: line.item_uom_id,
    actual_uom_name_snapshot:
      line.uom_name_snapshot || `包装 ${line.item_uom_id}`,
    actual_ratio_to_base_snapshot: Number(line.ratio_to_base_snapshot),
    is_base: Number(line.ratio_to_base_snapshot) === 1,
    is_inbound_default: Number(line.ratio_to_base_snapshot) === 1,
  };

  const source =
    aggregateUoms && aggregateUoms.length > 0
      ? sortAggregateUoms(aggregateUoms)
      : [];

  const map = new Map<number, ReceivingActualUomOption>();
  map.set(fallback.actual_item_uom_id, fallback);

  for (const u of source) {
    map.set(u.id, {
      actual_item_uom_id: u.id,
      actual_uom_name_snapshot:
        (u.display_name && u.display_name.trim()) || u.uom,
      actual_ratio_to_base_snapshot: u.ratio_to_base,
      is_base: u.is_base,
      is_inbound_default: u.is_inbound_default,
    });
  }

  return [...map.values()].sort(
    (a, b) =>
      Number(b.is_inbound_default) - Number(a.is_inbound_default) ||
      Number(b.is_base) - Number(a.is_base) ||
      a.actual_ratio_to_base_snapshot - b.actual_ratio_to_base_snapshot ||
      a.actual_item_uom_id - b.actual_item_uom_id,
  );
}

function buildPresetEntriesFromUoms(
  options: ReceivingActualUomOption[],
  previousRows?: ReceivingEntryDraft[],
): ReceivingEntryDraft[] {
  const prevMap = new Map<number, ReceivingEntryDraft>();
  (previousRows ?? []).forEach((row) => {
    if (row.actual_item_uom_id != null) {
      prevMap.set(row.actual_item_uom_id, row);
    }
  });

  return options.map((opt) => {
    const prev = prevMap.get(opt.actual_item_uom_id);
    return {
      ...createEmptyReceivingEntryDraft(),
      ...prev,
      actual_item_uom_id: opt.actual_item_uom_id,
      actual_uom_name_snapshot: opt.actual_uom_name_snapshot,
      actual_ratio_to_base_snapshot: opt.actual_ratio_to_base_snapshot,
    };
  });
}

function buildEmptyEntries(
  detail: ReceivingTaskReadOut,
  uomOptionsByLineNo: Record<number, ReceivingActualUomOption[]>,
): Record<number, ReceivingEntryDraft[]> {
  const next: Record<number, ReceivingEntryDraft[]> = {};
  for (const line of detail.lines) {
    const options = uomOptionsByLineNo[line.line_no] ?? [];
    next[line.line_no] =
      options.length > 0
        ? buildPresetEntriesFromUoms(options)
        : [createEmptyReceivingEntryDraft()];
  }
  return next;
}

function applyResolvedScanToFixedRows(
  currentRows: ReceivingEntryDraft[],
  resolved: {
    barcode: string;
    actual_item_uom_id: number;
    actual_uom_name_snapshot: string;
    actual_ratio_to_base_snapshot: number;
  },
): ReceivingEntryDraft[] {
  const rows = [...currentRows];
  const targetIndex = rows.findIndex(
    (row) => row.actual_item_uom_id === resolved.actual_item_uom_id,
  );

  if (targetIndex >= 0) {
    const current = rows[targetIndex] ?? createEmptyReceivingEntryDraft();
    rows[targetIndex] = {
      ...current,
      barcode_input: resolved.barcode,
      actual_item_uom_id: resolved.actual_item_uom_id,
      actual_uom_name_snapshot: resolved.actual_uom_name_snapshot,
      actual_ratio_to_base_snapshot: resolved.actual_ratio_to_base_snapshot,
      qty_inbound: incrementQtyText(current.qty_inbound),
    };
    return rows;
  }

  rows.push({
    ...createEmptyReceivingEntryDraft(),
    barcode_input: resolved.barcode,
    actual_item_uom_id: resolved.actual_item_uom_id,
    actual_uom_name_snapshot: resolved.actual_uom_name_snapshot,
    actual_ratio_to_base_snapshot: resolved.actual_ratio_to_base_snapshot,
    qty_inbound: "1",
  });
  return rows;
}

const BASE_EPSILON = 1e-9;

const ReceivingReturnsPage: React.FC = () => {
  const m = useReceivingSummaryPage("RETURN_ORDER");
  const [selectedReceiptNo, setSelectedReceiptNo] = useState("");
  const [remark, setRemark] = useState("");
  const [entriesByLineNo, setEntriesByLineNo] = useState<
    Record<number, ReceivingEntryDraft[]>
  >({});
  const [uomOptionsByLineNo, setUomOptionsByLineNo] = useState<
    Record<number, ReceivingActualUomOption[]>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [lastSubmit, setLastSubmit] = useState<ReceivingSubmitOut | null>(null);
  const [scanError, setScanError] = useState("");
  const [scanSuccess, setScanSuccess] = useState("");
  const [resolvingEntryKey, setResolvingEntryKey] = useState<string | null>(null);

  const selectedRow = useMemo(() => {
    return m.rows.find((row) => row.receipt_no === selectedReceiptNo) ?? null;
  }, [m.rows, selectedReceiptNo]);

  const selectedDetail = useMemo(() => {
    return selectedReceiptNo ? m.detailByReceiptNo[selectedReceiptNo] ?? null : null;
  }, [m.detailByReceiptNo, selectedReceiptNo]);

  useEffect(() => {
    setRemark("");
    setSubmitError("");
    setSubmitSuccess("");
    setLastSubmit(null);
    setScanError("");
    setScanSuccess("");
    setResolvingEntryKey(null);
    setEntriesByLineNo({});
    setUomOptionsByLineNo({});
  }, [selectedReceiptNo]);

  useEffect(() => {
    if (!selectedDetail) return;
    const detail = selectedDetail;

    let cancelled = false;

    async function loadLineUomOptions() {
      const itemIds = [...new Set(detail.lines.map((line) => line.item_id))];
      const aggregateMap = new Map<number, PublicAggregateUom[]>();

      await Promise.all(
        itemIds.map(async (itemId) => {
          try {
            const aggregate = await fetchItemAggregate(itemId);
            aggregateMap.set(itemId, aggregate.uoms ?? []);
          } catch {
            aggregateMap.set(itemId, []);
          }
        }),
      );

      if (cancelled) return;

      const next: Record<number, ReceivingActualUomOption[]> = {};
      for (const line of detail.lines) {
        next[line.line_no] = buildLineUomOptions(
          line,
          aggregateMap.get(line.item_id),
        );
      }
      setUomOptionsByLineNo(next);
    }

    void loadLineUomOptions();

    return () => {
      cancelled = true;
    };
  }, [selectedDetail]);

  useEffect(() => {
    if (!selectedDetail) return;
    if (Object.keys(uomOptionsByLineNo).length === 0) return;

    setEntriesByLineNo((prev) => {
      const next: Record<number, ReceivingEntryDraft[]> = {};
      for (const line of selectedDetail.lines) {
        const options = uomOptionsByLineNo[line.line_no] ?? [];
        next[line.line_no] =
          options.length > 0
            ? buildPresetEntriesFromUoms(options, prev[line.line_no])
            : prev[line.line_no] ?? [createEmptyReceivingEntryDraft()];
      }
      return next;
    });
  }, [selectedDetail, uomOptionsByLineNo]);

  async function handleResolveBarcodeAtEntry(
    lineNo: number,
    index: number,
    rawBarcode: string,
  ) {
    const barcode = rawBarcode.trim();
    if (!barcode) return;

    if (!selectedDetail) {
      const msg = "请先选择退货收货单，再进行识别";
      setScanError(msg);
      throw new Error(msg);
    }

    setResolvingEntryKey(`${lineNo}-${index}`);
    setScanError("");
    setScanSuccess("");

    try {
      const result: ReceivingTaskProbeOut = await probeReceivingTaskBarcode(
        selectedDetail.receipt_no,
        { barcode },
      );

      const actualItemUomId = result.item_uom_id;
      const actualRatioToBaseSnapshot = result.ratio_to_base;
      const actualUomNameSnapshot = result.uom_name_snapshot;

      if (result.status !== "MATCHED" || result.matched_line_no == null) {
        const msg = result.message || "识别未命中当前收货单行";
        setScanError(msg);
        throw new Error(msg);
      }

      if (result.matched_line_no !== lineNo) {
        const msg = `该编码命中的是第 ${result.matched_line_no} 行，请在对应行录入`;
        setScanError(msg);
        throw new Error(msg);
      }

      if (
        actualItemUomId == null ||
        actualRatioToBaseSnapshot == null ||
        !actualUomNameSnapshot
      ) {
        const msg = "后端未返回实际包装单位信息";
        setScanError(msg);
        throw new Error(msg);
      }

      const matchedLine = selectedDetail.lines.find(
        (line) => line.line_no === result.matched_line_no,
      );
      if (!matchedLine) {
        const msg = "后端已命中任务行，但当前页面未找到该任务行";
        setScanError(msg);
        throw new Error(msg);
      }

      setEntriesByLineNo((prev) => {
        const currentRows =
          prev[lineNo] ??
          buildPresetEntriesFromUoms(uomOptionsByLineNo[lineNo] ?? []);
        return {
          ...prev,
          [lineNo]: applyResolvedScanToFixedRows(currentRows, {
            barcode,
            actual_item_uom_id: actualItemUomId,
            actual_uom_name_snapshot: actualUomNameSnapshot,
            actual_ratio_to_base_snapshot: actualRatioToBaseSnapshot,
          }),
        };
      });

      const itemName =
        result.item_name_snapshot ||
        matchedLine.item_name_snapshot ||
        `商品 ${matchedLine.item_id}`;

      setScanSuccess(
        `第 ${lineNo} 行识别成功：${itemName} · ${actualUomNameSnapshot}，本次数量自动 +1`,
      );
    } catch (error) {
      const msg = getErrorMessage(error, "识别失败");
      setScanError(msg);
      throw (error instanceof Error ? error : new Error(msg));
    } finally {
      setResolvingEntryKey(null);
    }
  }

  async function handleSubmit() {
    if (!selectedDetail) {
      setSubmitError("请先选择退货收货单");
      return;
    }

    setSubmitError("");
    setSubmitSuccess("");
    setLastSubmit(null);

    const linePayloads: ReceivingLineIn[] = [];

    for (const line of selectedDetail.lines) {
      const drafts = entriesByLineNo[line.line_no] ?? [];
      const entries: ReceivingLineIn["entries"] = [];
      const showDateFields = receivingLineShowsDateFields(line);
      const showBatchField = receivingLineShowsBatchField(line);
      const batchRequired = receivingLineRequiresBatchField(line);

      let lineActualBaseTotal = 0;

      for (const draft of drafts) {
        const touched = isEntryTouched(draft);
        const qtyText = draft.qty_inbound.trim();

        if (!touched) continue;

        if (!qtyText) {
          setSubmitError(`任务行 ${line.line_no} 存在未填写数量的实现行`);
          return;
        }

        const qty = Number(qtyText);
        if (!Number.isFinite(qty) || qty <= 0) {
          setSubmitError(`任务行 ${line.line_no} 的收货数量非法`);
          return;
        }

        if (draft.actual_item_uom_id == null) {
          setSubmitError(`任务行 ${line.line_no} 的实现行请先识别实际包装`);
          return;
        }

        const actualRatio = draft.actual_ratio_to_base_snapshot;
        if (
          actualRatio == null ||
          !Number.isFinite(actualRatio) ||
          actualRatio <= 0
        ) {
          setSubmitError(`任务行 ${line.line_no} 的实际包装倍率非法`);
          return;
        }

        const actualBase = qty * actualRatio;
        lineActualBaseTotal += actualBase;

        if (batchRequired && !draft.batch_no.trim()) {
          setSubmitError(`任务行 ${line.line_no} 需要填写批次号`);
          return;
        }

        if (
          showDateFields &&
          !draft.production_date.trim() &&
          !draft.expiry_date.trim()
        ) {
          setSubmitError(
            `任务行 ${line.line_no} 的实现行至少填写生产日期或到期日期`,
          );
          return;
        }

        entries.push({
          qty_inbound: qty,
          barcode_input: normalizeOptionalString(draft.barcode_input),
          actual_item_uom_id: draft.actual_item_uom_id,
          batch_no: showBatchField
            ? normalizeOptionalString(draft.batch_no)
            : null,
          production_date: showDateFields
            ? normalizeOptionalString(draft.production_date)
            : null,
          expiry_date: showDateFields
            ? normalizeOptionalString(draft.expiry_date)
            : null,
          remark: normalizeOptionalString(draft.remark),
        });
      }

      const remainingBase = Number(line.remaining_qty_base);
      if (
        entries.length > 0 &&
        Number.isFinite(remainingBase) &&
        lineActualBaseTotal - remainingBase > BASE_EPSILON
      ) {
        setSubmitError(
          `任务行 ${line.line_no} 的本次基础数量 ${formatQty(
            lineActualBaseTotal,
          )} 不能超过待收基础数量 ${formatQty(line.remaining_qty_base)}`,
        );
        return;
      }

      if (entries.length > 0) {
        linePayloads.push({
          receipt_line_no: line.line_no,
          entries,
        });
      }
    }

    if (linePayloads.length === 0) {
      setSubmitError("请至少填写一条本次收货实现行");
      return;
    }

    const payload: ReceivingSubmitIn = {
      receipt_no: selectedDetail.receipt_no,
      remark: normalizeOptionalString(remark),
      lines: linePayloads,
    };

    setSubmitting(true);
    try {
      const out = await submitReceiving(payload);
      setLastSubmit(out);
      setSubmitSuccess(`提交成功：操作单 #${out.id}`);
      setRemark("");
      setEntriesByLineNo(buildEmptyEntries(selectedDetail, uomOptionsByLineNo));
      setScanError("");
      setScanSuccess("");
      await m.refreshDetail(selectedDetail.receipt_no);
      m.reload();
    } catch (err) {
      setSubmitError(getErrorMessage(err, "提交退货收货失败"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 p-6">
      <PageTitle
        title="退货收货"
        description="上卡选择退货来源的已发布收货单，并直接录入本次收货数量、批次、生产日期等。"
      />

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">收货录入</div>
          <div className="text-xs text-slate-500">
            先选择退货收货单。系统会展开该收货单的收货行，并在上卡直接补录本次数量、批次号、生产日期、到期日期和备注。
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-1 text-xs text-slate-600 xl:col-span-2">
            <span>退货收货单</span>
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
              value={selectedReceiptNo}
              disabled={m.loading}
              onChange={(e) => {
                const next = e.target.value;
                setSelectedReceiptNo(next);
                if (next) {
                  void m.toggleExpand(next);
                }
              }}
            >
              <option value="">
                {m.loading ? "收货单加载中…" : "请选择退货收货单"}
              </option>
              {m.rows.map((row) => (
                <option key={row.receipt_id} value={row.receipt_no}>
                  {row.receipt_no} · {row.source_doc_no_snapshot || "-"} ·{" "}
                  {row.counterparty_name_snapshot || "退货来源"}
                </option>
              ))}
            </select>
          </label>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs text-slate-500">来源</div>
            <div className="text-sm text-slate-900">
              {selectedRow ? formatReceivingSourceType(selectedRow.source_type) : "-"}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs text-slate-500">状态</div>
            <div className="text-sm text-slate-900">
              {selectedRow ? formatReceivingStatus(selectedRow.status) : "-"}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs text-slate-500">来源单号</div>
            <div className="text-sm text-slate-900">
              {selectedRow?.source_doc_no_snapshot || "-"}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs text-slate-500">仓库</div>
            <div className="text-sm text-slate-900">
              {selectedRow
                ? selectedRow.warehouse_name_snapshot || `仓库 ${selectedRow.warehouse_id}`
                : "-"}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs text-slate-500">对方</div>
            <div className="text-sm text-slate-900">
              {selectedRow?.counterparty_name_snapshot || "-"}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs text-slate-500">发布时间</div>
            <div className="text-sm text-slate-900">
              {selectedRow ? formatDateTime(selectedRow.released_at) : "-"}
            </div>
          </div>
        </div>

        {m.error ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {m.error}
          </div>
        ) : null}

        {selectedReceiptNo ? (
          <section className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">本次收货录入</div>

            {m.detailLoadingByReceiptNo[selectedReceiptNo] ? (
              <div className="text-sm text-slate-500">正在展开收货单…</div>
            ) : null}

            {m.detailErrorByReceiptNo[selectedReceiptNo] ? (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {m.detailErrorByReceiptNo[selectedReceiptNo]}
              </div>
            ) : null}

            {selectedDetail ? (
              <>
                <label className="block space-y-1 text-xs text-slate-600">
                  <span>整单备注</span>
                  <textarea
                    className="min-h-20 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    placeholder="本次收货整单备注（可选）"
                  />
                </label>

                {scanError ? (
                  <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {scanError}
                  </div>
                ) : null}

                {scanSuccess ? (
                  <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    {scanSuccess}
                  </div>
                ) : null}

                <ReceivingEditableBatchLines
                  lines={selectedDetail.lines}
                  entriesByLineNo={entriesByLineNo}
                  uomOptionsByLineNo={uomOptionsByLineNo}
                  resolvingEntryKey={resolvingEntryKey}
                  onResolveBarcode={handleResolveBarcodeAtEntry}
                  onSelectActualUom={() => {}}
                  showRemarkField={true}
                  showLineHint={false}
                  fixedRowsByUom={true}
                  onAddEntry={() => {}}
                  onRemoveEntry={() => {}}
                  onChangeEntry={(lineNo, index, patch) => {
                    setEntriesByLineNo((prev) => {
                      const rows = [...(prev[lineNo] ?? [])];
                      const current = rows[index] ?? createEmptyReceivingEntryDraft();
                      rows[index] = { ...current, ...patch };
                      return { ...prev, [lineNo]: rows };
                    });
                  }}
                />

                {submitError ? (
                  <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {submitError}
                  </div>
                ) : null}

                {submitSuccess ? (
                  <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    {submitSuccess}
                  </div>
                ) : null}

                {lastSubmit ? (
                  <div className="text-xs text-slate-500">
                    最近提交：操作单 #{lastSubmit.id} / 操作时间 {lastSubmit.operated_at}
                  </div>
                ) : null}

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    className="rounded-md border border-slate-300 px-3 py-1 text-xs hover:bg-white"
                    disabled={submitting}
                    onClick={() => {
                      void m.refreshDetail(selectedDetail.receipt_no);
                    }}
                  >
                    刷新当前收货单
                  </button>
                  <button
                    type="button"
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-60"
                    disabled={submitting}
                    onClick={() => {
                      void handleSubmit();
                    }}
                  >
                    {submitting ? "提交中…" : "提交退货收货"}
                  </button>
                </div>
              </>
            ) : null}
          </section>
        ) : null}
      </section>
    </div>
  );
};

export default ReceivingReturnsPage;
