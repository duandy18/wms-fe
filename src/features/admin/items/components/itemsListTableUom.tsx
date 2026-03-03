// src/features/admin/items/components/itemsListTableUom.tsx

import React from "react";
import type { ItemUom } from "../../../../master-data/itemUomsApi";

function isLegacyCaseUom(uom: string): boolean {
  const s = (uom ?? "").trim().toUpperCase();
  return /^CASE\d+$/.test(s);
}

export function renderPackagingUoms(uoms: ItemUom[]): React.ReactNode {
  if (!uoms || uoms.length === 0) return <span className="text-slate-400">—</span>;

  // 过滤 CASE100 这类历史残影
  const cleaned = uoms.filter((u) => !isLegacyCaseUom(u.uom));
  if (cleaned.length === 0) return <span className="text-slate-400">—</span>;

  const tag = (u: ItemUom): string => {
    const tags: string[] = [];
    if (u.is_base) tags.push("最小包装单位");
    if (u.is_purchase_default) tags.push("采购包装单位");
    // ✅ 不展示默认入库/默认出库
    return tags.join(" · ");
  };

  return (
    <div className="space-y-1">
      {cleaned.map((u) => {
        // 显示名不强制删，但不再用它覆盖 uom（避免“显示名”误导结构）
        const name = String(u.uom ?? "").trim() || "—";
        const t = tag(u);

        return (
          <div key={u.id} className="text-[12px] leading-4">
            <span className="font-mono">{name}</span>{" "}
            <span className="text-slate-600">（×{u.ratio_to_base}）</span>
            {t ? <span className="ml-1 text-slate-500">· {t}</span> : null}
          </div>
        );
      })}
    </div>
  );
}
