// src/features/operations/inbound/return-receive/ReturnReceiveLinesTable.tsx

import React, { useMemo } from "react";
import { InboundUI } from "../ui";
import type { ReturnTask, ReturnTaskLine, ReturnReceiveState } from "./types";

function toInt(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.trunc(n);
}

function parseIntSafe(raw: string): number | null {
  const t = String(raw ?? "").trim();
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

export const ReturnReceiveLinesTable: React.FC<{
  task: ReturnTask;
  m: ReturnReceiveState;
}> = ({ task, m }) => {
  const disabled = task.status === "COMMITTED" || m.committing;

  // ✅ rows 稳定化，避免 eslint 警告
  const rows = useMemo<ReturnTaskLine[]>(() => {
    return task.lines ?? [];
  }, [task.lines]);

  const stats = useMemo(() => {
    let expectedTotal = 0;
    let pickedTotal = 0;
    for (const ln of rows) {
      const expected = ln.expected_qty == null ? 0 : Math.max(0, toInt(ln.expected_qty));
      const picked = toInt(ln.picked_qty ?? 0);
      expectedTotal += expected;
      pickedTotal += picked;
    }
    return { expectedTotal, pickedTotal };
  }, [rows]);

  return (
    <div className="space-y-2">
      <div className={InboundUI.quiet}>
        合计：可退 {stats.expectedTotal} · 已录 {stats.pickedTotal}
      </div>

      <div className={InboundUI.tableWrap}>
        <table className={InboundUI.table}>
          <thead>
            <tr className={InboundUI.thRow}>
              <th className={InboundUI.th}>商品</th>
              <th className={InboundUI.th}>批次</th>
              <th className={InboundUI.thRight}>可退</th>
              <th className={InboundUI.thRight}>已录</th>
              <th className={InboundUI.thCenter}>录入增减</th>
              <th className={InboundUI.thCenter}>快捷</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className={`${InboundUI.td} text-center text-slate-500`}>
                  当前任务没有任何行。
                </td>
              </tr>
            ) : (
              rows.map((ln) => {
                const expected = ln.expected_qty == null ? "-" : String(Math.max(0, toInt(ln.expected_qty)));
                const picked = String(toInt(ln.picked_qty ?? 0));
                const inputRaw = (m.qtyInputs[ln.item_id] ?? "").trim();
                const inputParsed = parseIntSafe(inputRaw);
                const canApply = !disabled && inputParsed != null && inputParsed !== 0;

                return (
                  <tr key={ln.id} className={InboundUI.tr}>
                    <td className={InboundUI.td}>
                      <div className="font-medium text-slate-900">
                        {ln.item_name ?? `商品#${ln.item_id}`}
                      </div>
                      <div className={InboundUI.quiet}>item_id={ln.item_id}</div>
                    </td>

                    <td className={InboundUI.td}>
                      <span className="font-mono">{ln.batch_code}</span>
                    </td>

                    <td className={InboundUI.tdRight}>{expected}</td>
                    <td className={InboundUI.tdRight}>{picked}</td>

                    <td className={InboundUI.tdCenter}>
                      <div className="flex items-center justify-center gap-2">
                        <input
                          className={InboundUI.tableInput}
                          value={inputRaw}
                          placeholder="±整数"
                          disabled={disabled}
                          onChange={(e) => m.setQtyInput(ln.item_id, e.target.value)}
                        />
                        <button
                          type="button"
                          className={InboundUI.btnGhost}
                          disabled={!canApply}
                          onClick={() => void m.applyInputDelta(ln)}
                        >
                          录入
                        </button>
                      </div>
                    </td>

                    <td className={InboundUI.tdCenter}>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          className={InboundUI.btnGhost}
                          disabled={disabled}
                          onClick={() => void m.adjustLineQty(ln, -1)}
                        >
                          -1
                        </button>
                        <button
                          type="button"
                          className={InboundUI.btnGhost}
                          disabled={disabled}
                          onClick={() => void m.adjustLineQty(ln, 1)}
                        >
                          +1
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className={InboundUI.quiet}>
        提示：负数用于撤销误录；“提交回仓”只允许最终数量为正且不超出可退。
      </div>
    </div>
  );
};
