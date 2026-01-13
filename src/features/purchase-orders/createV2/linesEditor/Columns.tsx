// src/features/purchase-orders/createV2/linesEditor/Columns.tsx
import React from "react";
import { PO_CREATE_LINE_COLUMNS } from "./columns.def";

export const PurchaseOrderCreateLinesTableHead: React.FC = () => {
  return (
    <thead>
      <tr className="border-b border-slate-200 bg-slate-50 text-sm uppercase text-slate-600">
        {PO_CREATE_LINE_COLUMNS.map((c) => (
          <th
            key={c.key}
            className={`px-3 py-2 ${c.align === "right" ? "text-right" : "text-left"}`}
          >
            {c.label}
          </th>
        ))}
      </tr>
    </thead>
  );
};
