// src/features/inventory/shipping-reports/ShippingReportsPage.tsx
//
// 发货成本报表 v2.5
// - 5 维聚合统计（快递 / 省份 / 店铺 / 仓库 / 日度）
// - 发货明细列表：支持城市/区县筛选 + 分页
// - 平台 / 店铺 / 省份 / 城市 使用下拉选项
// - 明细行一键跳转：发货账本详情 / Trace Studio
// - 状态分布小卡片（当前页）：在途 / 已签收 / 丢失 / 退回
//

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "../../../components/ui/PageTitle";
import {
  fetchShippingByCarrier,
  fetchShippingByProvince,
  fetchShippingByShop,
  fetchShippingByWarehouse,
  fetchShippingDaily,
  fetchShippingList,
  fetchShippingReportOptions,
  type ShippingCarrierRow,
  type ShippingProvinceRow,
  type ShippingShopRow,
  type ShippingWarehouseRow,
  type ShippingDailyRow,
  type ShippingListRow,
  type ShippingReportFilterOptions,
} from "./api";

type DateRange = {
  from_date: string;
  to_date: string;
};

function getDefaultDateRange(): DateRange {
  const today = new Date();
  const to = today.toISOString().slice(0, 10);
  const d7 = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
  const from = d7.toISOString().slice(0, 10);
  return { from_date: from, to_date: to };
}

const formatCurrency = (n: number | null | undefined) =>
  n == null ? "-" : `￥${n.toFixed(2)}`;

const formatPercent = (n: number | null | undefined) => {
  if (n == null) return "-";
  const sign = n > 0 ? "+" : "";
  return `${sign}${(n * 100).toFixed(1)}%`;
};

const formatDateTime = (s: string | null | undefined) =>
  s ? s.replace("T", " ").replace("Z", "") : "-";

const statusLabel = (status: string | null | undefined) => {
  const key = (status || "").toUpperCase();
  switch (key) {
    case "DELIVERED":
      return "已签收";
    case "IN_TRANSIT":
      return "在途";
    case "LOST":
      return "丢失";
    case "RETURNED":
      return "退回";
    default:
      return "其他";
  }
};

type ApiErrorShape = { message?: string };

const getErrorMessage = (err: unknown, fallback: string): string => {
  const e = err as ApiErrorShape;
  return e?.message ?? fallback;
};

const ShippingReportsPage: React.FC = () => {
  const navigate = useNavigate();

  const [range, setRange] = useState<DateRange>(getDefaultDateRange);

  const [platform, setPlatform] = useState("");
  const [shopId, setShopId] = useState("");
  const [carrierCode, setCarrierCode] = useState("");
  const [province, setProvince] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");

  const [carrierRows, setCarrierRows] = useState<ShippingCarrierRow[]>([]);
  const [provinceRows, setProvinceRows] = useState<ShippingProvinceRow[]>([]);
  const [shopRows, setShopRows] = useState<ShippingShopRow[]>([]);
  const [warehouseRows, setWarehouseRows] =
    useState<ShippingWarehouseRow[]>([]);
  const [dailyRows, setDailyRows] = useState<ShippingDailyRow[]>([]);
  const [listRows, setListRows] = useState<ShippingListRow[]>([]);

  const [listTotal, setListTotal] = useState(0);
  const pageSize = 50;
  const [listOffset, setListOffset] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [refQuickJump, setRefQuickJump] = useState("");

  const [options, setOptions] = useState<ShippingReportFilterOptions>({
    platforms: [],
    shop_ids: [],
    provinces: [],
    cities: [],
  });

  const buildQuery = (overrideOffset?: number) => ({
    ...range,
    platform: platform || undefined,
    shop_id: shopId || undefined,
    carrier_code: carrierCode || undefined,
    province: province || undefined,
    warehouse_id: warehouseId ? Number(warehouseId) : undefined,
    city: city || undefined,
    district: district || undefined,
    limit: pageSize,
    offset: overrideOffset ?? listOffset,
  });

  const reload = async (overrideOffset?: number) => {
    setLoading(true);
    setError(null);
    const query = buildQuery(overrideOffset);
    try {
      const [
        byCarrier,
        byProvince,
        byShop,
        byWarehouse,
        daily,
        list,
      ] = await Promise.all([
        fetchShippingByCarrier(query),
        fetchShippingByProvince(query),
        fetchShippingByShop(query),
        fetchShippingByWarehouse(query),
        fetchShippingDaily(query),
        fetchShippingList(query),
      ]);
      setCarrierRows(byCarrier.rows ?? []);
      setProvinceRows(byProvince.rows ?? []);
      setShopRows(byShop.rows ?? []);
      setWarehouseRows(byWarehouse.rows ?? []);
      setDailyRows(daily.rows ?? []);
      setListRows(list.rows ?? []);
      setListTotal(list.total ?? 0);
    } catch (err: unknown) {
      console.error("load shipping reports failed", err);
      setError(getErrorMessage(err, "加载发货报表失败"));
      setCarrierRows([]);
      setProvinceRows([]);
      setShopRows([]);
      setWarehouseRows([]);
      setDailyRows([]);
      setListRows([]);
      setListTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const reloadOptions = async () => {
    try {
      const opts = await fetchShippingReportOptions({
        from_date: range.from_date,
        to_date: range.to_date,
        warehouse_id: warehouseId ? Number(warehouseId) : undefined,
      });
      setOptions(opts);
    } catch (err) {
      console.error("load shipping report options failed", err);
      // 出错不影响主报表，保留旧 options
    }
  };

  useEffect(() => {
    void reload(0);
    void reloadOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRangeChange = (field: keyof DateRange, value: string) => {
    setRange((prev) => ({ ...prev, [field]: value }));
  };

  const handleApply = () => {
    setListOffset(0);
    void reload(0);
    void reloadOptions();
  };

  const totalShipCnt = carrierRows.reduce((sum, r) => sum + r.ship_cnt, 0);
  const totalCost = carrierRows.reduce((sum, r) => sum + r.total_cost, 0);

  const lastDayChange = useMemo(() => {
    if (dailyRows.length < 2) return null;
    const prev = dailyRows[dailyRows.length - 2];
    const last = dailyRows[dailyRows.length - 1];
    if (!prev || prev.total_cost === 0) return null;
    return (last.total_cost - prev.total_cost) / prev.total_cost;
  }, [dailyRows]);

  const currentPage =
    listTotal === 0 ? 0 : Math.floor(listOffset / pageSize) + 1;
  const totalPages = listTotal > 0 ? Math.ceil(listTotal / pageSize) : 0;

  const handlePageChange = (direction: "prev" | "next") => {
    if (direction === "prev") {
      const nextOffset = Math.max(0, listOffset - pageSize);
      if (nextOffset === listOffset) return;
      setListOffset(nextOffset);
      void reload(nextOffset);
    } else {
      const nextOffset = listOffset + pageSize;
      if (nextOffset >= listTotal) return;
      setListOffset(nextOffset);
      void reload(nextOffset);
    }
  };

  const handleQuickJump = () => {
    const ref = refQuickJump.trim();
    if (!ref) return;
    navigate(`/shipping/record?ref=${encodeURIComponent(ref)}`);
  };

  const getMetaField = (
    row: ShippingListRow,
    key: string,
  ): string | undefined => {
    const meta = (row.meta ?? {}) as Record<string, unknown>;
    const v = meta[key];
    return typeof v === "string" ? v : undefined;
  };

  const handleOpenRecordDetail = (row: ShippingListRow) => {
    navigate(`/shipping/record?ref=${encodeURIComponent(row.order_ref)}`);
  };

  const handleOpenTrace = (row: ShippingListRow) => {
    if (!row.trace_id) return;
    navigate(
      `/trace?trace_id=${encodeURIComponent(
        row.trace_id,
      )}&focus_ref=${encodeURIComponent(row.order_ref)}`,
    );
  };

  // 状态分布（当前页）
  const statusStats = useMemo(() => {
    let inTransit = 0;
    let delivered = 0;
    let lost = 0;
    let returned = 0;
    let other = 0;

    for (const r of listRows) {
      const key = (r.status || "").toUpperCase();
      switch (key) {
        case "IN_TRANSIT":
          inTransit += 1;
          break;
        case "DELIVERED":
          delivered += 1;
          break;
        case "LOST":
          lost += 1;
          break;
        case "RETURNED":
          returned += 1;
          break;
        default:
          other += 1;
          break;
      }
    }

    const total = inTransit + delivered + lost + returned + other || 1;

    const pct = (n: number) => (n === 0 ? 0 : (n / total) * 100);

    return {
      inTransit,
      delivered,
      lost,
      returned,
      other,
      pctInTransit: pct(inTransit),
      pctDelivered: pct(delivered),
      pctLost: pct(lost),
      pctReturned: pct(returned),
      pctOther: pct(other),
    };
  }, [listRows]);

  return (
    <div className="space-y-4 p-6">
      <PageTitle
        title="发货成本报表"
        description="基于 shipping_records 统计各快递公司 / 区域 / 店铺 / 仓库的发货成本结构，并支持查看单笔账本详情。"
      />

      {/* 顶部：过滤区 + 快速跳转 */}
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
                  onChange={(e) =>
                    handleRangeChange("from_date", e.target.value)
                  }
                />
              </div>
              <div className="flex items-center gap-1">
                <span>到</span>
                <input
                  type="date"
                  className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                  value={range.to_date}
                  onChange={(e) =>
                    handleRangeChange("to_date", e.target.value)
                  }
                />
              </div>
              <button
                type="button"
                onClick={() => setRange(getDefaultDateRange())}
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
                  onChange={(e) => setPlatform(e.target.value)}
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
                  onChange={(e) => setShopId(e.target.value)}
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
                  onChange={(e) => setCarrierCode(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-1">
                <span>省份</span>
                <select
                  className="w-32 rounded-md border border-slate-300 px-2 py-1 text-xs"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
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
                  onChange={(e) => setCity(e.target.value)}
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
                  onChange={(e) => setDistrict(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-1">
                <span>仓库 ID</span>
                <input
                  className="w-24 rounded-md border border-slate-300 px-2 py-1 text-xs"
                  placeholder="可选"
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
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
                {formatCurrency(totalCost)}
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              相比前一日总成本：
              <span
                className={
                  "ml-1 font-mono " +
                  (lastDayChange == null
                    ? "text-slate-400"
                    : lastDayChange > 0
                    ? "text-rose-600"
                    : lastDayChange < 0
                    ? "text-emerald-600"
                    : "text-slate-600")
                }
              >
                {formatPercent(lastDayChange)}
              </span>
            </div>
            <button
              type="button"
              onClick={handleApply}
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

        {/* 快速跳转到账本详情 */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-slate-600">
            <span className="font-semibold text-slate-700">
              快速查看账本详情：
            </span>
            <input
              className="w-64 rounded-md border border-slate-300 px-2 py-1 text-xs"
              placeholder="输入订单引用，例如 ORD:PDD:1:SHIP-DEMO-01"
              value={refQuickJump}
              onChange={(e) => setRefQuickJump(e.target.value)}
            />
            <button
              type="button"
              onClick={handleQuickJump}
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

      {/* 状态分布小卡片（当前页） */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">
            状态分布（当前页）
          </h2>
          <span className="text-[11px] text-slate-500">
            基于当前页明细记录统计：在途 / 已签收 / 丢失 / 退回
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <div className="rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-xs">
            <div className="text-[11px] text-sky-700">在途</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-mono text-lg font-semibold text-sky-800">
                {statusStats.inTransit}
              </span>
              <span className="text-[11px] text-slate-500">
                {statusStats.pctInTransit.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs">
            <div className="text-[11px] text-emerald-700">已签收</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-mono text-lg font-semibold text-emerald-800">
                {statusStats.delivered}
              </span>
              <span className="text-[11px] text-slate-500">
                {statusStats.pctDelivered.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs">
            <div className="text-[11px] text-rose-700">丢失</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-mono text-lg font-semibold text-rose-800">
                {statusStats.lost}
              </span>
              <span className="text-[11px] text-slate-500">
                {statusStats.pctLost.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs">
            <div className="text-[11px] text-amber-700">退回</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-mono text-lg font-semibold text-amber-800">
                {statusStats.returned}
              </span>
              <span className="text-[11px] text-slate-500">
                {statusStats.pctReturned.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs">
            <div className="text-[11px] text-slate-700">其他 / 未设置</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-mono text-lg font-semibold text-slate-800">
                {statusStats.other}
              </span>
              <span className="text-[11px] text-slate-500">
                {statusStats.pctOther.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 第一排：按快递公司 / 按省份 */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* 按快递公司 */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">
              按快递公司统计
            </h2>
            <span className="text-[11px] text-slate-500">
              按 cost_estimated 聚合
            </span>
          </div>
          {carrierRows.length === 0 ? (
            <p className="text-xs text-slate-500">
              当前筛选范围内没有发货记录。
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-100">
              <table className="min-w-full border-collapse text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      快递公司
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-500">
                      发货次数
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-500">
                      总成本
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-500">
                      平均成本
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {carrierRows.map((r) => (
                    <tr
                      key={`${r.carrier_code ?? "NULL"}-${r.carrier_name ?? ""}`}
                      className="border-t border-slate-100"
                    >
                      <td className="px-3 py-2">
                        <div className="flex flex-col">
                          <span className="text-slate-800">
                            {r.carrier_name || "-"}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {r.carrier_code || ""}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {r.ship_cnt}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {formatCurrency(r.total_cost)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {formatCurrency(r.avg_cost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* 按省份 */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">
              按省份统计
            </h2>
          </div>
          {provinceRows.length === 0 ? (
            <p className="text-xs text-slate-500">
              当前筛选范围内没有发货记录。
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-100">
              <table className="min-w-full border-collapse text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      省份
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-500">
                      发货次数
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-500">
                      总成本
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-500">
                      平均成本
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {provinceRows.map((r) => (
                    <tr
                      key={r.province ?? "UNKNOWN"}
                      className="border-t border-slate-100"
                    >
                      <td className="px-3 py-2">
                        {r.province || (
                          <span className="text-slate-400">未知</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {r.ship_cnt}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {formatCurrency(r.total_cost)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {formatCurrency(r.avg_cost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* 第二排：按店铺 / 按仓库 */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* 按店铺 */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">
              按店铺统计
            </h2>
          </div>
          {shopRows.length === 0 ? (
            <p className="text-xs text-slate-500">
              当前筛选范围内没有发货记录。
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-100">
              <table className="min-w-full border-collapse text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      平台 / 店铺
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-500">
                      发货次数
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-500">
                      总成本
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-500">
                      平均成本
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {shopRows.map((r) => (
                    <tr
                      key={`${r.platform}-${r.shop_id}`}
                      className="border-t border-slate-100"
                    >
                      <td className="px-3 py-2">
                        <div className="flex flex-col">
                          <span className="text-slate-800">
                            {r.platform}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            shop: {r.shop_id}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {r.ship_cnt}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {formatCurrency(r.total_cost)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {formatCurrency(r.avg_cost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* 按仓库 */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">
              按仓库统计
            </h2>
          </div>
          {warehouseRows.length === 0 ? (
            <p className="text-xs text-slate-500">
              当前筛选范围内没有发货记录，或者尚未记录仓库 ID。
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-100">
              <table className="min-w-full border-collapse text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      仓库 ID
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-500">
                      发货次数
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-500">
                      总成本
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-500">
                      平均成本
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {warehouseRows.map((r, idx) => (
                    <tr
                      key={r.warehouse_id ?? `NULL-${idx}`}
                      className="border-t border-slate-100"
                    >
                      <td className="px-3 py-2">
                        {r.warehouse_id ?? (
                          <span className="text-slate-400">未知</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {r.ship_cnt}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {formatCurrency(r.total_cost)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {formatCurrency(r.avg_cost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* 第三排：发货明细列表（分页 + 钻取） */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">
            发货明细列表
          </h2>
          <div className="text-[11px] text-slate-500">
            共{" "}
            <span className="font-mono font-semibold text-slate-800">
              {listTotal}
            </span>{" "}
            条记录，
            {listTotal > 0 ? (
              <>
                当前第 <span className="font-mono">{currentPage}</span> /
                <span className="font-mono">{totalPages}</span> 页
              </>
            ) : (
              "暂无数据"
            )}
          </div>
        </div>

        {listRows.length === 0 ? (
          <p className="text-xs text-slate-500">
            当前筛选范围内暂无发货明细记录。
          </p>
        ) : (
          <>
            <div className="overflow-auto rounded-xl border border-slate-100">
              <table className="min-w-full border-collapse text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      时间
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      订单引用
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      快递公司
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      目的地
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-500">
                      仓库
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-500">
                      毛重(kg)
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-500">
                      预估费用
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      状态
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {listRows.map((r) => {
                    const destProvince = getMetaField(r, "dest_province");
                    const destCity = getMetaField(r, "dest_city");
                    const destDistrict = getMetaField(r, "dest_district");
                    return (
                      <tr
                        key={r.id}
                        className="border-t border-slate-100 hover:bg-slate-50"
                      >
                        <td className="px-3 py-2 text-[11px] text-slate-500">
                          {formatDateTime(r.created_at)}
                        </td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            onClick={() => handleOpenRecordDetail(r)}
                            className="font-mono text-[11px] text-sky-700 hover:underline"
                          >
                            {r.order_ref}
                          </button>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-col">
                            <span className="text-slate-800">
                              {r.carrier_name || "-"}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {r.carrier_code || ""}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-[11px] text-slate-600">
                          {destProvince || destCity || destDistrict ? (
                            <>
                              {destProvince ?? "-"} {destCity ?? ""}{" "}
                              {destDistrict ?? ""}
                            </>
                          ) : (
                            <span className="text-slate-400">未知</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right font-mono">
                          {r.warehouse_id ?? "-"}
                        </td>
                        <td className="px-3 py-2 text-right font-mono">
                          {r.gross_weight_kg ?? "-"}
                        </td>
                        <td className="px-3 py-2 text-right font-mono">
                          {formatCurrency(r.cost_estimated ?? null)}
                        </td>
                        <td className="px-3 py-2 font-mono">
                          {r.status ? statusLabel(r.status) : "-"}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenRecordDetail(r)}
                              className="rounded border border-slate-300 px-2 py-[2px] text-[11px] text-slate-700 hover:bg-slate-50"
                            >
                              账本
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenTrace(r)}
                              disabled={!r.trace_id}
                              className={
                                "rounded border px-2 py-[2px] text-[11px] " +
                                (r.trace_id
                                  ? "border-sky-300 text-sky-700 hover:bg-sky-50"
                                  : "border-slate-200 text-slate-300")
                              }
                            >
                              Trace
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-600">
              <div>
                当前显示第{" "}
                <span className="font-mono">
                  {listTotal === 0 ? 0 : listOffset + 1}-
                  {Math.min(listOffset + pageSize, listTotal)}
                </span>{" "}
                条记录
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange("prev")}
                  disabled={listOffset === 0}
                  className={
                    "rounded border px-2 py-1 " +
                    (listOffset === 0
                      ? "border-slate-200 text-slate-300"
                      : "border-slate-300 text-slate-700 hover:bg-slate-50")
                  }
                >
                  上一页
                </button>
                <button
                  type="button"
                  onClick={() => handlePageChange("next")}
                  disabled={listOffset + pageSize >= listTotal}
                  className={
                    "rounded border px-2 py-1 " +
                    (listOffset + pageSize >= listTotal
                      ? "border-slate-200 text-slate-300"
                      : "border-slate-300 text-slate-700 hover:bg-slate-50")
                  }
                >
                  下一页
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default ShippingReportsPage;
