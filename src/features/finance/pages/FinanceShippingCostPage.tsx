import { useCallback, useEffect, useMemo, useState } from "react";
import PageTitle from "../../../components/ui/PageTitle";
import {
  fetchFinanceShippingLedger,
  fetchFinanceShippingLedgerOptions,
} from "../api/financeApi";
import type {
  FinanceShippingLedgerQuery,
  ShippingCostLedgerOptionsResponse,
  ShippingCostLedgerRow,
} from "../contracts/finance";
import { formatCurrency } from "../model/formatters";

const errorMessage = (err: unknown, fallback: string): string =>
  err instanceof Error ? err.message : fallback;

const emptyOptions: ShippingCostLedgerOptionsResponse = {
  shops: [],
  warehouses: [],
  providers: [],
};

function shopLabel(shop: ShippingCostLedgerOptionsResponse["shops"][number]) {
  const parts = [
    shop.platform,
    shop.shop_id,
    shop.shop_name ? `店铺:${shop.shop_name}` : "",
  ].filter(Boolean);
  return parts.join(" · ");
}

function warehouseLabel(
  warehouse: ShippingCostLedgerOptionsResponse["warehouses"][number],
) {
  return `${warehouse.warehouse_name || `仓库 ${warehouse.warehouse_id}`} · ID:${warehouse.warehouse_id}`;
}

function providerLabel(
  provider: ShippingCostLedgerOptionsResponse["providers"][number],
) {
  const parts = [
    provider.shipping_provider_name || `网点 ${provider.shipping_provider_id}`,
    `ID:${provider.shipping_provider_id}`,
    provider.shipping_provider_code
      ? `编号:${provider.shipping_provider_code}`
      : "",
  ].filter(Boolean);
  return parts.join(" · ");
}

function parseOptionalId(value: string, label: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${label} 必须是正整数`);
  }
  return parsed;
}

function splitShopValue(
  value: string,
): Pick<FinanceShippingLedgerQuery, "platform" | "shop_id"> {
  const trimmed = value.trim();
  if (!trimmed) return {};
  const [platform, shopId] = trimmed.split("::");
  if (!platform || !shopId) return {};
  return { platform, shop_id: shopId };
}

function shopValue(shop: ShippingCostLedgerOptionsResponse["shops"][number]) {
  return `${shop.platform}::${shop.shop_id}`;
}

function platformOptionsFrom(
  shops: ShippingCostLedgerOptionsResponse["shops"],
): string[] {
  return Array.from(
    new Set(
      shops
        .map((shop) => shop.platform.trim())
        .filter((platform) => platform.length > 0),
    ),
  ).sort((a, b) => a.localeCompare(b, "zh-CN"));
}

function formatMoney(value: number | null | undefined) {
  return value == null ? "-" : formatCurrency(value);
}

function formatWeight(value: number | null | undefined) {
  if (value == null) return "-";
  return `${value.toFixed(3)} kg`;
}


export default function FinanceShippingCostPage() {
  const [ledgerRows, setLedgerRows] = useState<ShippingCostLedgerRow[]>([]);
  const [baseOptions, setBaseOptions] =
    useState<ShippingCostLedgerOptionsResponse>(emptyOptions);
  const [options, setOptions] =
    useState<ShippingCostLedgerOptionsResponse>(emptyOptions);

  const [platformText, setPlatformText] = useState("");
  const [shopText, setShopText] = useState("");
  const [warehouseIdText, setWarehouseIdText] = useState("");
  const [shippingProviderIdText, setShippingProviderIdText] = useState("");
  const [orderKeyword, setOrderKeyword] = useState("");
  const [trackingNo, setTrackingNo] = useState("");

  const [loading, setLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  const platformOptions = useMemo(
    () => platformOptionsFrom(baseOptions.shops),
    [baseOptions.shops],
  );

  const shopOptions = useMemo(() => {
    const source = options.shops.length > 0 ? options.shops : baseOptions.shops;
    if (!platformText) return source;
    return source.filter((shop) => shop.platform === platformText);
  }, [baseOptions.shops, options.shops, platformText]);

  const buildSelectedOptionQuery = useCallback((): FinanceShippingLedgerQuery => {
    const shopQuery = splitShopValue(shopText);
    return {
      platform: shopQuery.platform ?? (platformText || undefined),
      shop_id: shopQuery.shop_id,
      warehouse_id: parseOptionalId(warehouseIdText, "仓库"),
      shipping_provider_id: parseOptionalId(
        shippingProviderIdText,
        "物流网点",
      ),
    };
  }, [platformText, shippingProviderIdText, shopText, warehouseIdText]);

  const loadBaseOptions = useCallback(async () => {
    try {
      const data = await fetchFinanceShippingLedgerOptions();
      setBaseOptions(data);
    } catch (err: unknown) {
      console.error("load finance shipping base options failed", err);
      setBaseOptions(emptyOptions);
    }
  }, []);

  const loadOptions = useCallback(async () => {
    setOptionsLoading(true);
    setOptionsError(null);
    try {
      const data = await fetchFinanceShippingLedgerOptions(
        buildSelectedOptionQuery(),
      );
      setOptions(data);
    } catch (err: unknown) {
      console.error("load finance shipping ledger options failed", err);
      setOptions(emptyOptions);
      setOptionsError(errorMessage(err, "加载筛选选项失败"));
    } finally {
      setOptionsLoading(false);
    }
  }, [buildSelectedOptionQuery]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const ledger = await fetchFinanceShippingLedger({
        ...buildSelectedOptionQuery(),
        order_keyword: orderKeyword.trim() || undefined,
        tracking_no: trackingNo.trim() || undefined,
      });

      setLedgerRows(ledger.rows);
    } catch (err: unknown) {
      console.error("load finance shipping ledger failed", err);
      setError(errorMessage(err, "加载物流成本核算表失败"));
      setLedgerRows([]);
    } finally {
      setLoading(false);
    }
  }, [buildSelectedOptionQuery, orderKeyword, trackingNo]);

  useEffect(() => {
    void loadBaseOptions();
  }, [loadBaseOptions]);

  useEffect(() => {
    void loadOptions();
  }, [loadOptions]);

  useEffect(() => {
    void load();
  }, [load]);

  const resetFilters = useCallback(() => {
    setPlatformText("");
    setShopText("");
    setWarehouseIdText("");
    setShippingProviderIdText("");
    setOrderKeyword("");
    setTrackingNo("");
  }, []);

  return (
    <div className="space-y-6 p-6">
      <PageTitle
        title="财务分析 · 物流成本"
        description="按平台、店铺、仓库和物流网点查询物流成本核算表。一行代表一条发货包裹记录；当前阶段只展示预计物流价格。"
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-3 text-xs text-slate-700">
            <div className="text-xs font-semibold text-slate-800">
              筛选条件
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-1">
                <span>平台</span>
                <select
                  className="w-32 rounded-md border border-slate-300 px-2 py-1 text-xs"
                  value={platformText}
                  disabled={optionsLoading}
                  onChange={(e) => {
                    setPlatformText(e.target.value);
                    setShopText("");
                  }}
                >
                  <option value="">
                    {optionsLoading ? "平台加载中…" : "全部平台"}
                  </option>
                  {platformOptions.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-1">
                <span>店铺</span>
                <select
                  className="w-64 rounded-md border border-slate-300 px-2 py-1 text-xs"
                  value={shopText}
                  disabled={optionsLoading || !platformText}
                  onChange={(e) => setShopText(e.target.value)}
                >
                  <option value="">
                    {!platformText
                      ? "请先选择平台"
                      : optionsLoading
                        ? "店铺加载中…"
                        : "全部店铺"}
                  </option>
                  {shopOptions.map((shop) => (
                    <option key={shopValue(shop)} value={shopValue(shop)}>
                      {shopLabel(shop)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-1">
                <span>仓库</span>
                <select
                  className="w-56 rounded-md border border-slate-300 px-2 py-1 text-xs"
                  value={warehouseIdText}
                  disabled={optionsLoading}
                  onChange={(e) => {
                    setWarehouseIdText(e.target.value);
                    setShippingProviderIdText("");
                  }}
                >
                  <option value="">
                    {optionsLoading ? "仓库加载中…" : "全部仓库"}
                  </option>
                  {options.warehouses.map((warehouse) => (
                    <option
                      key={warehouse.warehouse_id}
                      value={String(warehouse.warehouse_id)}
                    >
                      {warehouseLabel(warehouse)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-1">
                <span>物流网点</span>
                <select
                  className="w-64 rounded-md border border-slate-300 px-2 py-1 text-xs"
                  value={shippingProviderIdText}
                  disabled={optionsLoading}
                  onChange={(e) => setShippingProviderIdText(e.target.value)}
                >
                  <option value="">
                    {optionsLoading ? "物流网点加载中…" : "全部物流网点"}
                  </option>
                  {options.providers.map((provider) => (
                    <option
                      key={provider.shipping_provider_id}
                      value={String(provider.shipping_provider_id)}
                    >
                      {providerLabel(provider)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-1">
                <span>订单号</span>
                <input
                  className="w-64 rounded-md border border-slate-300 px-2 py-1 text-xs"
                  value={orderKeyword}
                  onChange={(e) => setOrderKeyword(e.target.value)}
                  placeholder="订单号模糊搜索"
                />
              </label>

              <label className="flex items-center gap-1">
                <span>运单号</span>
                <input
                  className="w-56 rounded-md border border-slate-300 px-2 py-1 text-xs"
                  value={trackingNo}
                  onChange={(e) => setTrackingNo(e.target.value)}
                  placeholder="精确匹配"
                />
              </label>
            </div>

            {optionsError && (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] text-amber-700">
                {optionsError}
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-2 text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetFilters}
                disabled={loading || optionsLoading}
                className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                重置
              </button>
              <button
                type="button"
                onClick={() => void load()}
                disabled={loading}
                className={
                  "inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium text-white " +
                  (loading
                    ? "bg-sky-400 opacity-70"
                    : "bg-sky-600 hover:bg-sky-700")
                }
              >
                {loading ? "加载中…" : "查询"}
              </button>
            </div>
            {error && (
              <div className="max-w-xs rounded-md border border-red-200 bg-red-50 px-3 py-1 text-[11px] text-red-700">
                {error}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              物流成本核算表
            </h2>
            <p className="mt-1 text-[11px] text-slate-500">
              一行代表一条发货包裹记录；预计物流价格来自后端财务事实表 finance_shipping_cost_lines。
            </p>
          </div>
          <span className="text-[11px] text-slate-500">
            当前行数：
            <span className="ml-1 font-mono font-semibold text-slate-900">
              {ledgerRows.length}
            </span>
          </span>
        </div>

        <div className="overflow-auto rounded-xl border border-slate-100">
          <table className="min-w-full border-collapse text-xs">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-right font-semibold text-slate-500">
                  发货记录ID
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-500">
                  平台
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-500">
                  店铺 ID
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-500">
                  店铺名称
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-500">
                  订单号
                </th>
                <th className="px-3 py-2 text-right font-semibold text-slate-500">
                  包裹号
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-500">
                  运单号
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-500">
                  仓库
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-500">
                  物流网点编号
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-500">
                  物流网点名称
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-500">
                  发货日期
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-500">
                  目的省
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-500">
                  目的市
                </th>
                <th className="px-3 py-2 text-right font-semibold text-slate-500">
                  总重
                </th>
                <th className="px-3 py-2 text-right font-semibold text-slate-500">
                  基础运费
                </th>
                <th className="px-3 py-2 text-right font-semibold text-slate-500">
                  附加费
                </th>
                <th className="px-3 py-2 text-right font-semibold text-slate-500">
                  预计物流价格
                </th>
              </tr>
            </thead>
            <tbody>
              {ledgerRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={17}
                    className="px-3 py-8 text-center text-xs text-slate-500"
                  >
                    当前筛选条件下暂无物流成本核算数据。
                  </td>
                </tr>
              ) : (
                ledgerRows.map((row) => (
                  <tr
                    key={row.shipping_record_id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-3 py-2 text-right font-mono text-[11px]">
                      {row.shipping_record_id}
                    </td>
                    <td className="px-3 py-2 font-mono text-[11px]">
                      {row.platform}
                    </td>
                    <td className="px-3 py-2 font-mono text-[11px]">
                      {row.shop_id}
                    </td>
                    <td className="px-3 py-2 text-slate-800">
                      {row.shop_name || "-"}
                    </td>
                    <td className="px-3 py-2 font-mono text-[11px] text-slate-800">
                      {row.order_ref}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {row.package_no}
                    </td>
                    <td className="px-3 py-2 font-mono text-[11px]">
                      {row.tracking_no || "-"}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {row.warehouse_name || `仓库 ${row.warehouse_id}`}
                    </td>
                    <td className="px-3 py-2 font-mono text-[11px]">
                      {row.shipping_provider_code || "-"}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {row.shipping_provider_name || "-"}
                    </td>
                    <td className="px-3 py-2 font-mono text-[11px] text-slate-700">
                      {row.shipped_date}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {row.dest_province || "-"}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {row.dest_city || "-"}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {formatWeight(row.gross_weight_kg)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {formatMoney(row.freight_estimated)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {formatMoney(row.surcharge_estimated)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono font-semibold text-slate-900">
                      {formatMoney(row.cost_estimated)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
