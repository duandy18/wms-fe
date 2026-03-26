// src/features/tms/shipment/pages/ShipmentPreparePage.tsx
//
// 分拆说明：
// - 本页是“发运准备”独立页面，不再和“发货作业”混在一个 cockpit 中。
// - 页面语义已收口为：
//   1) 汇集展示待进入发货作业的订单清单
//   2) 从列表进入单订单发货作业页
//   3) 第一张卡收口为“同步 OMS 订单快照”入口
// - 维护约束：
//   - TMS 不负责地址解析
//   - TMS 不负责地址人工核验
//   - TMS 不负责地址修改
//   - 地址问题统一返回 OMS 处理
//   - 本页定位为订单汇总与导流，不承担复杂操作
// - 当前限制：
//   - 后端尚未提供 /ship/prepare/orders/sync
//   - 因此前端本页“同步 OMS 订单快照”按钮当前以刷新发运准备池列表作为占位行为

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "../../../../components/ui/PageTitle";
import {
  fetchShipmentPrepareOrders,
  type ShipPrepareOrderListItem,
} from "../api/shipmentPrepareApi";

const cardClass =
  "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm";
const h2Class = "text-base font-semibold text-slate-900";
const helperClass = "mt-1 text-sm text-slate-500";
const selectClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500";
const btnPrimaryClass =
  "rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60";
const btnSecondaryClass =
  "rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60";
const thClass =
  "whitespace-nowrap border-b border-slate-200 px-3 py-2 text-left text-xs font-medium text-slate-600";
const tdClass =
  "whitespace-nowrap border-b border-slate-100 px-3 py-3 text-sm text-slate-700";

type FilterState = {
  platform: string;
  shop_id: string;
};

const EMPTY_FILTERS: FilterState = {
  platform: "",
  shop_id: "",
};

function formatAddressSummary(row: ShipPrepareOrderListItem): string {
  return [
    row.province || "",
    row.city || "",
    row.district || "",
    row.detail || "",
  ]
    .map((x) => x.trim())
    .filter(Boolean)
    .join(" ");
}

const ShipmentPreparePage: React.FC = () => {
  const navigate = useNavigate();

  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [rows, setRows] = useState<ShipPrepareOrderListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const platformOptions = useMemo(() => {
    return Array.from(
      new Set(
        rows
          .map((row) => (row.platform || "").trim())
          .filter((value) => value.length > 0),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const shopOptions = useMemo(() => {
    const filteredRows = filters.platform
      ? rows.filter((row) => row.platform === filters.platform)
      : rows;

    return Array.from(
      new Set(
        filteredRows
          .map((row) => (row.shop_id || "").trim())
          .filter((value) => value.length > 0),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [rows, filters.platform]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (filters.platform && row.platform !== filters.platform) {
        return false;
      }
      if (filters.shop_id && row.shop_id !== filters.shop_id) {
        return false;
      }
      return true;
    });
  }, [rows, filters]);

  async function loadList() {
    setLoading(true);
    setError("");
    try {
      const res = await fetchShipmentPrepareOrders(50);
      setRows(Array.isArray(res.items) ? res.items : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载发运准备列表失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadList();
  }, []);

  async function handleSyncSnapshot() {
    if (syncing) return;
    setSyncing(true);
    setError("");
    setMessage("");
    try {
      await loadList();
      setMessage("已刷新发运准备池快照。当前后端尚未接入专用 OMS 同步接口。");
    } catch (err) {
      setError(err instanceof Error ? err.message : "刷新发运准备池快照失败");
    } finally {
      setSyncing(false);
    }
  }

  function handleGoDispatch(row: ShipPrepareOrderListItem) {
    const addressSummary = row.address_summary || formatAddressSummary(row) || "-";

    navigate("/tms/dispatch", {
      state: {
        order_id: row.order_id,
        platform: row.platform,
        shop_id: row.shop_id,
        ext_order_no: row.ext_order_no,
        receiver_name: row.receiver_name || "",
        receiver_phone: row.receiver_phone || "",
        province: row.province || "",
        city: row.city || "",
        district: row.district || "",
        detail: row.detail || "",
        address_summary: addressSummary,
      },
    });
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      <PageTitle
        title="发运准备"
        description="汇集待进入发货作业的订单，并从列表进入单订单处理页面"
      />

      <section className={cardClass}>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className={h2Class}>同步 OMS 订单快照</h2>
            <div className={helperClass}>
              订单与地址以 OMS 为准，TMS 只保存发运准备所需快照。当前页面先以刷新发运准备池列表作为同步结果展示。
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={btnPrimaryClass}
              onClick={() => void handleSyncSnapshot()}
              disabled={syncing}
            >
              {syncing ? "同步中..." : "同步 OMS 订单快照"}
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">
          本页只做订单汇总与导流；地址处理、拆包、算价、快递公司选择、运单号申请等动作统一在发货作业页完成。
        </div>

        {message ? (
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-700">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}
      </section>

      <section className={cardClass}>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className={h2Class}>订单列表</h2>
            <div className={helperClass}>
              这里仅汇集展示订单基础信息，供进入单订单发货作业页继续处理。
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={btnSecondaryClass}
              onClick={() => {
                setFilters(EMPTY_FILTERS);
              }}
              disabled={loading}
            >
              重置检索
            </button>
            <button
              type="button"
              className={btnSecondaryClass}
              onClick={() => void loadList()}
              disabled={loading}
            >
              {loading ? "刷新中..." : "刷新列表"}
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <div className="mb-1 text-xs font-medium text-slate-600">平台</div>
            <select
              className={selectClass}
              value={filters.platform}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  platform: e.target.value,
                  shop_id: "",
                }))
              }
            >
              <option value="">全部平台</option>
              {platformOptions.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-1 text-xs font-medium text-slate-600">店铺</div>
            <select
              className={selectClass}
              value={filters.shop_id}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  shop_id: e.target.value,
                }))
              }
            >
              <option value="">全部店铺</option>
              {shopOptions.map((shopId) => (
                <option key={shopId} value={shopId}>
                  {shopId}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 overflow-auto rounded-xl border border-slate-100">
          <table className="min-w-full border-collapse">
            <thead className="bg-slate-50">
              <tr>
                <th className={thClass}>平台</th>
                <th className={thClass}>店铺</th>
                <th className={thClass}>订单号</th>
                <th className={thClass}>收件人</th>
                <th className={thClass}>地址摘要</th>
                <th className={thClass}>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => {
                const addressSummary =
                  row.address_summary || formatAddressSummary(row) || "-";

                return (
                  <tr key={row.order_id}>
                    <td className={tdClass}>{row.platform}</td>
                    <td className={tdClass}>{row.shop_id}</td>
                    <td className={`${tdClass} font-mono`}>{row.ext_order_no}</td>
                    <td className={tdClass}>{row.receiver_name || "-"}</td>
                    <td className={tdClass}>{addressSummary}</td>
                    <td className={tdClass}>
                      <button
                        type="button"
                        className={btnPrimaryClass}
                        onClick={() => handleGoDispatch(row)}
                      >
                        进入发货作业
                      </button>
                    </td>
                  </tr>
                );
              })}

              {!loading && filteredRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-8 text-center text-sm text-slate-500"
                  >
                    暂无符合条件的发运准备订单。
                  </td>
                </tr>
              ) : null}

              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-8 text-center text-sm text-slate-500"
                  >
                    正在加载发运准备列表...
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 px-3 py-3 text-sm text-sky-900">
          发运准备页只负责订单汇总与导流；单订单的包裹方案、算价、快递公司选择、运单号申请等处理统一在发货作业页完成。
        </div>
      </section>
    </div>
  );
};

export default ShipmentPreparePage;
