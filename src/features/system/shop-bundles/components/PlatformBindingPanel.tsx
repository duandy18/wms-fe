// src/features/system/shop-bundles/components/PlatformBindingPanel.tsx
import React from "react";
import type { Fsku, Platform, PlatformMirror, PlatformSkuBinding } from "../types";
import { PLATFORM_OPTIONS, fmtIso } from "../ui";

export const PlatformBindingPanel: React.FC<{
  platform: Platform;
  setPlatform: (p: Platform) => void;

  shopId: string;
  setShopId: (v: string) => void;

  platformSkuId: string;
  setPlatformSkuId: (v: string) => void;

  onLoadMirrorAndBindings: () => void;

  mirror: PlatformMirror | null;
  mirrorLoading: boolean;
  mirrorError: string | null;

  currentBinding: PlatformSkuBinding | null;
  historyBindings: PlatformSkuBinding[];
  bindingsLoading: boolean;
  bindingsError: string | null;

  reason: string;
  setReason: (v: string) => void;

  selectedFskuId: number | null;
  selectedFsku: Fsku | null;
  canBindSelected: boolean;

  onBindSelectedFsku: () => void;
}> = ({
  platform,
  setPlatform,
  shopId,
  setShopId,
  platformSkuId,
  setPlatformSkuId,
  onLoadMirrorAndBindings,
  mirror,
  mirrorLoading,
  mirrorError,
  currentBinding,
  historyBindings,
  bindingsLoading,
  bindingsError,
  reason,
  setReason,
  selectedFskuId,
  selectedFsku,
  canBindSelected,
  onBindSelectedFsku,
}) => {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
      <div className="text-sm font-semibold text-slate-800">② 平台链接 → 绑定 FSKU（人工决策）</div>

      <div className="grid gap-3 md:grid-cols-3">
        <label className="space-y-1">
          <div className="text-[11px] text-slate-500">平台</div>
          <select
            className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
            value={platform}
            onChange={(e) => setPlatform(e.target.value as Platform)}
          >
            {PLATFORM_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <div className="text-[11px] text-slate-500">商铺 shop_id</div>
          <input
            className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
            value={shopId}
            onChange={(e) => setShopId(e.target.value)}
          />
        </label>

        <label className="space-y-1">
          <div className="text-[11px] text-slate-500">platform_sku_id</div>
          <input
            className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
            value={platformSkuId}
            onChange={(e) => setPlatformSkuId(e.target.value)}
            placeholder="例：SKU-UNIQ-1"
          />
        </label>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          onClick={onLoadMirrorAndBindings}
          disabled={mirrorLoading || bindingsLoading}
        >
          {mirrorLoading || bindingsLoading ? "加载中…" : "拉取镜像 + 绑定信息"}
        </button>

        {currentBinding ? (
          <div className="text-[11px] text-slate-600">
            当前绑定：<span className="font-mono text-slate-900">{currentBinding.fsku_id}</span>
            <span className="ml-2 text-slate-500">（生效 {fmtIso(currentBinding.effective_from)}）</span>
          </div>
        ) : (
          <div className="text-[11px] text-slate-500">当前无绑定。</div>
        )}
      </div>

      {mirrorError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">{mirrorError}</div>
      ) : null}

      {bindingsError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">{bindingsError}</div>
      ) : null}

      <div className="rounded-lg border border-slate-200">
        <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-700">平台镜像（只读线索）</div>
        {mirror ? (
          <div className="px-3 py-3 space-y-2 text-xs">
            {mirror.lines.map((ln, idx) => (
              <div key={idx} className="rounded-md border border-slate-200 p-2">
                <div className="text-slate-900">{ln.item_name ?? "—"}</div>
                <div className="text-[11px] text-slate-600">规格文案：{ln.spec ?? "—"}</div>
                <div className="text-[11px] text-slate-600">交易数量：{ln.quantity ?? "—"}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-3 py-3 text-[12px] text-slate-500">尚未拉取镜像。</div>
        )}
      </div>

      <div className="rounded-lg border border-slate-200 p-3 space-y-2">
        <div className="text-[11px] font-semibold text-slate-700">绑定决策</div>
        <div className="text-[11px] text-slate-500">
          合同字段为 reason（不是 note）。绑定必须指向 published FSKU；如后端拒绝，直接显示 Problem.message。
        </div>

        <label className="block space-y-1">
          <div className="text-[11px] text-slate-500">reason（必填）</div>
          <input
            className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="例：bind-1 / bind-2 / test"
          />
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-60"
            onClick={onBindSelectedFsku}
            disabled={!selectedFskuId || !canBindSelected}
          >
            绑定已选 FSKU
          </button>

          <div className="text-[11px] text-slate-500">
            已选：<span className="font-mono">{selectedFskuId ?? "（未选择）"}</span>
            {selectedFsku ? (
              <span className="ml-2">
                状态：<span className="font-mono">{selectedFsku.status}</span>
                {selectedFsku.status !== "published" ? <span className="ml-2 text-slate-400">（需 published 才能绑定）</span> : null}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200">
        <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-700">绑定历史（后端 time-ranged）</div>
        {historyBindings.length ? (
          <div className="max-h-[240px] overflow-auto">
            <table className="min-w-full border-collapse text-xs">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-slate-200 text-[11px] text-slate-600">
                  <th className="px-3 py-2 text-left">platform/shop/sku</th>
                  <th className="px-3 py-2 text-left">FSKU</th>
                  <th className="px-3 py-2 text-left">生效</th>
                  <th className="px-3 py-2 text-left">失效</th>
                </tr>
              </thead>
              <tbody>
                {historyBindings.map((b) => (
                  <tr key={String(b.id)} className="border-b border-slate-100">
                    <td className="px-3 py-2 font-mono text-[11px] text-slate-800">
                      {b.platform}/{b.shop_id}/{b.platform_sku_id}
                    </td>
                    <td className="px-3 py-2 font-mono text-[11px] text-slate-900">{b.fsku_id}</td>
                    <td className="px-3 py-2 text-[11px] text-slate-700">{fmtIso(b.effective_from)}</td>
                    <td className="px-3 py-2 text-[11px] text-slate-500">{b.effective_to ? fmtIso(b.effective_to) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-3 py-3 text-[12px] text-slate-500">暂无绑定历史。</div>
        )}
      </div>
    </section>
  );
};
