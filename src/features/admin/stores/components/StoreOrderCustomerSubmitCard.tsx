// src/features/admin/stores/components/StoreOrderCustomerSubmitCard.tsx

import React, { useMemo } from "react";
import type { StoreOrderIngestSimModel } from "./useStoreOrderIngestSimulator";

type CustomerDraft = {
  receiver_name: string;
  receiver_phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  zipcode: string;
};

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

  // ✅ order-level 客户信息（只填一次）
  customerDraft: CustomerDraft;
  setCustomerDraft: (next: CustomerDraft) => void;

  // ✅ 保存（落库/落表）的唯一入口：由页面层实现（调用后端接口）
  onSave: () => Promise<void>;
  saving: boolean;
  saveError: string | null;
  justSaved: boolean;
}> = ({ platform, shopId, storeId, model, customerDraft, setCustomerDraft, onSave, saving, saveError, justSaved }) => {
  const { state, actions } = model;

  const hasAnyChecked = useMemo(() => state.lineModels.some((m) => m.checked), [state.lineModels]);

  const canApply = useMemo(() => hasAnyChecked, [hasAnyChecked]);

  function setCustomer<K extends keyof CustomerDraft>(k: K, v: string) {
    setCustomerDraft({ ...customerDraft, [k]: v });
    // 保留老字段：province/city 继续写进 sim（避免其它地方依赖）
    if (k === "province") actions.setProvince(v);
    if (k === "city") actions.setCity(v);
  }

  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-base font-semibold text-slate-900">客户下单输入（客户信息 + 勾选 + 数量）</div>
          <div className="mt-1 text-xs text-slate-500">
            店铺锚点：platform={platform} / shop_id={shopId} / store_id={storeId}。客户信息为“订单级字段”，保存时会自动复制到所有已勾选行。
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

      {/* 客户信息（订单级） */}
      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="text-sm font-semibold text-slate-800">客户信息（订单级）</div>
            <div className="mt-1 text-xs text-slate-600">
              只需填写一次；保存时系统会自动复制到所有已勾选行，满足后端“一致性”校验。
            </div>
          </div>
          <button
            type="button"
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 disabled:opacity-50"
            disabled={!canApply}
            title={!canApply ? "请先勾选至少一行" : "保存时会自动应用到所有已勾选行"}
            onClick={() => void 0}
          >
            已勾选行将自动应用
          </button>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="min-w-0">
            <div className="text-xs text-slate-600">收货人（receiver_name）</div>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
              value={customerDraft.receiver_name}
              onChange={(e) => setCustomer("receiver_name", e.target.value)}
              placeholder="如：张三"
            />
          </div>

          <div className="min-w-0">
            <div className="text-xs text-slate-600">收货电话（receiver_phone）</div>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
              value={customerDraft.receiver_phone}
              onChange={(e) => setCustomer("receiver_phone", e.target.value)}
              placeholder="如：13800000000"
              inputMode="tel"
            />
          </div>

          <div className="min-w-0">
            <div className="text-xs text-slate-600">省份（province）</div>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
              value={customerDraft.province}
              onChange={(e) => setCustomer("province", e.target.value)}
              placeholder="如：河北省"
            />
          </div>

          <div className="min-w-0">
            <div className="text-xs text-slate-600">城市（city）</div>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
              value={customerDraft.city}
              onChange={(e) => setCustomer("city", e.target.value)}
              placeholder="如：廊坊"
            />
          </div>

          <div className="min-w-0">
            <div className="text-xs text-slate-600">区县（district，可选）</div>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
              value={customerDraft.district}
              onChange={(e) => setCustomer("district", e.target.value)}
              placeholder="如：固安"
            />
          </div>

          <div className="min-w-0">
            <div className="text-xs text-slate-600">邮编（zipcode，可选）</div>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
              value={customerDraft.zipcode}
              onChange={(e) => setCustomer("zipcode", e.target.value)}
              placeholder="如：065500"
              inputMode="numeric"
            />
          </div>

          <div className="min-w-0 md:col-span-2">
            <div className="text-xs text-slate-600">详细地址（detail）</div>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
              value={customerDraft.detail}
              onChange={(e) => setCustomer("detail", e.target.value)}
              placeholder="如：测试地址 1 号"
            />
          </div>
        </div>
      </div>

      {/* 下单明细 */}
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
          {!hasAnyChecked ? <div className="mt-2 text-xs text-slate-500">提示：可先填写客户信息并保存；执行前再勾选行。</div> : null}
        </div>
      </div>
    </div>
  );
};
