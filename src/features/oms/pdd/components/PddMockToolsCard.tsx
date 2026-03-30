import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  authorizePddStoreMock,
  clearPddOrdersMock,
  ingestPddOrdersMock,
} from "../api/mock";
import type { PddMockScenario } from "../types/mock";

const cardCls = "rounded-lg border border-slate-200 bg-white p-4";
const inputCls =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400";
const buttonCls =
  "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60";
const primaryButtonCls =
  "rounded-md border border-blue-600 bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60";

const PddMockToolsCard: React.FC = () => {
  const [storeIdText, setStoreIdText] = useState("918");
  const [scenario, setScenario] = useState<PddMockScenario>("mixed");
  const [countText, setCountText] = useState("6");
  const [busyAction, setBusyAction] = useState<"authorize" | "ingest" | "clear" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const storeId = useMemo(() => Number(storeIdText), [storeIdText]);
  const count = useMemo(() => Number(countText), [countText]);

  async function handleAuthorize() {
    if (!Number.isInteger(storeId) || storeId <= 0) {
      setError("store_id 必须是正整数。");
      setOk(null);
      return;
    }

    setBusyAction("authorize");
    setError(null);
    setOk(null);
    try {
      const data = await authorizePddStoreMock(storeId);
      setOk(
        `模拟授权成功：store_id=${data.store_id}，shop_id=${data.shop_id}，状态=${data.status}。`,
      );
    } catch (err) {
      console.error("authorize pdd mock failed", err);
      setError(err instanceof Error ? err.message : "模拟授权失败。");
    } finally {
      setBusyAction(null);
    }
  }

  async function handleIngest() {
    if (!Number.isInteger(storeId) || storeId <= 0) {
      setError("store_id 必须是正整数。");
      setOk(null);
      return;
    }
    if (!Number.isInteger(count) || count <= 0) {
      setError("count 必须是正整数。");
      setOk(null);
      return;
    }

    setBusyAction("ingest");
    setError(null);
    setOk(null);
    try {
      const data = await ingestPddOrdersMock({
        storeId,
        scenario,
        count,
      });
      const firstId = data.rows[0]?.pdd_order_id;
      setOk(
        `模拟入库成功：共 ${data.rows.length} 单，scenario=${data.scenario}${
          firstId ? `，首单ID=${firstId}` : ""
        }。`,
      );
    } catch (err) {
      console.error("ingest pdd mock failed", err);
      setError(err instanceof Error ? err.message : "模拟入库失败。");
    } finally {
      setBusyAction(null);
    }
  }

  async function handleClear() {
    if (!Number.isInteger(storeId) || storeId <= 0) {
      setError("store_id 必须是正整数。");
      setOk(null);
      return;
    }

    setBusyAction("clear");
    setError(null);
    setOk(null);
    try {
      const data = await clearPddOrdersMock({
        storeId,
        clearConnection: false,
        clearCredential: false,
      });
      setOk(
        `清理完成：删除订单 ${data.deleted_orders} 条，删除商品行 ${data.deleted_items} 条。`,
      );
    } catch (err) {
      console.error("clear pdd mock failed", err);
      setError(err instanceof Error ? err.message : "清理 mock 数据失败。");
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <section className={cardCls}>
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">模拟接入与拉单</h2>
          <p className="mt-1 text-sm text-slate-500">
            用最小 mock 跑通拼多多店铺授权、订单入库和台账联调。
          </p>
        </div>
        <Link
          to="/oms/pdd/orders"
          className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          去看订单台账
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <div className="mb-1 text-xs text-slate-500">store_id</div>
          <input
            className={inputCls}
            value={storeIdText}
            onChange={(e) => setStoreIdText(e.target.value)}
            placeholder="例如 918"
          />
        </div>

        <div>
          <div className="mb-1 text-xs text-slate-500">scenario</div>
          <select
            className={inputCls}
            value={scenario}
            onChange={(e) => setScenario(e.target.value as PddMockScenario)}
          >
            <option value="mixed">mixed</option>
            <option value="normal">normal</option>
            <option value="address_missing">address_missing</option>
            <option value="item_abnormal">item_abnormal</option>
          </select>
        </div>

        <div>
          <div className="mb-1 text-xs text-slate-500">count</div>
          <input
            className={inputCls}
            value={countText}
            onChange={(e) => setCountText(e.target.value)}
            placeholder="例如 6"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          className={buttonCls}
          disabled={busyAction !== null}
          onClick={() => void handleAuthorize()}
        >
          {busyAction === "authorize" ? "模拟授权中…" : "模拟授权"}
        </button>

        <button
          type="button"
          className={primaryButtonCls}
          disabled={busyAction !== null}
          onClick={() => void handleIngest()}
        >
          {busyAction === "ingest" ? "模拟入库中…" : "模拟拉单入库"}
        </button>

        <button
          type="button"
          className={buttonCls}
          disabled={busyAction !== null}
          onClick={() => void handleClear()}
        >
          {busyAction === "clear" ? "清理中…" : "清理 mock 数据"}
        </button>
      </div>

      {error ? (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {ok ? (
        <div className="mt-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          {ok}
        </div>
      ) : null}
    </section>
  );
};

export default PddMockToolsCard;
