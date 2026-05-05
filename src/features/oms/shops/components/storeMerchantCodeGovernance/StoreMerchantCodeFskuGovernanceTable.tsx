// src/features/oms/shops/components/storeMerchantCodeGovernance/StoreMerchantCodeFskuGovernanceTable.tsx

import React, { useMemo } from "react";
import type { Fsku } from "../../../fsku/types";
import type { PlatformCodeMappingRow } from "../../../fsku/api_platform_code_mappings";
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
  // ✅ 顺化：解除映射目标必须来自“映射关系”，而不是输入框
  // current-only（一码一对一）下，平台编码 ↔ fsku_id 可做反向索引
  const currentByFskuId = useMemo(() => {
    const m = new Map<number, PlatformCodeMappingRow>();
    for (const r of currentByMerchantCode.values()) {
      // 一码一对一：同一 fsku_id 理论上不会出现多个 平台编码；如出现，保留最后一个（但这本身是脏数据，后端应护栏）
      m.set(Number(r.fsku_id), r);
    }
    return m;
  }, [currentByMerchantCode]);

  function isAlreadyBoundToThisFsku(f: Fsku, binding?: PlatformCodeMappingRow): boolean {
    return !!binding && Number(binding.fsku_id) === f.id;
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
            <th className="px-3 py-2 text-left">店铺商品代码（平台编码）</th>
            <th className="px-3 py-2 text-left">当前映射</th>
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

              const mcDraft = (s.merchantCode || "").trim();

              // ✅ 当前映射关系（按 fsku_id 反查）
              const binding = currentByFskuId.get(f.id);
              const already = isAlreadyBoundToThisFsku(f, binding);

              const compText = (f.components_summary_name ?? "").trim() || (f.components_summary ?? "").trim() || "";
              const compLines = splitComponentsSummaryText(compText);

              const canUnbind = !!binding && canWrite && !loading;
              const unbindMerchantCode = (binding?.identity_value ?? "").trim();

              return (
                <tr key={k} className="border-b border-slate-100">
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={!!s.checked}
                      onChange={(e) => onRowChecked(f.id, e.target.checked)}
                      disabled={loading || already}
                      title={already ? "该 FSKU 已存在映射（无需重复勾选）" : ""}
                    />
                  </td>

                  <td className="px-3 py-2 font-mono text-[11px] text-slate-700">#{f.id}</td>

                  <td className="px-3 py-2 font-mono text-[11px] text-slate-900">{f.code}</td>

                  <td className="px-3 py-2 text-[11px] text-slate-800">{f.name}</td>

                  <td className="px-3 py-2 text-[11px] text-slate-700">
                    {compLines.length === 0 ? (
                      <span className="text-slate-400">—</span>
                    ) : (
                      <div className="flex flex-col gap-0.5 text-[12px] leading-4">
                        {compLines.slice(0, MAX_COMP_LINES).map((t) => (
                          <div key={`${f.id}-${t}`} className="whitespace-normal break-words" title={t}>
                            {t}
                          </div>
                        ))}

                        {compLines.length > MAX_COMP_LINES && (
                          <div className="text-[11px] text-slate-500">+{compLines.length - MAX_COMP_LINES} more</div>
                        )}
                      </div>
                    )}
                  </td>

                  <td className="px-3 py-2">
                    <input
                      className="w-[240px] max-w-full rounded-md border border-slate-300 px-2 py-1 text-[12px]"
                      value={s.merchantCode}
                      onChange={(e) => onMerchantCodeChange(f.id, e.target.value)}
                      placeholder="默认等于 fsku.code，可按店铺真实代码改"
                      disabled={loading}
                    />
                    <div className="mt-1 text-[10px] text-slate-500">默认：{f.code}</div>

                    {binding ? (
                      <div className="mt-1 text-[10px] text-slate-500">
                        已映射 平台编码：<span className="font-mono">{binding.identity_value}</span>
                      </div>
                    ) : null}

                    {binding && mcDraft && mcDraft !== unbindMerchantCode ? (
                      <div className="mt-1 text-[10px] text-amber-700">
                        提示：输入框已改为 <span className="font-mono">{mcDraft}</span>，但尚未映射；解除映射将针对已映射的{" "}
                        <span className="font-mono">{unbindMerchantCode}</span>。
                      </div>
                    ) : null}
                  </td>

                  <td className="px-3 py-2 text-[11px]">
                    {binding ? (
                      <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] text-emerald-700">
                        已映射：{binding.identity_value} → FSKU #{binding.fsku_id}（{binding.fsku.code}）
                      </span>
                    ) : mcDraft ? (
                      <span className="text-slate-500">未映射</span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>

                  <td className="px-3 py-2">
                    {binding ? (
                      <button
                        type="button"
                        className="rounded-md border border-red-300 bg-red-50 px-2 py-1 text-[11px] text-red-700 hover:bg-red-100 disabled:opacity-60"
                        onClick={() => onCloseByMerchantCode(unbindMerchantCode)}
                        disabled={!canUnbind || !unbindMerchantCode}
                        title={!canWrite ? "无写权限" : loading ? "处理中…" : "解除映射（删除映射关系）"}
                      >
                        解除映射
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400" title="当前无映射关系，无需解除映射">
                        未映射，无需解除映射
                      </span>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td className="px-3 py-3 text-[12px] text-slate-500" colSpan={8}>
                暂无 published FSKU（请先在“商铺商品组合”页发布 FSKU）。
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
