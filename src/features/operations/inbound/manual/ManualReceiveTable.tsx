// src/features/operations/inbound/manual/ManualReceiveTable.tsx

import React, { useMemo } from "react";
import type { ReceiveTaskLine } from "../../../receive-tasks/api";
import { SupplementLink } from "../SupplementLink";

function clampInt(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

function parseQtyInput(raw: string): number | null {
  const t = raw.trim();
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n)) return null;
  const i = Math.floor(n);
  if (i <= 0) return null;
  return i;
}

function hasAnyDate(l: ReceiveTaskLine): boolean {
  return !!((l.production_date ?? "").trim() || (l.expiry_date ?? "").trim());
}

function isMissingBatch(l: ReceiveTaskLine): boolean {
  const scanned = clampInt(l.scanned_qty ?? 0);
  if (scanned <= 0) return false;
  return !((l.batch_code ?? "").trim());
}

export const ManualReceiveTable: React.FC<{
  lines: ReceiveTaskLine[];

  qtyInputs: Record<number, string>;
  savingItemId: number | null;

  onQtyChange: (itemId: number, value: string) => void;
  onReceive: (line: ReceiveTaskLine) => void;
}> = ({ lines, qtyInputs, savingItemId, onQtyChange, onReceive }) => {
  const rows = useMemo(() => {
    return lines.map((l) => {
      const expected = l.expected_qty != null ? clampInt(l.expected_qty ?? 0) : null;
      const received = clampInt(l.scanned_qty ?? 0);
      const remaining = expected != null ? expected - received : null;

      const raw = qtyInputs[l.item_id] ?? "";
      const parsed = parseQtyInput(raw);
      const thisQty =
        parsed != null ? parsed : remaining != null && remaining > 0 ? remaining : 0;

      const after = received + (thisQty > 0 ? thisQty : 0);
      const variance = expected != null ? after - expected : null;

      let judge: "OK" | "UNDER" | "OVER" | "NA" = "NA";
      if (expected == null) judge = "NA";
      else if (variance === 0) judge = "OK";
      else if ((variance ?? 0) < 0) judge = "UNDER";
      else judge = "OVER";

      const missingBatch = isMissingBatch(l);
      const missingDate = received > 0 && (l.batch_code ?? "").trim() && !hasAnyDate(l);

      return {
        l,
        expected,
        received,
        remaining,
        thisQty,
        after,
        variance,
        judge,
        missingBatch,
        missingDate,
      };
    });
  }, [lines, qtyInputs]);

  return (
    <div className="max-h-72 overflow-y-auto rounded-lg bg-slate-50 border border-slate-100">
      <table className="min-w-full border-collapse text-[12px]">
        <thead>
          <tr className="bg-slate-100 text-slate-600">
            <th className="px-2 py-2 text-left">商品</th>
            <th className="px-2 py-2 text-right">计划</th>
            <th className="px-2 py-2 text-right">已收</th>
            <th className="px-2 py-2 text-right">本次</th>
            <th className="px-2 py-2 text-right">合计</th>
            <th className="px-2 py-2 text-right">差异</th>
            <th className="px-2 py-2 text-left">判断</th>
            <th className="px-2 py-2 text-left">补录</th>
            <th className="px-2 py-2 text-center">操作</th>
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-2 py-3 text-center text-slate-500">
                当前任务没有任何行，无法进行手工收货。
              </td>
            </tr>
          ) : (
            rows.map((r) => {
              const l = r.l;

              const judgeCls =
                r.judge === "OK"
                  ? "text-emerald-700"
                  : r.judge === "OVER"
                  ? "text-amber-700"
                  : r.judge === "UNDER"
                  ? "text-rose-700"
                  : "text-slate-500";

              const judgeText =
                r.judge === "OK"
                  ? "正常"
                  : r.judge === "OVER"
                  ? "超收"
                  : r.judge === "UNDER"
                  ? "少收"
                  : "无计划";

              const varianceText =
                r.variance == null ? "-" : String(r.variance);

              const blocked = savingItemId === l.item_id;

              return (
                <tr key={l.id} className="border-t border-slate-100 align-top">
                  <td className="px-2 py-2">
                    <div className="font-medium text-slate-900">
                      {l.item_name ?? "（未命名商品）"}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {l.spec_text ?? "-"}
                    </div>
                  </td>

                  <td className="px-2 py-2 text-right font-mono">
                    {r.expected == null ? "-" : r.expected}
                  </td>
                  <td className="px-2 py-2 text-right font-mono">{r.received}</td>

                  <td className="px-2 py-2 text-right">
                    <input
                      className="w-24 rounded border border-slate-300 px-2 py-1 text-right font-mono bg-white"
                      placeholder={
                        r.remaining != null && r.remaining > 0 ? String(r.remaining) : ""
                      }
                      value={qtyInputs[l.item_id] ?? ""}
                      onChange={(e) => onQtyChange(l.item_id, e.target.value)}
                      disabled={blocked}
                    />
                  </td>

                  <td className="px-2 py-2 text-right font-mono">{r.after}</td>

                  <td className="px-2 py-2 text-right font-mono">{varianceText}</td>

                  <td className={`px-2 py-2 ${judgeCls}`}>{judgeText}</td>

                  <td className="px-2 py-2">
                    {r.missingBatch ? (
                      <div className="text-amber-700">
                        缺批次/日期{" "}
                        <SupplementLink source="purchase">去补录</SupplementLink>
                      </div>
                    ) : r.missingDate ? (
                      <div className="text-slate-600">
                        日期未填{" "}
                        <SupplementLink source="purchase">去补录</SupplementLink>
                      </div>
                    ) : (
                      <div className="text-slate-400">-</div>
                    )}
                  </td>

                  <td className="px-2 py-2 text-center">
                    <button
                      type="button"
                      disabled={blocked}
                      onClick={() => onReceive(l)}
                      className="rounded border border-slate-300 bg-white px-2 py-1 text-[12px] text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                    >
                      {blocked ? "保存中…" : "记录"}
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
