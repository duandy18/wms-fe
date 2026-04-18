import React, { useEffect, useMemo, useState } from "react";
import PageTitle from "../../../../components/ui/PageTitle";
import { submitReceiving } from "../api/receivingApi";
import ReceivingEditableBatchLines from "../components/ReceivingEditableBatchLines";
import ReceivingInlineDetail from "../components/ReceivingInlineDetail";
import {
  createEmptyReceivingEntryDraft,
  formatReceivingSourceType,
  formatReceivingStatus,
  type ReceivingEntryDraft,
  type ReceivingLineIn,
  type ReceivingSubmitIn,
  type ReceivingSubmitOut,
  type ReceivingTaskReadOut,
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
      entry.batch_no.trim() ||
      entry.production_date.trim() ||
      entry.expiry_date.trim() ||
      entry.remark.trim(),
  );
}

function buildEmptyEntries(detail: ReceivingTaskReadOut): Record<number, ReceivingEntryDraft[]> {
  const next: Record<number, ReceivingEntryDraft[]> = {};
  for (const line of detail.lines) {
    next[line.line_no] = [createEmptyReceivingEntryDraft()];
  }
  return next;
}

const ReceivingManualPage: React.FC = () => {
  const m = useReceivingSummaryPage("MANUAL");
  const [selectedReceiptNo, setSelectedReceiptNo] = useState("");
  const [remark, setRemark] = useState("");
  const [entriesByLineNo, setEntriesByLineNo] = useState<Record<number, ReceivingEntryDraft[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [lastSubmit, setLastSubmit] = useState<ReceivingSubmitOut | null>(null);

  const selectedRow = useMemo(() => {
    return m.rows.find((row) => row.receipt_no === selectedReceiptNo) ?? null;
  }, [m.rows, selectedReceiptNo]);

  const selectedDetail = useMemo(() => {
    return selectedReceiptNo ? (m.detailByReceiptNo[selectedReceiptNo] ?? null) : null;
  }, [m.detailByReceiptNo, selectedReceiptNo]);

  useEffect(() => {
    setRemark("");
    setSubmitError("");
    setSubmitSuccess("");
    setLastSubmit(null);
    setEntriesByLineNo({});
  }, [selectedReceiptNo]);

  useEffect(() => {
    if (!selectedDetail) return;
    setEntriesByLineNo((prev) => {
      const next: Record<number, ReceivingEntryDraft[]> = {};
      for (const line of selectedDetail.lines) {
        const current = prev[line.line_no];
        next[line.line_no] =
          current && current.length > 0 ? current : [createEmptyReceivingEntryDraft()];
      }
      return next;
    });
  }, [selectedDetail]);

  async function handleSubmit() {
    if (!selectedDetail) {
      setSubmitError("请先选择手动收货单");
      return;
    }

    setSubmitError("");
    setSubmitSuccess("");
    setLastSubmit(null);

    const linePayloads: ReceivingLineIn[] = [];

    for (const line of selectedDetail.lines) {
      const drafts = entriesByLineNo[line.line_no] ?? [];
      const entries = [];

      for (const draft of drafts) {
        const touched = isEntryTouched(draft);
        const qtyText = draft.qty_inbound.trim();

        if (!touched) continue;

        if (!qtyText) {
          setSubmitError(`任务行 ${line.line_no} 存在未填写数量的批次子行`);
          return;
        }

        const qty = Number(qtyText);
        if (!Number.isFinite(qty) || qty <= 0) {
          setSubmitError(`任务行 ${line.line_no} 的收货数量非法`);
          return;
        }

        entries.push({
          qty_inbound: qty,
          batch_no: normalizeOptionalString(draft.batch_no),
          production_date: normalizeOptionalString(draft.production_date),
          expiry_date: normalizeOptionalString(draft.expiry_date),
          remark: normalizeOptionalString(draft.remark),
        });
      }

      if (entries.length > 0) {
        linePayloads.push({
          receipt_line_no: line.line_no,
          entries,
        });
      }
    }

    if (linePayloads.length === 0) {
      setSubmitError("请至少填写一条本次收货批次子行");
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
      setEntriesByLineNo(buildEmptyEntries(selectedDetail));
      await m.refreshDetail(selectedDetail.receipt_no);
      m.reload();
    } catch (err) {
      setSubmitError(getErrorMessage(err, "提交手动收货失败"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 p-6">
      <PageTitle
        title="手动收货"
        description="上卡选择手动来源的已发布收货单，并直接录入本次收货数量、批次、生产日期等；下卡展示当前收货情况。"
      />

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">收货录入</div>
          <div className="text-xs text-slate-500">
            先选择手动收货单。系统会展开该收货单的收货行，并在上卡直接补录本次数量、批次号、生产日期、到期日期和备注。
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-1 text-xs text-slate-600 xl:col-span-2">
            <span>手动收货单</span>
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
                {m.loading ? "收货单加载中…" : "请选择手动收货单"}
              </option>
              {m.rows.map((row) => (
                <option key={row.receipt_id} value={row.receipt_no}>
                  {row.receipt_no} · {row.counterparty_name_snapshot || "手动来源"}
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
            <div className="text-xs text-slate-500">收货单号</div>
            <div className="text-sm text-slate-900">
              {selectedRow?.receipt_no || "-"}
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

                <ReceivingEditableBatchLines
                  lines={selectedDetail.lines}
                  entriesByLineNo={entriesByLineNo}

                  resolvingEntryKey={null}

                  onResolveBarcode={async () => {}}
                  uomOptionsByLineNo={{}}
                  onSelectActualUom={() => {}}
                  onAddEntry={(lineNo) => {
                    setEntriesByLineNo((prev) => ({
                      ...prev,
                      [lineNo]: [...(prev[lineNo] ?? []), createEmptyReceivingEntryDraft()],
                    }));
                  }}
                  onRemoveEntry={(lineNo, index) => {
                    setEntriesByLineNo((prev) => {
                      const rows = [...(prev[lineNo] ?? [])];
                      rows.splice(index, 1);
                      return {
                        ...prev,
                        [lineNo]: rows.length > 0 ? rows : [createEmptyReceivingEntryDraft()],
                      };
                    });
                  }}
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
                    {submitting ? "提交中…" : "提交手动收货"}
                  </button>
                </div>
              </>
            ) : null}
          </section>
        ) : null}
      </section>

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">当前收货情况</div>
          <div className="text-xs text-slate-500">
            展示当前收货单的收货行、累计已收和剩余待收。
          </div>
        </div>

        {!selectedReceiptNo ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            请先在上方选择手动收货单。
          </div>
        ) : (
          <ReceivingInlineDetail
            detail={m.detailByReceiptNo[selectedReceiptNo] ?? null}
            loading={Boolean(m.detailLoadingByReceiptNo[selectedReceiptNo])}
            error={m.detailErrorByReceiptNo[selectedReceiptNo] ?? ""}
          />
        )}
      </section>
    </div>
  );
};

export default ReceivingManualPage;
