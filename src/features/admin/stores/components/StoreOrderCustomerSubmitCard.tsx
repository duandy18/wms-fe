// src/features/admin/stores/components/StoreOrderCustomerSubmitCard.tsx

import React, { useMemo } from "react";
import type { StoreOrderIngestSimModel } from "./useStoreOrderIngestSimulator";

function parsePositiveInt(s: string): number | null {
  const t = s.trim();
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n)) return null;
  if (!Number.isInteger(n)) return null;
  if (n <= 0) return null;
  return n;
}

export const StoreOrderCustomerSubmitCard: React.FC<{
  platform: string;
  shopId: string;
  storeId: number;
  model: StoreOrderIngestSimModel;

  // ✅ 保存（落库/落表）的唯一入口：由页面层实现（调用后端接口）
  onSave: () => Promise<void>;
  saving: boolean;
  saveError: string | null;
  justSaved: boolean;
}> = ({ platform, shopId, storeId, model, onSave, saving, saveError, justSaved }) => {
  const { state, actions } = model;

  const hasAnyChecked = useMemo(() => state.lineModels.some((m) => m.checked), [state.lineModels]);

  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-base font-semibold text-slate-900">客户下单输入（6 行 + 勾选 + 数量 + 地址）</div>
          <div className="mt-1 text-xs text-slate-500">
            店铺锚点：platform={platform} / shop_id={shopId} / store_id={storeId}。本卡负责“客户侧输入 + 保存”；不负责执行与解析展示。
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
            onClick={() => void onSave()}
            disabled={saving}
          >
            {saving ? "保存中…" : "保存并生效"}
          </button>
        </div>
      </div>

      {saveError ? (
        <div className="mt-3 rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">{saveError}</div>
      ) : null}

      {justSaved && !saveError ? (
        <div className="mt-3 rounded border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">客户下单输入已保存并生效。</div>
      ) : null}

      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div className="text-sm font-semibold text-slate-800">下单明细（固定 6 行）</div>
        <div className="mt-1 text-xs text-slate-600">客户勾选要购买的行，并填写 qty（正整数）。</div>

        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500">
                <th className="py-2 pr-2 w-12">选</th>
                <th className="py-2 pr-2 w-10">行</th>
                <th className="py-2 pr-2 min-w-[160px]">filled_code</th>
                <th className="py-2 pr-2 min-w-[220px]">title</th>
                <th className="py-2 pr-2 min-w-[260px]">spec</th>
                <th className="py-2 pr-2 w-28">qty</th>
              </tr>
            </thead>
            <tbody>
              {state.lineModels.map((m) => {
                const code = m.line.filled_code || "（空码）";
                const title = m.line.title ?? "—";
                const spec = m.line.spec ?? "—";
                const qtyOk = m.checked ? parsePositiveInt(m.qtyText) !== null : true;

                return (
                  <tr key={m.idx} className="border-t align-top">
                    <td className="py-2 pr-2">
                      <input type="checkbox" checked={m.checked} onChange={(e) => actions.toggleChecked(m.idx, e.target.checked)} />
                    </td>
                    <td className="py-2 pr-2 text-slate-500">{m.idx + 1}</td>
                    <td className="py-2 pr-2 font-mono text-xs text-slate-700">{code}</td>
                    <td className="py-2 pr-2 text-xs text-slate-700">{title}</td>
                    <td className="py-2 pr-2 text-xs text-slate-700 whitespace-pre-line">{spec}</td>
                    <td className="py-2 pr-2">
                      <input
                        className={[
                          "w-full rounded-md border px-2 py-1 text-sm",
                          !m.checked ? "bg-slate-100 text-slate-500" : "bg-white",
                          !qtyOk ? "border-red-300" : "border-slate-300",
                        ].join(" ")}
                        value={m.qtyText}
                        onChange={(e) => actions.setQtyText(m.idx, e.target.value)}
                        placeholder="正整数"
                        inputMode="numeric"
                        disabled={!m.checked}
                      />
                      {!qtyOk ? <div className="mt-1 text-[11px] text-red-600">qty 必须为正整数</div> : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {state.validateMessage ? <div className="mt-2 text-xs text-amber-700">提示：{state.validateMessage}</div> : null}
          {!hasAnyChecked ? <div className="mt-2 text-xs text-slate-500">提示：可先保存地址与默认 qty；执行前再勾选行。</div> : null}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="min-w-0">
          <div className="text-xs text-slate-600">省份（province）</div>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
            value={state.province}
            onChange={(e) => actions.setProvince(e.target.value)}
            placeholder="如：河北省"
          />
        </div>
        <div className="min-w-0">
          <div className="text-xs text-slate-600">城市（city）</div>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
            value={state.city}
            onChange={(e) => actions.setCity(e.target.value)}
            placeholder="如：廊坊市"
          />
        </div>
      </div>
    </div>
  );
};
