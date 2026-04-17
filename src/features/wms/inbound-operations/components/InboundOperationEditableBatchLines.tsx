import React from "react";
import type {
  InboundOperationEntryDraft,
  InboundTaskLineOut,
} from "../contracts/inboundOperation";

type Props = {
  lines: InboundTaskLineOut[];
  entriesByLineNo: Record<number, InboundOperationEntryDraft[]>;
  onAddEntry: (lineNo: number) => void;
  onRemoveEntry: (lineNo: number, index: number) => void;
  onChangeEntry: (
    lineNo: number,
    index: number,
    patch: Partial<InboundOperationEntryDraft>,
  ) => void;
};

const InboundOperationEditableBatchLines: React.FC<Props> = ({
  lines,
  entriesByLineNo,
  onAddEntry,
  onRemoveEntry,
  onChangeEntry,
}) => {
  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-sm font-semibold text-slate-900">本次收货批次子行</div>

      {lines.map((line) => {
        const entries = entriesByLineNo[line.line_no] ?? [];
        return (
          <section
            key={line.line_no}
            className="space-y-3 rounded-lg border border-slate-200 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-900">
                  行 {line.line_no} · {line.item_name_snapshot || `商品 ${line.item_id}`}
                </div>
                <div className="text-xs text-slate-500">
                  剩余待收：{line.remaining_qty} {line.uom_name_snapshot || ""}
                </div>
              </div>
              <button
                type="button"
                className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
                onClick={() => onAddEntry(line.line_no)}
              >
                新增批次子行
              </button>
            </div>

            <div className="space-y-3">
              {entries.map((entry, index) => (
                <div
                  key={`${line.line_no}-${index}`}
                  className="grid grid-cols-1 gap-3 rounded-md border border-slate-100 bg-slate-50 p-3 md:grid-cols-5 xl:grid-cols-6"
                >
                  <label className="space-y-1 text-xs text-slate-600">
                    <span>本次数量</span>
                    <input
                      type="number"
                      step="0.0001"
                      className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900"
                      value={entry.qty_inbound}
                      onChange={(e) =>
                        onChangeEntry(line.line_no, index, { qty_inbound: e.target.value })
                      }
                    />
                  </label>

                  <label className="space-y-1 text-xs text-slate-600">
                    <span>批次号</span>
                    <input
                      type="text"
                      className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900"
                      value={entry.batch_no}
                      onChange={(e) =>
                        onChangeEntry(line.line_no, index, { batch_no: e.target.value })
                      }
                    />
                  </label>

                  <label className="space-y-1 text-xs text-slate-600">
                    <span>生产日期</span>
                    <input
                      type="date"
                      className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900"
                      value={entry.production_date}
                      onChange={(e) =>
                        onChangeEntry(line.line_no, index, { production_date: e.target.value })
                      }
                    />
                  </label>

                  <label className="space-y-1 text-xs text-slate-600">
                    <span>到期日期</span>
                    <input
                      type="date"
                      className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900"
                      value={entry.expiry_date}
                      onChange={(e) =>
                        onChangeEntry(line.line_no, index, { expiry_date: e.target.value })
                      }
                    />
                  </label>

                  <label className="space-y-1 text-xs text-slate-600 xl:col-span-2">
                    <span>备注</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900"
                        value={entry.remark}
                        onChange={(e) =>
                          onChangeEntry(line.line_no, index, { remark: e.target.value })
                        }
                      />
                      <button
                        type="button"
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-white disabled:opacity-50"
                        disabled={entries.length <= 1}
                        onClick={() => onRemoveEntry(line.line_no, index)}
                      >
                        删除
                      </button>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </section>
  );
};

export default InboundOperationEditableBatchLines;
