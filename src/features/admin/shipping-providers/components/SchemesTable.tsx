// src/features/admin/shipping-providers/components/SchemesTable.tsx

import React, { useMemo } from "react";
import { CUI } from "./ui";
import type { PricingScheme } from "../api";
import { formatDt } from "./SchemesPanel/utils";

function parseTs(v?: string | null): number {
  if (!v) return 0;
  const s = v.slice(0, 10); // YYYY-MM-DD
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : 0;
}

export const SchemesTable: React.FC<{
  schemes: PricingScheme[];
  onOpenWorkbench: (schemeId: number) => void;
}> = ({ schemes, onOpenWorkbench }) => {
  // ✅ 排序规则：
  // 1) active=true 在最上
  // 2) effective_from 倒序（新的在上）
  // 3) id 倒序兜底
  const rows = useMemo(() => {
    const list = schemes ?? [];
    return [...list].sort((a, b) => {
      // active 优先
      if (a.active !== b.active) return a.active ? -1 : 1;

      // 生效时间倒序
      const ta = parseTs(a.effective_from);
      const tb = parseTs(b.effective_from);
      if (ta !== tb) return tb - ta;

      // id 倒序兜底
      return b.id - a.id;
    });
  }, [schemes]);

  return (
    <div className={CUI.tableWrap}>
      <table className={CUI.table}>
        <thead className={CUI.thead}>
          <tr>
            <th className={CUI.th}>序号</th>
            <th className={CUI.th}>运费表名称</th>
            <th className={CUI.th}>优先级</th>
            <th className={CUI.th}>状态</th>
            <th className={CUI.th}>币种</th>
            <th className={CUI.th}>生效时间</th>
            <th className={CUI.th}>操作</th>
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={7} className={CUI.emptyRow}>
                暂无运费价格表
              </td>
            </tr>
          ) : (
            rows.map((s) => (
              <tr key={s.id} className={CUI.tr}>
                <td className={CUI.tdMono}>{s.id}</td>
                <td className={CUI.td}>{s.name}</td>
                <td className={CUI.tdMono}>{s.priority}</td>
                <td className={CUI.td}>
                  <span
                    className={`${CUI.statusPill} ${s.active ? CUI.statusOn : CUI.statusOff}`}
                  >
                    {s.active ? "启用" : "停用"}
                  </span>
                </td>
                <td className={CUI.tdMono}>{s.currency}</td>
                <td className={CUI.tdMonoSm}>
                  {formatDt(s.effective_from)} ~ {formatDt(s.effective_to)}
                </td>
                <td className={CUI.td}>
                  <button
                    type="button"
                    className={CUI.btnWorkbench}
                    onClick={() => onOpenWorkbench(s.id)}
                  >
                    进入工作台
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SchemesTable;
