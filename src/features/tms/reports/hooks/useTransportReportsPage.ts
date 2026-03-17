// src/features/tms/reports/hooks/useTransportReportsPage.ts

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchShippingByCarrier,
  fetchShippingByProvince,
  fetchShippingByShop,
  fetchShippingByWarehouse,
  fetchShippingDaily,
  fetchShippingReportOptions,
} from "../api";
import type {
  ShippingByCarrierRow,
  ShippingByProvinceRow,
  ShippingByShopRow,
  ShippingByWarehouseRow,
  ShippingDailyRow,
  ShippingReportFilterOptions,
  TransportReportsQuery,
} from "../types";

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

export function useTransportReportsPage() {
  const defaultRange = getDefaultDateRange();

  const [query, setQuery] = useState<TransportReportsQuery>({
    from_date: defaultRange.from_date,
    to_date: defaultRange.to_date,
    platform: "",
    shop_id: "",
    carrier_code: "",
    province: "",
    warehouse_id: undefined,
    city: "",
  });

  const [carrierRows, setCarrierRows] = useState<ShippingByCarrierRow[]>([]);
  const [provinceRows, setProvinceRows] = useState<ShippingByProvinceRow[]>([]);
  const [shopRows, setShopRows] = useState<ShippingByShopRow[]>([]);
  const [warehouseRows, setWarehouseRows] = useState<ShippingByWarehouseRow[]>([]);
  const [dailyRows, setDailyRows] = useState<ShippingDailyRow[]>([]);

  const [options, setOptions] = useState<ShippingReportFilterOptions>({
    platforms: [],
    shop_ids: [],
    provinces: [],
    cities: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function setField<K extends keyof TransportReportsQuery>(
    key: K,
    value: TransportReportsQuery[K],
  ): void {
    setQuery((prev) => ({ ...prev, [key]: value }));
  }

  function reset(): void {
    const next = getDefaultDateRange();
    setQuery({
      from_date: next.from_date,
      to_date: next.to_date,
      platform: "",
      shop_id: "",
      carrier_code: "",
      province: "",
      warehouse_id: undefined,
      city: "",
    });
  }

  const reload = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError("");

    try {
      const [byCarrier, byProvince, byShop, byWarehouse, daily, filterOptions] =
        await Promise.all([
          fetchShippingByCarrier(query),
          fetchShippingByProvince(query),
          fetchShippingByShop(query),
          fetchShippingByWarehouse(query),
          fetchShippingDaily(query),
          fetchShippingReportOptions({
            from_date: query.from_date,
            to_date: query.to_date,
            warehouse_id: query.warehouse_id,
          }),
        ]);

      setCarrierRows(byCarrier.rows ?? []);
      setProvinceRows(byProvince.rows ?? []);
      setShopRows(byShop.rows ?? []);
      setWarehouseRows(byWarehouse.rows ?? []);
      setDailyRows(daily.rows ?? []);
      setOptions(filterOptions);
    } catch (err) {
      const message = err instanceof Error ? err.message : "加载快递成本分析失败";
      setError(message);
      setCarrierRows([]);
      setProvinceRows([]);
      setShopRows([]);
      setWarehouseRows([]);
      setDailyRows([]);
      setOptions({
        platforms: [],
        shop_ids: [],
        provinces: [],
        cities: [],
      });
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const totalShipCnt = useMemo(
    () => carrierRows.reduce((sum, row) => sum + row.ship_cnt, 0),
    [carrierRows],
  );

  const totalCost = useMemo(
    () => carrierRows.reduce((sum, row) => sum + row.total_cost, 0),
    [carrierRows],
  );

  return {
    query,
    carrierRows,
    provinceRows,
    shopRows,
    warehouseRows,
    dailyRows,
    options,
    loading,
    error,
    totalShipCnt,
    totalCost,
    setField,
    reset,
    reload,
  };
}
