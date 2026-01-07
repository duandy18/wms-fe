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

  /** 当前定位的 item_id（由扫码/输入条码选中） */
  activeItemId?: number | null;

  /** ✅ 本次任务 id：用于“去补录”链接口径 */
  taskId?: number | null;

  /** ✅ 后端 supplements（主数据口径） */
  hardMissingByItemId: Record<number, string[]>;
  softMissingByItemId: Record<number, string[]>;

  onQtyChange: (itemId: number, value: string) => void;
  onReceive: (line: ReceiveTaskLine) => void;

  /** 点击行时切换定位（可选） */
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

      // 仅用于展示“合计/差异”，不用于默认填充输入框
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

              const varianceText = r.variance == null ? "-" : String(r.variance);

              const blocked = savingAll || savingItemId === l.item_id;
              const isActive = activeItemId != null && l.item_id === activeItemId;

              // ✅ 输入框只显示用户输入，不提供任何“剩余”提示
              const rawInput = (qtyInputs[l.item_id] ?? "").trim();

              return (
                <tr
                  key={l.id}
                  className={
                    "border-t border-slate-100 align-top " +
                    (isActive ? "bg-sky-50 ring-1 ring-sky-300" : "")
                  }
                  onClick={() => onRowClick?.(l)}
                  style={{ cursor: onRowClick ? "pointer" : "default" }}
                  title={onRowClick ? "点击该行可切换定位" : undefined}
                >
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-slate-900">{l.item_name ?? "（未命名商品）"}</div>
                      {isActive ? (
                        <span className="rounded bg-sky-100 px-2 py-0.5 text-[11px] text-sky-800">
                          已定位
                        </span>
                      ) : null}
                    </div>
                    <div className="text-[11px] text-slate-500">{l.spec_text ?? "-"}</div>
                  </td>

                  <td className="px-2 py-2 text-right font-mono">
                    {r.expected == null ? "-" : r.expected}
                  </td>
                  <td className="px-2 py-2 text-right font-mono">{r.received}</td>

                  <td className="px-2 py-2 text-right">
                    <input
                      className="w-24 rounded border border-slate-300 px-2 py-1 text-right font-mono bg-white"
                      placeholder=""
                      value={rawInput}
                      onChange={(e) => onQtyChange(l.item_id, e.target.value)}
                      disabled={blocked}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>

                  <td className="px-2 py-2 text-right font-mono">{r.after}</td>

                  <td className="px-2 py-2 text-right font-mono">{varianceText}</td>

                  <td className={`px-2 py-2 ${judgeCls}`}>{judgeText}</td>

                  <td className="px-2 py-2">
                    {r.showHard ? (
                      <div className="text-amber-800">
                        入库必需：缺{formatMissing(r.hardMissing)}{" "}
                        <SupplementLink source="purchase" taskId={taskId}>去补录</SupplementLink>
                      </div>
                    ) : r.showSoft ? (
                      <div className="text-slate-700">
                        建议补录：缺{formatMissing(r.softMissing)}{" "}
                        <SupplementLink source="purchase" taskId={taskId}>去补录</SupplementLink>
                      </div>
                    ) : (
                      <div className="text-slate-400">-</div>
                    )}
                  </td>

                  <td className="px-2 py-2 text-center">
                    <button
                      type="button"
                      disabled={blocked}
                      onClick={(e) => {
                        e.stopPropagation();
                        onReceive(l);
                      }}
                      className="rounded border border-slate-300 bg-white px-2 py-1 text-[12px] text-slate-700 hover:bg-slate-50 disabled:opacity-60"
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
    </div>
  );
};
