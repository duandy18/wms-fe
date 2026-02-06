// src/features/system/shop-bundles/components/build/ItemRowLine.tsx
import React from "react";
import type { MasterItem } from "../../types";
import { fmt } from "./buildUtils";

export function ItemRowLine({ it }: { it: MasterItem }): React.ReactElement {
  return (
    <div className="min-w-0 flex items-center gap-2 text-[12px] text-slate-900">
      <span className="w-[108px] shrink-0 font-mono text-[11px] text-slate-900">{it.sku}</span>
      <span className="min-w-0 flex-1 truncate">{it.name || "—"}</span>
      <span className="w-[156px] shrink-0 font-mono text-[11px] text-slate-700">{fmt(it.barcode)}</span>
      <span className="w-[96px] shrink-0 truncate text-[11px] text-slate-700">{fmt(it.brand)}</span>
      <span className="w-[72px] shrink-0 truncate text-[11px] text-slate-700">{fmt(it.uom)}</span>
    </div>
  );
}
