import React from "react";
import type { OutboundLotCandidateOut } from "../contracts/outbound";
import { formatDate } from "../contracts/outbound";
import type { ResolvedManualOutboundLineInfo } from "../model/useOutboundManualPage";

export interface OutboundExecutionEditableLine {
  id: number;
  lineNo: number;
  itemId: number;
  itemName: string | null;
  itemSku: string | null;
  itemSpec: string | null;
  uomName: string | null;
  plannedQty: number;
}

type Props = {
  lines: OutboundExecutionEditableLine[];
  emptyText: string;
  barcodeByLineId: Record<number, string>;
  qtyByLineId: Record<number, string>;
  hintByLineId: Record<number, string>;
  resolvedByLineId: Record<number, ResolvedManualOutboundLineInfo>;
  lotCandidatesByLineId: Record<number, OutboundLotCandidateOut[]>;
  selectedLotByLineId: Record<number, OutboundLotCandidateOut>;
  resolvingLineId: number | null;
  submitLocked: boolean;
  onChangeBarcode: (lineId: number, value: string) => void;
  onResolveBarcode: (lineId: number) => void;
  onChangeQty: (lineId: number, value: string) => void;
  onSelectLot: (lineId: number, lotId: number) => void;
};

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
  if (qty <= 0 || ratio <= 0) return "-";
  const total = qty * ratio;
  return Number.isInteger(total) ? String(total) : String(total);
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

function formatLotLabel(candidate: OutboundLotCandidateOut): string {
  if (candidate.lot_code && candidate.lot_code.trim()) {
    return candidate.lot_code.trim();
  }
  return `内部 lot #${candidate.lot_id}`;
}

const OutboundExecutionEditableLines: React.FC<Props> = ({
  lines,
  emptyText,
  barcodeByLineId,
  qtyByLineId,
  hintByLineId,
  resolvedByLineId,
  lotCandidatesByLineId,
  selectedLotByLineId,
  resolvingLineId,
  submitLocked,
  onChangeBarcode,
  onResolveBarcode,
  onChangeQty,
  onSelectLot,
}) => {
  if (lines.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
        {emptyText}
      </div>
    );
  }

  return (
    <section className="space-y-4">
      {lines.map((line) => {
        const resolved = resolvedByLineId[line.id] ?? null;
        const lotCandidates = lotCandidatesByLineId[line.id] ?? [];
        const selectedLot = selectedLotByLineId[line.id] ?? null;
        const isResolving = resolvingLineId === line.id;
        const actualBaseQty = formatBaseQty(
          qtyByLineId[line.id],
          resolved?.ratioToBase,
        );
        const actualItemName = resolved?.itemName || "";
        const actualItemSpec = resolved?.itemSpec || "";
        const actualUomName = resolved?.uomName || "";

        return (
          <section
            key={line.id}
            className="space-y-3 rounded-xl border border-slate-200 bg-white p-4"
          >
            <div>
              <div className="text-sm font-semibold text-slate-900">
                第 {line.lineNo} 行 · {line.itemName || "未命名商品"}
              </div>
              <div className="text-xs text-slate-500">
                上行看单据行参考，下行填实现；扫码后读取当前单据仓库下的可用 lot。
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="mb-2 text-xs font-semibold tracking-wide text-slate-500">
                单据行参考
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-5">
                <div className="space-y-1">
                  <div className="text-xs text-slate-500">商品</div>
                  <div className="text-sm font-medium text-slate-900">
                    {line.itemName || "-"}
                  </div>
                  <div className="text-xs text-slate-500">
                    SKU：{line.itemSku || "-"}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-slate-500">规格</div>
                  <div className="text-sm text-slate-900">
                    {line.itemSpec || "-"}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-slate-500">申请单位</div>
                  <div className="text-sm text-slate-900">
                    {line.uomName || "-"}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-slate-500">申请数量</div>
                  <div className="text-sm font-medium text-slate-900">
                    {line.plannedQty}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-slate-500">识别约束</div>
                  <div className="text-sm text-slate-900">
                    条码识别后必须与单据行商品一致
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="mb-2 text-xs font-semibold tracking-wide text-slate-500">
                实际出库录入
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-6">
                <div className="space-y-1">
                  <div className="text-xs text-slate-500">扫码 / 手输识别</div>
                  <div className="flex gap-2">
                    <input
                      className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900 disabled:bg-slate-100 disabled:text-slate-400"
                      value={barcodeByLineId[line.id] ?? ""}
                      onChange={(e) => onChangeBarcode(line.id, e.target.value)}
                      placeholder={submitLocked ? "提交中…" : "在本行扫码或手输条码后识别"}
                      disabled={submitLocked}
                    />
                    <button
                      type="button"
                      className="rounded-md border border-slate-300 px-3 py-2 text-xs hover:bg-slate-50 disabled:opacity-60"
                      onClick={() => onResolveBarcode(line.id)}
                      disabled={isResolving || submitLocked}
                    >
                      {isResolving ? "识别中…" : "识别"}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-slate-500">实际商品</div>
                  {renderReadonlyValue(actualItemName, "未开始出库")}
                  <div className="text-xs text-slate-500">
                    {resolved?.itemSku ? `SKU：${resolved.itemSku}` : "-"}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-slate-500">实际规格</div>
                  {renderReadonlyValue(actualItemSpec, "未开始出库")}
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-slate-500">实际单位</div>
                  {renderReadonlyValue(actualUomName, "未识别")}
                  <div className="text-xs text-slate-500">
                    {resolved?.ratioToBase != null
                      ? `包装倍率 × ${resolved.ratioToBase}`
                      : "-"}
                  </div>
                </div>

                <label className="space-y-1 text-xs text-slate-600">
                  <span>本次出库</span>
                  <input
                    className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-right text-sm text-slate-900 disabled:bg-slate-100 disabled:text-slate-400"
                    value={qtyByLineId[line.id] ?? ""}
                    onChange={(e) => onChangeQty(line.id, e.target.value)}
                    placeholder={selectedLot ? "0" : "请先选择 lot"}
                    inputMode="numeric"
                    disabled={!selectedLot || submitLocked}
                  />
                </label>

                <div className="space-y-1">
                  <div className="text-xs text-slate-500">实出基础数量</div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 px-2 py-2 text-sm text-slate-900">
                    {actualBaseQty}
                  </div>
                </div>
              </div>

              <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                {hintByLineId[line.id] || "等待扫码识别。"}
              </div>

              {resolved ? (
                <div className="mt-3 space-y-3">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="mb-2 text-xs font-semibold tracking-wide text-slate-500">
                      lot 候选
                    </div>

                    {lotCandidates.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {lotCandidates.map((candidate) => {
                          const isSelected =
                            selectedLot?.lot_id === candidate.lot_id;

                          return (
                            <button
                              key={candidate.lot_id}
                              type="button"
                              className={`rounded-lg border px-3 py-3 text-left transition ${
                                isSelected
                                  ? "border-slate-900 bg-white"
                                  : "border-slate-200 bg-white hover:border-slate-300"
                              } disabled:cursor-not-allowed disabled:opacity-60`}
                              onClick={() =>
                                onSelectLot(line.id, candidate.lot_id)
                              }
                              disabled={submitLocked}
                            >
                              <div className="text-sm font-medium text-slate-900">
                                {formatLotLabel(candidate)}
                              </div>
                              <div className="mt-1 text-xs text-slate-500">
                                生产日期：{formatDate(candidate.production_date)}
                              </div>
                              <div className="text-xs text-slate-500">
                                到期日期：{formatDate(candidate.expiry_date)}
                              </div>
                              <div className="mt-2 text-xs text-slate-600">
                                可出数量：{candidate.available_qty}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500">
                        当前单据仓库暂无可用 lot。
                      </div>
                    )}
                  </div>

                  {selectedLot ? (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <div className="mb-2 text-xs font-semibold tracking-wide text-slate-500">
                        已选 lot
                      </div>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <div>
                          <div className="text-xs text-slate-500">批次 / lot</div>
                          <div className="text-sm text-slate-900">
                            {formatLotLabel(selectedLot)}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-slate-500">生产日期</div>
                          <div className="text-sm text-slate-900">
                            {formatDate(selectedLot.production_date)}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-slate-500">到期日期</div>
                          <div className="text-sm text-slate-900">
                            {formatDate(selectedLot.expiry_date)}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-slate-500">可出数量</div>
                          <div className="text-sm text-slate-900">
                            {selectedLot.available_qty}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </section>
        );
      })}
    </section>
  );
};

export default OutboundExecutionEditableLines;
