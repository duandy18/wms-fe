// src/features/operations/outbound-pick/OutboundPickPage.tsx

import React, { useState } from "react";
import { shipCommit } from "./api";
import type { ShipCommitPayload } from "./api";

type ShipResult =
  | {
      ok: boolean;
      data: unknown;
    }
  | null;

type ShipCommitErrorShape = {
  message?: string;
};

const OutboundPickPage: React.FC = () => {
  const [platform, setPlatform] = useState("PDD");
  const [shopId, setShopId] = useState("1");
  const [warehouseId, setWarehouseId] = useState<number>(1);
  const [itemId, setItemId] = useState<number>(3001);
  const [batchCode, setBatchCode] = useState("B-TEST-1"); // 目前后端 payload 暂未使用，预留
  const [qty, setQty] = useState<number>(1);
  const [ref, setRef] = useState<string>("TEST-ORDER-001");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ShipResult>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      if (!platform.trim()) throw new Error("platform 必填");
      if (!shopId.trim()) throw new Error("shop_id 必填");
      if (!ref.trim()) throw new Error("ref 必填");
      if (!warehouseId) throw new Error("warehouse_id 必填");
      if (!itemId) throw new Error("item_id 必填");
      if (!qty || qty <= 0) throw new Error("qty 必须大于 0");

      const payload: ShipCommitPayload = {
        platform: platform.toUpperCase(),
        shop_id: shopId.trim(),
        ref: ref.trim(),
        warehouse_id: warehouseId,
        lines: [
          {
            item_id: itemId,
            qty,
            // 若将来 ShipCommitPayload 支持 batch_code，可以在这里补上：
            // batch_code: batchCode,
          },
        ],
      };

      const resp = await shipCommit(payload);

      setResult({
        ok: true,
        data: resp,
      });
    } catch (err: unknown) {
      const e = err as ShipCommitErrorShape;
      console.error("shipCommit error", e);
      const msg = e.message ?? "出库提交失败";
      setError(msg);
      setResult({
        ok: false,
        data: e,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-900">
          拣货出库（Ship 调试页）
        </h1>
        <p className="text-sm text-slate-600">
          直接调用后端 shipCommit 接口，按 (platform, shop_id, ref, warehouse_id)
          + 商品明细提交一次出库，用于联调 & 验证账本扣减。
        </p>
      </header>

      <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 基本信息 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600">
                platform
              </label>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                placeholder="PDD / TMALL / JD 等"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600">
                shop_id
              </label>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                value={shopId}
                onChange={(e) => setShopId(e.target.value)}
                placeholder="1"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600">
                warehouse_id
              </label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                value={warehouseId}
                onChange={(e) =>
                  setWarehouseId(Number(e.target.value) || 0)
                }
                placeholder="1"
              />
            </div>
          </div>

          {/* 业务引用 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600">
                ref（出库引用 / 订单号）
              </label>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm font-mono"
                value={ref}
                onChange={(e) => setRef(e.target.value)}
                placeholder="如：ORD:PDD:1:EXT-ORDER-NO"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600">
                batch_code（预留）
              </label>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                value={batchCode}
                onChange={(e) => setBatchCode(e.target.value)}
                placeholder="目前仅作为备注，后端 payload 暂未使用"
              />
            </div>
          </div>

          {/* 商品行 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">
                出库明细（简单场景：单行商品）
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[2fr,1fr] gap-3">
              <div>
                <label className="block text-xs text-slate-500">
                  item_id
                </label>
                <input
                  type="number"
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                  value={itemId}
                  onChange={(e) =>
                    setItemId(Number(e.target.value) || 0)
                  }
                  placeholder="商品 ID，例如 3001"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500">
                  qty（本次出库数量）
                </label>
                <input
                  type="number"
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                  value={qty}
                  onChange={(e) =>
                    setQty(Number(e.target.value) || 0)
                  }
                  placeholder="1"
                  min={1}
                />
              </div>
            </div>
          </div>

          {/* 提交按钮 & 错误 */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {loading ? "提交中…" : "提交出库 (shipCommit)"}
            </button>

            {error && (
              <span className="text-xs text-red-600">错误：{error}</span>
            )}
          </div>
        </form>
      </section>

      {/* 返回结果 */}
      <section className="bg-white border border-slate-200 rounded-xl p-4 max-w-3xl">
        <h2 className="text-sm font-semibold text-slate-800 mb-2">
          调用结果
        </h2>
        {result ? (
          <div className="space-y-1">
            <div className="text-xs">
              状态：
              <span
                className={
                  result.ok ? "text-emerald-600" : "text-red-600"
                }
              >
                {result.ok ? "成功" : "失败"}
              </span>
            </div>
            <pre className="mt-1 text-xs bg-slate-50 rounded-md p-2 overflow-auto max-h-80">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </div>
        ) : (
          <p className="text-xs text-slate-500">
            暂无数据。填写表单并提交后，会在此显示 shipCommit 的原始响应。
          </p>
        )}
      </section>
    </div>
  );
};

export default OutboundPickPage;
