import React, { useState } from "react";
import {
  type ReceivingActualUomOption,
  type ReceivingEntryDraft,
  type ReceivingTaskLineOut,
  receivingLineRequiresBatchField,
  receivingLineShowsBatchField,
  receivingLineShowsDateFields,
} from "../contracts/receiving";
import { formatQty } from "../utils/fixedRows";

type SharedProps = {
  lines: ReceivingTaskLineOut[];
  entriesByLineNo: Record<number, ReceivingEntryDraft[]>;
  uomOptionsByLineNo: Record<number, ReceivingActualUomOption[]>;
  resolvingEntryKey: string | null;
  onChangeEntry: (
    lineNo: number,
    index: number,
    patch: Partial<ReceivingEntryDraft>,
  ) => void;
  onResolveBarcode: (
    lineNo: number,
    index: number,
    barcode: string,
  ) => Promise<void>;
  showRemarkField?: boolean;
  showLineHint?: boolean;
};

type FixedRowsProps = SharedProps & {
  fixedRowsByUom: true;
};

type EditableRowsProps = SharedProps & {
  fixedRowsByUom?: false;
  onAddEntry: (lineNo: number) => void;
  onRemoveEntry: (lineNo: number, index: number) => void;
  onSelectActualUom: (
    lineNo: number,
    index: number,
    actualItemUomId: number | null,
  ) => void;
};

type Props = FixedRowsProps | EditableRowsProps;

function toSafeNumber(value: string | number | null | undefined): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function formatBaseQty(
  qtyValue: string | number | null | undefined,
  ratioValue: string | number | null | undefined,
): string {
  const qty = toSafeNumber(qtyValue);
  const ratio = toSafeNumber(ratioValue);
  return formatQty(qty * ratio);
}

function renderReadonlyValue(
  value: string,
  placeholder: string,
): React.ReactElement {
  const hasValue = value.trim().length > 0;
  return (
    <div
      className={`rounded-md border px-2 py-2 text-sm ${
        hasValue
          ? "border-slate-200 bg-slate-50 text-slate-900"
          : "border-dashed border-slate-200 bg-slate-50 text-slate-400"
      }`}
    >
      {hasValue ? value : placeholder}
    </div>
  );
}

const ReceivingEditableBatchLines: React.FC<Props> = (props) => {
  const {
    lines,
    entriesByLineNo,
    uomOptionsByLineNo,
    resolvingEntryKey,
    onChangeEntry,
    onResolveBarcode,
    showRemarkField = true,
    showLineHint = true,
  } = props;

  const fixedRowsByUom = props.fixedRowsByUom === true;
  const [scanInputs, setScanInputs] = useState<Record<string, string>>({});

  function getScanInputValue(
    lineNo: number,
    index: number,
    entry: ReceivingEntryDraft,
  ): string {
    const key = `${lineNo}-${index}`;
    const local = scanInputs[key];
    if (typeof local === "string") return local;
    return entry.barcode_input;
  }

  function setScanInputValue(lineNo: number, index: number, value: string) {
    const key = `${lineNo}-${index}`;
    setScanInputs((prev) => ({ ...prev, [key]: value }));
  }

  async function handleResolveCurrent(
    lineNo: number,
    index: number,
    entry: ReceivingEntryDraft,
  ) {
    const barcode = getScanInputValue(lineNo, index, entry).trim();
    if (!barcode) return;
    await onResolveBarcode(lineNo, index, barcode);
    setScanInputs((prev) => ({ ...prev, [`${lineNo}-${index}`]: barcode }));
  }

  return (
    <section className="space-y-4">
      {lines.map((line) => {
        const entries = entriesByLineNo[line.line_no] ?? [];
        const uomOptions = uomOptionsByLineNo[line.line_no] ?? [];
        const showDateFields = receivingLineShowsDateFields(line);
        const showBatchField = receivingLineShowsBatchField(line);
        const batchRequired = receivingLineRequiresBatchField(line);

        const plannedBaseQty = formatQty(line.planned_qty_base);
        const receivedBaseQty = formatQty(line.received_qty_base);
        const remainingBaseQty = formatQty(line.remaining_qty_base);

        return (
          <section
            key={line.line_no}
            className="space-y-3 rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  行 {line.line_no} · {line.item_name_snapshot || `商品 ${line.item_id}`}
                </div>
                {showLineHint ? (
                  <div className="text-xs text-slate-500">
                    上行看计划，下行填实现；采购收货页按包装固定展开多行。
                  </div>
                ) : null}
              </div>

              {!fixedRowsByUom ? (
                <button
                  type="button"
                  className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
                  onClick={() => props.onAddEntry(line.line_no)}
                >
                  新增实现行
                </button>
              ) : null}
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="mb-2 text-xs font-semibold tracking-wide text-slate-500">
                计划
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-7">
                <div className="space-y-1">
                  <div className="text-xs text-slate-500">商品</div>
                  <div className="text-sm font-medium text-slate-900">
                    {line.item_name_snapshot || `商品 ${line.item_id}`}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-slate-500">规格</div>
                  <div className="text-sm text-slate-900">
                    {line.item_spec_snapshot || "-"}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-slate-500">计划包装单位</div>
                  <div className="text-sm text-slate-900">
                    {line.uom_name_snapshot || "-"}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-slate-500">计划数量</div>
                  <div className="text-sm text-slate-900">
                    {formatQty(line.planned_qty)} {line.uom_name_snapshot || ""}
                  </div>
                  <div className="text-xs text-slate-500">
                    基础数量：{plannedBaseQty}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-slate-500">已收数量</div>
                  <div className="text-sm text-slate-900">
                    {formatQty(line.received_qty)} {line.uom_name_snapshot || ""}
                  </div>
                  <div className="text-xs text-slate-500">
                    基础数量：{receivedBaseQty}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-slate-500">待收数量</div>
                  <div className="text-sm font-medium text-slate-900">
                    {formatQty(line.remaining_qty)} {line.uom_name_snapshot || ""}
                  </div>
                  <div className="text-xs text-slate-500">
                    基础数量：{remainingBaseQty}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-slate-500">收货规则</div>
                  <div className="text-sm text-slate-900">
                    {showBatchField
                      ? batchRequired
                        ? "需批次"
                        : "可填批次"
                      : "无需批次"}
                    {showDateFields ? " · 需日期" : " · 无需日期"}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {entries.map((entry, index) => {
                const entryKey = `${line.line_no}-${index}`;
                const isResolving = resolvingEntryKey === entryKey;
                const actualCols =
                  showBatchField && showDateFields
                    ? "grid-cols-1 md:grid-cols-3 xl:grid-cols-8"
                    : showBatchField || showDateFields
                      ? "grid-cols-1 md:grid-cols-3 xl:grid-cols-7"
                      : "grid-cols-1 md:grid-cols-3 xl:grid-cols-6";

                const actualBaseQty = entry.qty_inbound.trim()
                  ? formatBaseQty(
                      entry.qty_inbound,
                      entry.actual_ratio_to_base_snapshot,
                    )
                  : "-";

                const hasActualActivity = Boolean(
                  entry.barcode_input.trim() ||
                    entry.qty_inbound.trim() ||
                    entry.batch_no.trim() ||
                    entry.production_date.trim() ||
                    entry.expiry_date.trim() ||
                    entry.remark.trim(),
                );

                const actualItemName = hasActualActivity
                  ? line.item_name_snapshot || `商品 ${line.item_id}`
                  : "";

                const fixedUomLabel =
                  entry.actual_uom_name_snapshot ||
                  uomOptions.find(
                    (opt) => opt.actual_item_uom_id === entry.actual_item_uom_id,
                  )?.actual_uom_name_snapshot ||
                  "";

                return (
                  <div
                    key={entryKey}
                    className="rounded-lg border border-slate-200 bg-white p-3"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-xs font-semibold tracking-wide text-slate-500">
                        实现
                        {fixedRowsByUom && fixedUomLabel ? ` · ${fixedUomLabel}` : ""}
                        {!fixedRowsByUom && entries.length > 1 ? ` ${index + 1}` : ""}
                      </div>

                      {!fixedRowsByUom ? (
                        <button
                          type="button"
                          className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50 disabled:opacity-50"
                          disabled={entries.length <= 1}
                          onClick={() => props.onRemoveEntry(line.line_no, index)}
                        >
                          删除实现行
                        </button>
                      ) : null}
                    </div>

                    <div className={`grid gap-3 ${actualCols}`}>
                      <div className="space-y-1">
                        <div className="text-xs text-slate-500">扫码/手输识别</div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900"
                            placeholder="在本行扫码或手输后回车"
                            value={getScanInputValue(line.line_no, index, entry)}
                            onChange={(e) =>
                              setScanInputValue(
                                line.line_no,
                                index,
                                e.target.value,
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                void handleResolveCurrent(
                                  line.line_no,
                                  index,
                                  entry,
                                );
                              }
                            }}
                          />
                          <button
                            type="button"
                            className="rounded-md border border-slate-300 px-3 py-2 text-xs hover:bg-slate-50 disabled:opacity-50"
                            disabled={isResolving}
                            onClick={() => {
                              void handleResolveCurrent(line.line_no, index, entry);
                            }}
                          >
                            {isResolving ? "识别中…" : "识别"}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs text-slate-500">实际商品</div>
                        {renderReadonlyValue(actualItemName, "未开始收货")}
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs text-slate-500">实际包装单位</div>
                        {fixedRowsByUom ? (
                          renderReadonlyValue(fixedUomLabel, "未配置包装")
                        ) : (
                          <select
                            className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900"
                            value={
                              entry.actual_item_uom_id != null
                                ? String(entry.actual_item_uom_id)
                                : ""
                            }
                            onChange={(e) => {
                              const next = e.target.value.trim();
                              props.onSelectActualUom(
                                line.line_no,
                                index,
                                next ? Number(next) : null,
                              );
                            }}
                          >
                            <option value="">请选择实际包装单位</option>
                            {uomOptions.map((opt) => (
                              <option
                                key={opt.actual_item_uom_id}
                                value={opt.actual_item_uom_id}
                              >
                                {opt.actual_uom_name_snapshot} ×
                                {opt.actual_ratio_to_base_snapshot}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      <label className="space-y-1 text-xs text-slate-600">
                        <span>本次数量</span>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900"
                          value={entry.qty_inbound}
                          onChange={(e) =>
                            onChangeEntry(line.line_no, index, {
                              qty_inbound: e.target.value,
                            })
                          }
                        />
                      </label>

                      <div className="space-y-1">
                        <div className="text-xs text-slate-500">实收基础数量</div>
                        <div className="rounded-md border border-slate-200 bg-slate-50 px-2 py-2 text-sm text-slate-900">
                          {actualBaseQty}
                        </div>
                      </div>

                      {showBatchField ? (
                        <label className="space-y-1 text-xs text-slate-600">
                          <span>{batchRequired ? "批次号（必填）" : "批次号"}</span>
                          <input
                            type="text"
                            className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900"
                            value={entry.batch_no}
                            onChange={(e) =>
                              onChangeEntry(line.line_no, index, {
                                batch_no: e.target.value,
                              })
                            }
                          />
                        </label>
                      ) : null}

                      {showDateFields ? (
                        <label className="space-y-1 text-xs text-slate-600">
                          <span>生产日期</span>
                          <input
                            type="date"
                            className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900"
                            value={entry.production_date}
                            onChange={(e) =>
                              onChangeEntry(line.line_no, index, {
                                production_date: e.target.value,
                              })
                            }
                          />
                        </label>
                      ) : null}

                      {showDateFields ? (
                        <label className="space-y-1 text-xs text-slate-600">
                          <span>到期日期</span>
                          <input
                            type="date"
                            className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900"
                            value={entry.expiry_date}
                            onChange={(e) =>
                              onChangeEntry(line.line_no, index, {
                                expiry_date: e.target.value,
                              })
                            }
                          />
                        </label>
                      ) : null}

                      {showRemarkField ? (
                        <label
                          className={`space-y-1 text-xs text-slate-600 ${
                            showBatchField && showDateFields ? "xl:col-span-2" : ""
                          }`}
                        >
                          <span>备注</span>
                          <input
                            type="text"
                            className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900"
                            value={entry.remark}
                            onChange={(e) =>
                              onChangeEntry(line.line_no, index, {
                                remark: e.target.value,
                              })
                            }
                          />
                        </label>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </section>
  );
};

export default ReceivingEditableBatchLines;
