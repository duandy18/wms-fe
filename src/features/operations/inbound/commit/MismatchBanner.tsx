// src/features/operations/inbound/commit/MismatchBanner.tsx

import React from "react";
import type { ReceiveTaskLine } from "../../../receive-tasks/api";

export const MismatchBanner: React.FC<{
  mismatchLines: ReceiveTaskLine[];
  topMismatch: ReceiveTaskLine[];
}> = ({ mismatchLines, topMismatch }) => {
  if (mismatchLines.length === 0) return null;

  return (
    <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
      <div className="font-semibold mb-1">
        注意：共有 {mismatchLines.length} 行存在差异（实收 ≠ 应收），请确认无误后再提交。
      </div>
      <ul className="list-disc pl-4 space-y-0.5">
        {topMismatch.map((l) => (
          <li key={l.id}>
            item_id=<span className="font-mono">{l.item_id}</span>{" "}
            名称：{l.item_name ?? "-"}，应收=
            <span className="font-mono">{l.expected_qty ?? "-"}</span>，实收=
            <span className="font-mono">{l.scanned_qty ?? 0}</span>
          </li>
        ))}
        {mismatchLines.length > topMismatch.length && (
          <li>…… 其余 {mismatchLines.length - topMismatch.length} 行略</li>
        )}
      </ul>
    </div>
  );
};
