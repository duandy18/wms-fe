// src/features/admin/stores/components/StoreOrderMerchantInputsCard.tsx

import React, { useMemo } from "react";
import type { OrderSimFilledCodeOption } from "../api";
import { FilledCodeCombobox, type ComboPick } from "./order-sim/FilledCodeCombobox";
import { deriveValidMerchantLines, hasAnyNonEmptyMerchantLine } from "./order-sim/deriveValidMerchantLines";
import { isBlank, normText } from "./order-sim/textUtils";

export type MerchantOrderLineInput = {
  filled_code: string;
  title: string;
  spec: string;
};

export type MerchantOrderLineOut = {
  filled_code: string;
  title: string | null;
  spec: string | null;
};

function buildEmptyRowsLike(rows: MerchantOrderLineInput[]): MerchantOrderLineInput[] {
  const next = rows.slice(0, 6).map(() => ({ filled_code: "", title: "", spec: "" }));
  while (next.length < 6) next.push({ filled_code: "", title: "", spec: "" });
  return next;
}

export const StoreOrderMerchantInputsCard: React.FC<{
  title?: string;
  rows: MerchantOrderLineInput[];
  onChangeRows: (next: MerchantOrderLineInput[]) => void;

  // ✅ 保存（落库/落表）的唯一入口：由页面层实现（调用后端接口）
  onSave: (rows: MerchantOrderLineInput[]) => Promise<void>;
  saving: boolean;
  saveError: string | null;
  justSaved: boolean;

  // ✅ 下拉候选：只来源于后端绑定事实
  filledCodeOptions: OrderSimFilledCodeOption[];
  optionsLoading?: boolean;
  optionsError?: string | null;

  // 输出候选清单给父组件（父组件/客户卡用于选品）
  onValidLinesChange?: (validLines: MerchantOrderLineOut[]) => void;
}> = ({
  title,
  rows,
  onChangeRows,
  onSave,
  saving,
  saveError,
  justSaved,
  filledCodeOptions,
  optionsLoading,
  optionsError,
  onValidLinesChange,
}) => {
  const optionsByCode = useMemo(() => {
    const m = new Map<string, OrderSimFilledCodeOption>();
    for (const it of filledCodeOptions) m.set(normText(it.filled_code), it);
    return m;
  }, [filledCodeOptions]);

  const validLines = useMemo<MerchantOrderLineOut[]>(() => {
    return deriveValidMerchantLines(rows);
  }, [rows]);

  React.useEffect(() => {
    onValidLinesChange?.(validLines);
  }, [validLines, onValidLinesChange]);

  function updateRow(idx: number, patch: Partial<MerchantOrderLineInput>) {
    onChangeRows(rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }

  function clearRow(idx: number) {
    updateRow(idx, { filled_code: "", title: "", spec: "" });
  }

  function clearAllRows() {
    onChangeRows(buildEmptyRowsLike(rows));
  }

  function onFilledCodeChange(idx: number, raw: string) {
    updateRow(idx, { filled_code: raw });
  }

  function onFilledCodePick(idx: number, picked: ComboPick) {
    updateRow(idx, {
      filled_code: picked.filled_code,
      title: picked.suggested_title ?? "",
      spec: picked.components_summary ?? "",
    });
  }

  const hasAnyNonEmpty = useMemo(() => hasAnyNonEmptyMerchantLine(rows), [rows]);

  async function handleSave() {
    await onSave(rows);
  }

  function handleNewProduct() {
    if (saving) return;
    clearAllRows();
  }

  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-base font-semibold text-slate-900">{title ?? "商家后台：可售卖清单（固定 6 行）"}</div>
          <div className="mt-1 text-xs text-slate-500">
            规格编码从后端“已绑定填写码”候选中选择；选择后自动带出标题与规格摘要。标题可修改；规格为只读展示（不参与解析）。
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            onClick={handleNewProduct}
            disabled={saving}
            title="清空输入，开始配置新上商品（不会自动保存）"
          >
            新上商品
          </button>

          <button
            type="button"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
            onClick={() => void handleSave()}
            disabled={saving || !hasAnyNonEmpty}
          >
            {saving ? "保存中…" : "保存并生效"}
          </button>
        </div>
      </div>

      {optionsError ? (
        <div className="mt-3 rounded-md border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          填写码候选加载失败：{optionsError}
        </div>
      ) : null}

      {saveError ? (
        <div className="mt-3 rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">{saveError}</div>
      ) : null}

      {justSaved && !saveError ? (
        <div className="mt-3 rounded border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">商家清单已保存并生效。</div>
      ) : null}

      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-500">
              <th className="py-2 pr-2 w-10">行</th>
              <th className="py-2 pr-2 min-w-[220px]">规格编码（filled_code，下拉）</th>
              <th className="py-2 pr-2 min-w-[260px]">商品标题（可改）</th>
              <th className="py-2 pr-2 min-w-[340px]">规格（只读：每组件一行）</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 6).map((r, idx) => {
              const hit = (() => {
                const norm = normText(r.filled_code);
                return norm ? optionsByCode.get(norm) ?? null : null;
              })();

              const lineCount = (r.spec || "")
                .split("\n")
                .map((x) => x.trim())
                .filter((x) => x.length > 0).length;

              return (
                <tr key={idx} className="border-t align-top">
                  <td className="py-2 pr-2 text-slate-500">{idx + 1}</td>

                  <td className="py-2 pr-2">
                    <div className="flex items-center gap-2">
                      <FilledCodeCombobox
                        value={r.filled_code}
                        onChange={(v) => onFilledCodeChange(idx, v)}
                        onPick={(picked) => onFilledCodePick(idx, picked)}
                        disabled={saving || optionsLoading}
                        loading={optionsLoading}
                        options={filledCodeOptions}
                        hit={hit}
                        placeholder={optionsLoading ? "候选加载中…" : "点击选择已绑定填写码（支持输入过滤）"}
                      />
                      <button
                        type="button"
                        className="shrink-0 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 disabled:opacity-50"
                        onClick={() => clearRow(idx)}
                        disabled={saving || optionsLoading || (isBlank(r.filled_code) && isBlank(r.title) && isBlank(r.spec))}
                        title="清空该行并重新选择"
                      >
                        清空
                      </button>
                    </div>
                    <div className="mt-1 text-[11px] text-slate-500">
                      候选：{filledCodeOptions.length} {hit ? "· 已匹配绑定" : ""} · 支持输入过滤、↑↓选择、Enter确认、Esc关闭
                    </div>
                  </td>

                  <td className="py-2 pr-2">
                    <input
                      className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                      value={r.title}
                      onChange={(e) => updateRow(idx, { title: e.target.value })}
                      placeholder="默认带出，可修改"
                      disabled={saving}
                    />
                  </td>

                  <td className="py-2 pr-2">
                    <textarea
                      className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-sm text-slate-700 whitespace-pre-line"
                      value={r.spec}
                      placeholder="选择填写码后自动带出"
                      readOnly
                      disabled
                      rows={Math.max(2, Math.min(6, lineCount || 1))}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-xs">
        {!hasAnyNonEmpty ? (
          <div className="text-slate-500">提示：先填写至少一行，再点击“保存并生效”。</div>
        ) : (
          <div className="text-slate-500">候选商品数（非空行）：{validLines.length}（最多 6 行）</div>
        )}
      </div>
    </div>
  );
};
