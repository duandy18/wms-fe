// src/features/ops/dev/order-parse-simulator/components/VariantInputsCard.tsx

import React from "react";
import type { VariantRow } from "../types";

export function VariantInputsCard(props: {
  platform: string;

  storesLoading: boolean;
  storesError: string | null;
  storeOptions: Array<{ shop_id: string; label: string }>;

  shopId: string;
  titlePrefix: string;
  spuKey: string;
  goodsTitle: string;

  rows: VariantRow[];

  onShopIdChange: (v: string) => void;
  onTitlePrefixChange: (v: string) => void;
  onSpuKeyChange: (v: string) => void;
  onGoodsTitleChange: (v: string) => void;
  onRowChange: (idx: number, patch: Partial<VariantRow>) => void;
}) {
  const {
    platform,
    storesLoading,
    storesError,
    storeOptions,
    shopId,
    titlePrefix,
    spuKey,
    goodsTitle,
    rows,
    onShopIdChange,
    onTitlePrefixChange,
    onSpuKeyChange,
    onGoodsTitleChange,
    onRowChange,
  } = props;

  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="text-lg font-semibold text-slate-900">订单解析模拟</div>
      <div className="text-sm text-slate-600 mt-1">
        面向运营/联调：模拟平台后台“规格编码（filled_code）”录入 → 一键跑 generate/run 闭环报告（仅 dev）。
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <label className="text-sm text-slate-700">
          平台（必填）
          <input className="mt-1 w-full rounded-md border px-3 py-2 bg-slate-50" value={platform} readOnly />
          <div className="text-xs text-slate-500 mt-1">当前版本固定为 PDD（后续如需多平台再扩展）。</div>
        </label>

        <label className="text-sm text-slate-700">
          商铺（shop_id，必填）
          <select
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={shopId}
            onChange={(e) => onShopIdChange(e.target.value)}
            disabled={storesLoading}
          >
            {storeOptions.length === 0 ? <option value="">（暂无可选商铺）</option> : null}
            {storeOptions.map((opt) => (
              <option key={opt.shop_id} value={opt.shop_id}>
                {opt.label}
              </option>
            ))}
          </select>
          {storesLoading ? <div className="text-xs text-slate-500 mt-1">加载商铺中…</div> : null}
          {storesError ? <div className="text-xs text-red-600 mt-1">{storesError}</div> : null}
        </label>

        <label className="text-sm text-slate-700">
          spu_key（必填）
          <input
            className="mt-1 w-full rounded-md border px-3 py-2 font-mono"
            value={spuKey}
            onChange={(e) => onSpuKeyChange(e.target.value)}
            placeholder="例如 SPU-DEMO-1"
          />
          <div className="text-xs text-slate-500 mt-1">用于模拟链接/商品维度（seed.links[].spu_key）。</div>
        </label>

        <label className="text-sm text-slate-700">
          商品标题（人类可读，可选）
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={goodsTitle}
            onChange={(e) => onGoodsTitleChange(e.target.value)}
            placeholder="例如 顽皮猫粮 冻干拌粮…"
          />
          <div className="text-xs text-slate-500 mt-1">仅用于生成订单 title 展示，不参与解析。</div>
        </label>

        <label className="text-sm text-slate-700 col-span-2">
          title_prefix（可选）
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={titlePrefix}
            onChange={(e) => onTitlePrefixChange(e.target.value)}
            placeholder="例如 【旗舰店】"
          />
          <div className="text-xs text-slate-500 mt-1">生成订单行标题时：title_prefix + title。</div>
        </label>
      </div>

      <div className="mt-4 rounded-lg border">
        <div className="px-3 py-2 text-sm font-semibold text-slate-900 bg-slate-50 border-b">规格输入（最多 6 个）</div>
        <div className="p-3 space-y-2">
          <div className="grid grid-cols-12 gap-2 text-xs text-slate-600">
            <div className="col-span-5">规格名称（给人看，不参与解析）</div>
            <div className="col-span-7">规格编码 / 填写码（filled_code，唯一解析锚点）</div>
          </div>

          {rows.map((r, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2">
              <input
                className="col-span-5 rounded-md border px-3 py-2 text-sm"
                value={r.variant_name}
                onChange={(e) => onRowChange(idx, { variant_name: e.target.value })}
                placeholder={`例如 1.5KG / 红色-L / 试吃装（第 ${idx + 1} 行）`}
              />
              <input
                className="col-span-7 rounded-md border px-3 py-2 text-sm font-mono"
                value={r.filled_code}
                onChange={(e) => onRowChange(idx, { filled_code: e.target.value })}
                placeholder="例如 FC-DEMO-001 / UT-REPLAY-FSKU-1 / FAKE-UNBOUND-001"
              />
            </div>
          ))}

          <div className="text-xs text-slate-500 mt-2">
            说明：规格名不参与解析；系统只用 filled_code 走「绑定 → FSKU → components → items」确定性解析。
          </div>
        </div>
      </div>
    </div>
  );
}
