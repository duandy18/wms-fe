// src/features/admin/stores/components/storeMerchantCodeGovernance/StoreMerchantCodeFskuGovernanceTable.tsx

import React from "react";
import type { Fsku, MerchantCodeBindingRow } from "../../../shop-bundles/types";
import type { CurrentBindingsIndex, RowState } from "./types";

function splitComponentsSummaryText(raw: string): string[] {
  const s = (raw || "").trim();
  if (!s) return [];

  const parts = s
    .split(/\s*(?:\+|\||\n)\s*/g)
    .map((x) => x.trim())
    .filter(Boolean);

  const out: string[] = [];
  const seen = new Set<string>();
  for (const p of parts) {
    if (seen.has(p)) continue;
    seen.add(p);
    out.push(p);
  }
  return out;
}

const MAX_COMP_LINES = 3;

export const StoreMerchantCodeFskuGovernanceTable: React.FC<{
  fskus: Fsku[];
  rowState: Record<string, RowState>;
  currentByMerchantCode: CurrentBindingsIndex;
  loading: boolean;
  canWrite: boolean;

  onRowChecked: (fskuId: number, checked: boolean) => void;
  onMerchantCodeChange: (fskuId: number, merchantCode: string) => void;

  onToggleExpanded: (fskuId: number) => void;
  onBindOne: (f: Fsku) => void;

  onCloseByMerchantCode: (merchantCode: string) => void;
}> = ({
  fskus,
  rowState,
  currentByMerchantCode,
  loading,
  canWrite,
  onRowChecked,
  onMerchantCodeChange,
  onCloseByMerchantCode,
}) => {
  function isAlreadyBoundToThisFsku(
    f: Fsku,
    mc: string,
    current?: MerchantCodeBindingRow
  ): boolean {
    return !!current && current.fsku_id === f.id && mc.length > 0;
  }

  return (
    <div className="mt-3 overflow-auto rounded-lg border border-slate-200">
      <table className="min-w-full border-collapse text-xs">
        <thead className="sticky top-0 bg-white">
          <tr className="border-b border-slate-200 text-[11px] text-slate-600">
            <th className="px-3 py-2 text-left">选择</th>
            <th className="px-3 py-2 text-left">FSKU</th>
            <th className="px-3 py-2 text-left">FSKU.code</th>
            <th className="px-3 py-2 text-left">FSKU.name</th>
            <th className="px-3 py-2 text-left">组件（主数据商品名）</th>
            <th className="px-3 py-2 text-left">店铺商品代码（merchant_code）</th>
            <th className="px-3 py-2 text-left">当前绑定</th>
            <th className="px-3 py-2 text-left">操作</th>
          </tr>
        </thead>

        <tbody>
          {fskus.length ? (
            fskus.map((f) => {
              const k = String(f.id);
              const s =
                rowState[k] ?? {
                  checked: false,
                  merchantCode: f.code,
                  expanded: false,
                };

              const mc = (s.merchantCode || "").trim();
              const current = mc
                ? currentByMerchantCode.get(mc)
                : undefined;
              const already = isAlreadyBoundToThisFsku(f, mc, current);

              const compText =
                (f.components_summary_name ?? "").trim() ||
                (f.components_summary ?? "").trim() ||
                "";

              const compLines = splitComponentsSummaryText(compText);

              return (
                <tr key={k} className="border-b border-slate-100">
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={!!s.checked}
                      onChange={(e) =>
                        onRowChecked(f.id, e.target.checked)
                      }
                      disabled={loading || already}
                      title={already ? "已绑定到该 FSKU（无需重复）" : ""}
                    />
                  </td>

                  <td className="px-3 py-2 font-mono text-[11px] text-slate-700">
                    #{f.id}
                  </td>

                  <td className="px-3 py-2 font-mono text-[11px] text-slate-900">
                    {f.code}
                  </td>

                  <td className="px-3 py-2 text-[11px] text-slate-800">
                    {f.name}
                  </td>

                  <td className="px-3 py-2 text-[11px] text-slate-700">
                    {compLines.length === 0 ? (
                      <span className="text-slate-400">—</span>
                    ) : (
                      <div className="flex flex-col gap-0.5 text-[12px] leading-4">
                        {compLines
                          .slice(0, MAX_COMP_LINES)
                          .map((t) => (
                            <div
                              key={`${f.id}-${t}`}
                              className="whitespace-normal break-words"
                              title={t}
                            >
                              {t}
                            </div>
                          ))}

                        {compLines.length > MAX_COMP_LINES && (
                          <div className="text-[11px] text-slate-500">
                            +{compLines.length - MAX_COMP_LINES} more
                          </div>
                        )}
                      </div>
                    )}
                  </td>

                  <td className="px-3 py-2">
                    <input
                      className="w-[240px] max-w-full rounded-md border border-slate-300 px-2 py-1 text-[12px]"
                      value={s.merchantCode}
                      onChange={(e) =>
                        onMerchantCodeChange(
                          f.id,
                          e.target.value
                        )
                      }
                      placeholder="默认等于 fsku.code，可按店铺真实代码改"
                      disabled={loading}
                    />
                    <div className="mt-1 text-[10px] text-slate-500">
                      默认：{f.code}
                    </div>
                  </td>

                  <td className="px-3 py-2 text-[11px]">
                    {mc ? (
                      already ? (
                        <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] text-emerald-700">
                          已绑定到该 FSKU
                        </span>
                      ) : current ? (
                        <div className="text-slate-700">
                          已绑定：{mc} → FSKU #
                          {current.fsku_id}（
                          {current.fsku.code}）
                        </div>
                      ) : (
                        <span className="text-slate-500">
                          未绑定
                        </span>
                      )
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>

                  <td className="px-3 py-2">
                    <button
                      type="button"
                      className="rounded-md border border-red-300 bg-red-50 px-2 py-1 text-[11px] text-red-700 hover:bg-red-100 disabled:opacity-60"
                      onClick={() =>
                        onCloseByMerchantCode(mc)
                      }
                      disabled={
                        loading || !current || !canWrite
                      }
                      title={
                        !current
                          ? "当前 merchant_code 未找到绑定"
                          : "解绑（删除绑定）"
                      }
                    >
                      解绑
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                className="px-3 py-3 text-[12px] text-slate-500"
                colSpan={8}
              >
                暂无 published FSKU（请先在“商铺商品组合”页发布 FSKU）。
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
