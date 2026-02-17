// src/features/operations/inbound/manual/ManualReceiveTable.tsx

import React, { useMemo } from "react";
import type { ReceiveTaskLine } from "../../../receive-tasks/api";
import { SupplementLink } from "../SupplementLink";
import { InboundUI } from "../ui";

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

function formatMissing(fields: string[]): string {
  const m: Record<string, string> = {
    batch_code: "批次",
    production_date: "生产日期",
    expiry_date: "到期日期",
  };
  return fields.map((f) => m[f] ?? f).join(" / ");
}

export const ManualReceiveTable: React.FC<{
  lines: ReceiveTaskLine[];

  qtyInputs: Record<number, string>;
  savingItemId: number | null;
  savingAll?: boolean;

  activeItemId?: number | null;

  // 任务 id 不再用于补录链接跳转（补录已常驻），保留仅用于未来展示/调试
  taskId?: number | null;

  hardMissingByItemId: Record<number, string[]>;
  softMissingByItemId: Record<number, string[]>;

  onQtyChange: (itemId: number, value: string) => void;
  onReceive: (line: ReceiveTaskLine) => void;

  onRowClick?: (line: ReceiveTaskLine) => void;
}> = ({
  lines,
  qtyInputs,
  savingItemId,
  savingAll = false,
  activeItemId = null,
  taskId = null,
  hardMissingByItemId,
  softMissingByItemId,
  onQtyChange,
  onReceive,
  onRowClick,
}) => {
  const rows = useMemo(() => {
    return lines.map((l) => {
      const expected = l.expected_qty != null ? clampInt(l.expected_qty ?? 0) : null;
      const received = clampInt(l.scanned_qty ?? 0);

      const raw = qtyInputs[l.item_id] ?? "";
      const parsed = parseQtyInput(raw);
      const thisQty = parsed != null ? parsed : 0;

      const after = received + (thisQty > 0 ? thisQty : 0);
      const variance = expected != null ? after - expected : null;

      let judge: "OK" | "UNDER" | "OVER" | "NA" = "NA";
      if (expected == null) judge = "NA";
      else if (variance === 0) judge = "OK";
      else if ((variance ?? 0) < 0) judge = "UNDER";
      else judge = "OVER";

      const hardMissing = hardMissingByItemId[l.item_id] ?? [];
      const softMissing = softMissingByItemId[l.item_id] ?? [];

      const showHard = hardMissing.length > 0;
      const showSoft = !showHard && softMissing.length > 0;

      return {
        l,
        expected,
        received,
        after,
        variance,
        judge,
        showHard,
        showSoft,
        hardMissing,
        softMissing,
      };
    });
  }, [lines, qtyInputs, hardMissingByItemId, softMissingByItemId]);

  return (
    <div className={InboundUI.tableWrap}>
      <table className={InboundUI.table}>
        <thead>
          <tr className={InboundUI.thRow}>
            <th className={InboundUI.th}>商品</th>
            <th className={InboundUI.thRight}>计划</th>
            <th className={InboundUI.thRight}>已收</th>
            <th className={InboundUI.thRight}>本次</th>
            <th className={InboundUI.thRight}>合计</th>
            <th className={InboundUI.thRight}>差异</th>
            <th className={InboundUI.th}>判断</th>
            <th className={InboundUI.th}>补录</th>
            <th className={InboundUI.thCenter}>操作</th>
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={9} className={`${InboundUI.td} text-center text-slate-500`}>
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

              const varianceText = r.variance == null ? "-" : String(r.variance);

              const blocked = savingAll || savingItemId === l.item_id;
              const isActive = activeItemId != null && l.item_id === activeItemId;

              const rawInput = (qtyInputs[l.item_id] ?? "").trim();

              return (
                <tr
                  key={l.id}
                  className={`${InboundUI.tr} ${isActive ? InboundUI.rowActive : ""}`}
                  onClick={() => onRowClick?.(l)}
                  style={{ cursor: onRowClick ? "pointer" : "default" }}
                  title={onRowClick ? "点击该行可切换定位" : undefined}
                >
                  <td className={InboundUI.td}>
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-slate-900">{l.item_name ?? "（未命名商品）"}</div>
                      {isActive ? (
                        <span className="rounded bg-sky-100 px-2 py-0.5 text-[12px] text-sky-800">已定位</span>
                      ) : null}
                    </div>
                    <div className={InboundUI.quiet}>{l.spec_text ?? "-"}</div>
                  </td>

                  <td className={InboundUI.tdRight}>{r.expected == null ? "-" : r.expected}</td>
                  <td className={InboundUI.tdRight}>{r.received}</td>

                  <td className={InboundUI.tdRight}>
                    <input
                      className={InboundUI.tableInput}
                      placeholder=""
                      value={rawInput}
                      onChange={(e) => onQtyChange(l.item_id, e.target.value)}
                      disabled={blocked}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>

                  <td className={InboundUI.tdRight}>{r.after}</td>
                  <td className={InboundUI.tdRight}>{varianceText}</td>

                  <td className={`${InboundUI.td} ${judgeCls}`}>{judgeText}</td>

                  <td className={InboundUI.td}>
                    {r.showHard ? (
                      <div className="text-rose-700 font-medium">
                        必须补录：缺{formatMissing(r.hardMissing)} <SupplementLink>去补录</SupplementLink>
                      </div>
                    ) : r.showSoft ? (
                      <div className="text-slate-700">
                        建议补录：缺{formatMissing(r.softMissing)} <SupplementLink>去补录</SupplementLink>
                      </div>
                    ) : (
                      <div className="text-slate-400">-</div>
                    )}
                  </td>

                  <td className={InboundUI.tdCenter}>
                    <button
                      type="button"
                      disabled={blocked}
                      onClick={(e) => {
                        e.stopPropagation();
                        onReceive(l);
                      }}
                      className={InboundUI.btnGhost}
                    >
                      {savingAll ? "批量中…" : blocked ? "保存中…" : "记录"}
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* 不占视觉，但保留一个 debug hint 位：避免未来 taskId 成为“死参数” */}
      {taskId ? <div className="hidden" aria-hidden="true">{`task:${taskId}`}</div> : null}
    </div>
  );
};
