// src/features/shipment/pages/ShipmentReportsPage.tsx
//
// 分拆说明：
// - 本文件已完成按功能拆分：
//   1) 顶部过滤区拆到 components/ShippingReportsFilters.tsx
//   2) 状态分布卡片拆到 components/ShippingStatusStatsCards.tsx
//   3) 发货明细表拆到 components/ShippingReportsListTable.tsx
//   4) 四块聚合表拆到 components/ShippingReportsSummaryTables.tsx
// - 当前主文件只保留页面编排、数据请求、聚合统计与路由动作。

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "../../../components/ui/PageTitle";
import { getShipmentStatusLabel } from "../domain/shipmentStatus";
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
} from "../api/shippingReportsApi";
import ShippingReportsFilters from "../components/ShippingReportsFilters";
import ShippingStatusStatsCards from "../components/ShippingStatusStatsCards";
import ShippingReportsSummaryTables from "../components/ShippingReportsSummaryTables";
import ShippingReportsListTable from "../components/ShippingReportsListTable";

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

type ApiErrorShape = { message?: string };

const getErrorMessage = (err: unknown, fallback: string): string => {
  const e = err as ApiErrorShape;
  return e?.message ?? fallback;
};

const ShipmentReportsPage: React.FC = () => {
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

  const statusStats = useMemo(() => {
    let inTransit = 0;
    let delivered = 0;
    let lost = 0;
    let returned = 0;
    let other = 0;

    for (const r of listRows) {
      const label = getShipmentStatusLabel(r.status);
      switch (label) {
        case "运输中":
          inTransit += 1;
          break;
        case "已签收":
          delivered += 1;
          break;
        case "丢失":
          lost += 1;
          break;
        case "已退回":
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

  const lastDayChangeClassName =
    lastDayChange == null
      ? "text-slate-400"
      : lastDayChange > 0
      ? "text-rose-600"
      : lastDayChange < 0
      ? "text-emerald-600"
      : "text-slate-600";

  return (
    <div className="space-y-4 p-6">
      <PageTitle
        title="发货成本报表"
        description="基于 shipping_records 统计各快递公司 / 区域 / 店铺 / 仓库的发货成本结构，并支持查看单笔账本详情。"
      />

      <ShippingReportsFilters
        range={range}
        platform={platform}
        shopId={shopId}
        carrierCode={carrierCode}
        province={province}
        warehouseId={warehouseId}
        city={city}
        district={district}
        loading={loading}
        error={error}
        refQuickJump={refQuickJump}
        options={options}
        totalShipCnt={totalShipCnt}
        totalCostText={formatCurrency(totalCost)}
        lastDayChangeText={formatPercent(lastDayChange)}
        lastDayChangeClassName={lastDayChangeClassName}
        onRangeChange={handleRangeChange}
        onResetRecent7Days={() => setRange(getDefaultDateRange())}
        onPlatformChange={setPlatform}
        onShopIdChange={setShopId}
        onCarrierCodeChange={setCarrierCode}
        onProvinceChange={setProvince}
        onCityChange={setCity}
        onDistrictChange={setDistrict}
        onWarehouseIdChange={setWarehouseId}
        onApply={handleApply}
        onRefQuickJumpChange={setRefQuickJump}
        onQuickJump={handleQuickJump}
      />

      <ShippingStatusStatsCards stats={statusStats} />

      <ShippingReportsSummaryTables
        carrierRows={carrierRows}
        provinceRows={provinceRows}
        shopRows={shopRows}
        warehouseRows={warehouseRows}
      />

      <ShippingReportsListTable
        listRows={listRows}
        listTotal={listTotal}
        listOffset={listOffset}
        pageSize={pageSize}
        currentPage={currentPage}
        totalPages={totalPages}
        onOpenRecordDetail={handleOpenRecordDetail}
        onOpenTrace={handleOpenTrace}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default ShipmentReportsPage;
