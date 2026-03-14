// src/features/shipment/components/ShippingReportsFilters.tsx
//
// 分拆说明：
// - 本文件从 ShippingReportsPage.tsx 中拆出顶部“过滤区 + 快速跳转 + 错误提示”区域。
// - 目标是把筛选输入、顶部汇总、快速跳转动作从主页面中剥离，降低主文件复杂度。
// - 当前保持受控组件模式：状态与事件由父组件传入，不在本组件内发请求。

import React from "react";
import type { ShippingReportFilterOptions } from "../api/shippingReportsApi";

type DateRange = {
  from_date: string;
  to_date: string;
};

type Props = {
  range: DateRange;
  platform: string;
  shopId: string;
  carrierCode: string;
  province: string;
  warehouseId: string;
  city: string;
  district: string;
  loading: boolean;
  error: string | null;
  refQuickJump: string;
  options: ShippingReportFilterOptions;
  totalShipCnt: number;
  totalCostText: string;
  lastDayChangeText: string;
  lastDayChangeClassName: string;
  onRangeChange: (field: keyof DateRange, value: string) => void;
  onResetRecent7Days: () => void;
  onPlatformChange: (value: string) => void;
  onShopIdChange: (value: string) => void;
  onCarrierCodeChange: (value: string) => void;
  onProvinceChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onDistrictChange: (value: string) => void;
  onWarehouseIdChange: (value: string) => void;
  onApply: () => void;
  onRefQuickJumpChange: (value: string) => void;
  onQuickJump: () => void;
};

const ShippingReportsFilters: React.FC<Props> = ({
  range,
  platform,
  shopId,
  carrierCode,
  province,
  warehouseId,
  city,
  district,
  loading,
  error,
  refQuickJump,
  options,
  totalShipCnt,
  totalCostText,
  lastDayChangeText,
  lastDayChangeClassName,
  onRangeChange,
  onResetRecent7Days,
  onPlatformChange,
  onShopIdChange,
  onCarrierCodeChange,
  onProvinceChange,
  onCityChange,
  onDistrictChange,
  onWarehouseIdChange,
  onApply,
  onRefQuickJumpChange,
  onQuickJump,
}) => {
  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2 text-sm">
          <div className="text-xs font-semibold text-slate-700">
            日期 & 维度过滤
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <div className="flex items-center gap-1">
              <span>从</span>
              <input
                type="date"
                className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                value={range.from_date}
                onChange={(e) => onRangeChange("from_date", e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1">
              <span>到</span>
              <input
                type="date"
                className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                value={range.to_date}
                onChange={(e) => onRangeChange("to_date", e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={onResetRecent7Days}
              className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
            >
              最近 7 天
            </button>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-slate-600 md:grid-cols-3">
            <div className="flex items-center gap-1">
              <span>平台</span>
              <select
                className="w-28 rounded-md border border-slate-300 px-2 py-1 text-xs"
                value={platform}
                onChange={(e) => onPlatformChange(e.target.value)}
              >
                <option value="">全部</option>
                {options.platforms.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <span>店铺 ID</span>
              <select
                className="w-28 rounded-md border border-slate-300 px-2 py-1 text-xs"
                value={shopId}
                onChange={(e) => onShopIdChange(e.target.value)}
              >
                <option value="">全部</option>
                {options.shop_ids.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <span>快递编码</span>
              <input
                className="w-28 rounded-md border border-slate-300 px-2 py-1 text-xs"
                placeholder="如 ZTO"
                value={carrierCode}
                onChange={(e) => onCarrierCodeChange(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-1">
              <span>省份</span>
              <select
                className="w-32 rounded-md border border-slate-300 px-2 py-1 text-xs"
                value={province}
                onChange={(e) => onProvinceChange(e.target.value)}
              >
                <option value="">全部</option>
                {options.provinces.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <span>城市</span>
              <select
                className="w-32 rounded-md border border-slate-300 px-2 py-1 text-xs"
                value={city}
                onChange={(e) => onCityChange(e.target.value)}
              >
                <option value="">全部</option>
                {options.cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <span>区县</span>
              <input
                className="w-32 rounded-md border border-slate-300 px-2 py-1 text-xs"
                placeholder="如 南山区"
                value={district}
                onChange={(e) => onDistrictChange(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-1">
              <span>仓库 ID</span>
              <input
                className="w-24 rounded-md border border-slate-300 px-2 py-1 text-xs"
                placeholder="可选"
                value={warehouseId}
                onChange={(e) => onWarehouseIdChange(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 text-xs">
          <div className="text-slate-500">
            发货总数：
            <span className="font-mono font-semibold text-slate-800">
              {totalShipCnt}
            </span>
            ，总成本：
            <span className="font-mono font-semibold text-slate-800">
              {totalCostText}
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            相比前一日总成本：
            <span className={`ml-1 font-mono ${lastDayChangeClassName}`}>
              {lastDayChangeText}
            </span>
          </div>
          <button
            type="button"
            onClick={onApply}
            disabled={loading}
            className={
              "inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium text-white " +
              (loading
                ? "bg-sky-400 opacity-70"
                : "bg-sky-600 hover:bg-sky-700")
            }
          >
            {loading ? "加载中…" : "刷新报表"}
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 text-slate-600">
          <span className="font-semibold text-slate-700">
            快速查看账本详情：
          </span>
          <input
            className="w-64 rounded-md border border-slate-300 px-2 py-1 text-xs"
            placeholder="输入订单引用，例如 ORD:PDD:1:SHIP-DEMO-01"
            value={refQuickJump}
            onChange={(e) => onRefQuickJumpChange(e.target.value)}
          />
          <button
            type="button"
            onClick={onQuickJump}
            className="inline-flex items-center rounded-md bg-slate-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
          >
            打开账本详情页
          </button>
        </div>
        <div className="text-[11px] text-slate-400">
          也可以在「发货账本详情」页面直接查询，或从其他页面通过
          <span className="font-mono"> /shipping/record?ref=... </span>
          跳转。
        </div>
      </div>

      {error && (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}
    </section>
  );
};

export default ShippingReportsFilters;
