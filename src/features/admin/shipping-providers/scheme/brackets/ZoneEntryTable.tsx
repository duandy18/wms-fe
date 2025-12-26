// src/features/admin/shipping-providers/scheme/brackets/ZoneEntryTable.tsx
//
// 当前区域录价（批量录入）- 表格渲染（纯渲染）
// - 不持有编辑状态
// - 由上层传入 locked/busy/disabled 等开关

import React, { useMemo } from "react";
import type { SchemeDefaultPricingMode } from "../../api/types";
import type { WeightSegment } from "./PricingRuleEditor";
import type { RowDraft } from "./quoteModel";
import { defaultDraft, segLabel } from "./quoteModel";
import { PUI } from "./ui";
import { buildZoneEntryHead } from "./zoneEntryUtils";

export const ZoneEntryTable: React.FC<{
  busy: boolean;
  schemeMode: SchemeDefaultPricingMode;

  locked: boolean;
  hardDisabled: boolean;

  tableRows: { segment: WeightSegment; key: string | null }[];
  currentDrafts: Record<string, RowDraft>;

  onSetDraft: (key: string, patch: Partial<RowDraft>) => void;
}> = ({ busy, schemeMode, locked, hardDisabled, tableRows, currentDrafts, onSetDraft }) => {
  const head = useMemo(() => buildZoneEntryHead(schemeMode), [schemeMode]);

  // 防御：避免 tableRows 传入 undefined 时触发 .map 崩溃
  const safeTableRows = tableRows ?? [];

  return (
    <div className={PUI.zoneEntryTableWrap}>
      <table className={PUI.zoneEntryTable}>
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} className={PUI.zoneEntryTh}>
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {safeTableRows.map((row, idx) => {
            const k = row.key;
            const invalid = !k;
            const d: RowDraft = invalid ? defaultDraft(schemeMode) : currentDrafts[k] ?? defaultDraft(schemeMode);

            const cellDisabled = busy || invalid || locked || hardDisabled;

            const inputCls = cellDisabled ? PUI.zoneEntryInputDisabled : PUI.zoneEntryInput;

            return (
              <tr key={k ?? idx} className={PUI.zoneEntryTr}>
                <td className={PUI.zoneEntryTdSegment}>
                  {segLabel(row.segment)}
                  {invalid ? <span className={PUI.zoneEntryInvalidBadge}>（区间非法）</span> : null}
                </td>

                {schemeMode === "flat" ? (
                  <>
                    <td className={PUI.zoneEntryTd}>
                      {invalid ? (
                        <span className={PUI.zoneEntryInvalidText}>请修正该重量分段</span>
                      ) : (
                        <input
                          className={inputCls}
                          placeholder="金额"
                          value={d.flatAmount}
                          disabled={cellDisabled}
                          onChange={(e) => {
                            if (!k) return;
                            onSetDraft(k, { flatAmount: e.target.value });
                          }}
                        />
                      )}
                    </td>
                  </>
                ) : schemeMode === "step_over" ? (
                  <>
                    <td className={PUI.zoneEntryTd}>
                      {invalid ? (
                        <span className={PUI.zoneEntryInvalidText}>—</span>
                      ) : (
                        <input
                          className={inputCls}
                          placeholder="首重kg"
                          value={d.baseKg}
                          disabled={cellDisabled}
                          onChange={(e) => {
                            if (!k) return;
                            onSetDraft(k, { baseKg: e.target.value });
                          }}
                        />
                      )}
                    </td>

                    <td className={PUI.zoneEntryTd}>
                      {invalid ? (
                        <span className={PUI.zoneEntryInvalidText}>—</span>
                      ) : (
                        <input
                          className={inputCls}
                          placeholder="首重价"
                          value={d.baseAmount}
                          disabled={cellDisabled}
                          onChange={(e) => {
                            if (!k) return;
                            onSetDraft(k, { baseAmount: e.target.value });
                          }}
                        />
                      )}
                    </td>

                    <td className={PUI.zoneEntryTd}>
                      {invalid ? (
                        <span className={PUI.zoneEntryInvalidText}>—</span>
                      ) : (
                        <input
                          className={inputCls}
                          placeholder="续重元/kg"
                          value={d.ratePerKg}
                          disabled={cellDisabled}
                          onChange={(e) => {
                            if (!k) return;
                            onSetDraft(k, { ratePerKg: e.target.value });
                          }}
                        />
                      )}
                    </td>
                  </>
                ) : (
                  <>
                    <td className={PUI.zoneEntryTd}>
                      {invalid ? (
                        <span className={PUI.zoneEntryInvalidText}>请修正该重量分段</span>
                      ) : (
                        <input
                          className={inputCls}
                          placeholder="票费"
                          value={d.baseAmount}
                          disabled={cellDisabled}
                          onChange={(e) => {
                            if (!k) return;
                            onSetDraft(k, { baseAmount: e.target.value });
                          }}
                        />
                      )}
                    </td>

                    <td className={PUI.zoneEntryTd}>
                      {invalid ? (
                        <span className={PUI.zoneEntryInvalidText}>—</span>
                      ) : (
                        <input
                          className={inputCls}
                          placeholder="元/kg"
                          value={d.ratePerKg}
                          disabled={cellDisabled}
                          onChange={(e) => {
                            if (!k) return;
                            onSetDraft(k, { ratePerKg: e.target.value });
                          }}
                        />
                      )}
                    </td>
                  </>
                )}

                <td className={PUI.zoneEntryTdStatus}>
                  {busy ? (
                    <span className={PUI.zoneEntryStatusMuted}>处理中…</span>
                  ) : hardDisabled ? (
                    <span className={PUI.zoneEntryStatusWarn}>待配置表头</span>
                  ) : invalid ? (
                    <span className={PUI.zoneEntryStatusBad}>非法</span>
                  ) : locked ? (
                    <span className={PUI.zoneEntryStatusMuted}>已锁定</span>
                  ) : (
                    <span className={PUI.zoneEntryStatusOk}>可编辑</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ZoneEntryTable;
