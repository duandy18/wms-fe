// src/features/operations/ship/ShipCockpitPage.tsx
//
// 发货 Ship Cockpit
// - 左：订单选择/加载 + 重量输入 + 电子称面板
// - 中：订单明细占位 + 总重量展示
// - 右：物流公司费用矩阵 + 发货（模式 2：出单号 + 写账本 + 打印标签）
//
import React, { useMemo, useState } from "react";
import PageTitle from "../../../components/ui/PageTitle";
import {
  calcShipQuotes,
  prepareShipFromOrder,
  shipWithWaybill,
  type ShipQuote,
  type ShipWithWaybillResponse,
  type ShipPrepareRequest,
} from "./api";
import HidScalePanel from "./HidScalePanel";

const DEFAULT_PROVINCE = "广东省";
const DEFAULT_CITY = "深圳市";
const DEFAULT_DISTRICT = "南山区";

type ApiErrorShape = {
  message?: string;
};

function parseOrderRef(ref: string): {
  platform: string;
  shopId: string;
  extOrderNo: string;
} {
  const parts = ref.split(":");
  if (parts.length >= 4 && parts[0] === "ORD") {
    return {
      platform: parts[1] || "PDD",
      shopId: parts[2] || "1",
      extOrderNo: parts.slice(3).join(":"), // 防止 ext 里还有 :
    };
  }
  return { platform: "PDD", shopId: "1", extOrderNo: ref };
}

const ShipCockpitPage: React.FC = () => {
  const [orderRef, setOrderRef] = useState("");
  const [weightKg, setWeightKg] = useState("2.36"); // 毛重
  const [packagingWeightKg, setPackagingWeightKg] = useState("0.10");

  const [province, setProvince] = useState(DEFAULT_PROVINCE);
  const [city, setCity] = useState(DEFAULT_CITY);
  const [district, setDistrict] = useState(DEFAULT_DISTRICT);

  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [addressDetail, setAddressDetail] = useState("");

  const [orderTraceId, setOrderTraceId] = useState<string | null>(null);

  const [loadingPrepare, setLoadingPrepare] = useState(false);
  const [loadingCalc, setLoadingCalc] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [quotes, setQuotes] = useState<ShipQuote[]>([]);
  const [recommended, setRecommended] = useState<string | null>(null);
  const [selectedCarrier, setSelectedCarrier] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [lastShipResult, setLastShipResult] =
    useState<ShipWithWaybillResponse | null>(null);
  const [loadingResultCard, setLoadingResultCard] = useState(false);

  const numericWeight = Number(weightKg) || 0;
  // 目前包材重量仅参与 UI 展示，不参与计算；保留输入框，后续可扩展
  const _numericPackagingWeight = Number(packagingWeightKg) || 0;
  void _numericPackagingWeight; // 避免未使用告警

  const selectedQuote = useMemo(
    () => quotes.find((q) => q.carrier === selectedCarrier) ?? null,
    [quotes, selectedCarrier],
  );

  // 电子称锁定回调：把锁定重量写回上方毛重输入框
  const handleScaleWeightLocked = (w: number) => {
    if (!Number.isFinite(w)) return;
    setWeightKg(w.toFixed(3));
  };

  const handlePrepareOrder = async () => {
    if (!orderRef.trim()) {
      setError("请先填写订单号 / 业务引用");
      return;
    }
    setError(null);
    const { platform, shopId, extOrderNo } = parseOrderRef(orderRef.trim());

    setLoadingPrepare(true);
    try {
      const payload: ShipPrepareRequest = {
        platform,
        shop_id: shopId,
        ext_order_no: extOrderNo,
      };
      const res = await prepareShipFromOrder(payload);

      if (res.province) setProvince(res.province);
      if (res.city) setCity(res.city);
      if (res.district) setDistrict(res.district);
      if (res.weight_kg && res.weight_kg > 0) {
        // 这里可以认为是“净重估算”，先直接覆盖毛重，未来可以拆成净重+包材
        setWeightKg(String(res.weight_kg));
      }
      setOrderTraceId(res.trace_id ?? null);

      if (res.receiver_name) setReceiverName(res.receiver_name);
      if (res.receiver_phone) setReceiverPhone(res.receiver_phone);
      if (res.address_detail) setAddressDetail(res.address_detail);
    } catch (e: unknown) {
      const err = e as ApiErrorShape;
      console.error("prepareShipFromOrder failed", err);
      setError(err?.message ?? "加载订单信息失败");
    } finally {
      setLoadingPrepare(false);
    }
  };

  const handleCalc = async () => {
    if (!numericWeight || numericWeight <= 0) {
      setError("请先填写正确的包裹总重量（kg）");
      return;
    }
    setError(null);
    setLoadingCalc(true);
    try {
      const res = await calcShipQuotes({
        weight_kg: numericWeight,
        province,
        city,
        district,
        debug_ref: orderRef || undefined,
      });
      setQuotes(res.quotes);
      setRecommended(res.recommended ?? null);
      setSelectedCarrier(res.recommended ?? (res.quotes[0]?.carrier ?? null));
    } catch (e: unknown) {
      const err = e as ApiErrorShape;
      console.error("calcShipQuotes failed", err);
      setError(err?.message ?? "计算运费失败");
      setQuotes([]);
      setRecommended(null);
      setSelectedCarrier(null);
    } finally {
      setLoadingCalc(false);
    }
  };

  const handleConfirmShip = async () => {
    if (!orderRef.trim()) {
      setError("请先填写订单号 / 业务引用");
      return;
    }
    if (!selectedCarrier) {
      setError("请先选择一个物流公司");
      return;
    }
    if (!numericWeight || numericWeight <= 0) {
      setError("请先填写正确的包裹总重量（kg）");
      return;
    }

    const { platform, shopId, extOrderNo } = parseOrderRef(orderRef.trim());

    setError(null);
    setConfirming(true);
    setLoadingResultCard(true);
    try {
      const res = await shipWithWaybill({
        platform,
        shop_id: shopId,
        ext_order_no: extOrderNo,
        warehouse_id: 1, // TODO: 将来可以从 UI 选择具体仓库
        carrier_code: selectedCarrier,
        carrier_name: selectedQuote?.name,
        weight_kg: numericWeight,
        receiver_name: receiverName || "",
        receiver_phone: receiverPhone || "",
        province,
        city,
        district,
        address_detail: addressDetail || "",
      });

      setLastShipResult(res);

      // 提示：单号
      alert(
        `已记录发货并生成运单号：${res.tracking_no}\n快递公司：${
          res.carrier_name || res.carrier_code
        }`,
      );

      // 打开标签打印页，新标签页中自动弹出打印对话框
      const params = new URLSearchParams({
        tracking_no: res.tracking_no,
        order_ref: res.ref,
        carrier_code: res.carrier_code,
        carrier_name: res.carrier_name ?? "",
        province,
        city,
        district,
        receiver_name: receiverName || "",
        receiver_phone: receiverPhone || "",
        address_detail: addressDetail || "",
      });
      window.open(`/print/shipping-label?${params.toString()}`, "_blank");
    } catch (e: unknown) {
      const err = e as ApiErrorShape;
      console.error("shipWithWaybill failed", err);
      setError(err?.message ?? "发货失败");
    } finally {
      setConfirming(false);
      setLoadingResultCard(false);
    }
  };

  return (
    <div className="space-y-4 p-6">
      <PageTitle
        title="发货 Ship Cockpit"
        description="基于订单明细与物流费率，选择最合适的快递公司并记录发货事件（模式 2：平台出单 + WMS 记账 + 标签打印）。"
      />

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* 三列布局：左 320，中自适应，右 360 */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[320px_minmax(0,1fr)_360px]">
        {/* 左：订单选择 / 扫描 + 电子称 */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-slate-800">
            订单选择 / 扫描
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex flex-col">
              <label className="text-xs text-slate-500">
                订单号 / 平台单号
              </label>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="扫码或输入订单号，例如 ORD:PDD:1:EXT123"
                value={orderRef}
                onChange={(e) => setOrderRef(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex flex-col">
                <label className="text-xs text-slate-500">包裹毛重(kg)</label>
                <input
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-slate-500">包材重量(kg)</label>
                <input
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                  value={packagingWeightKg}
                  onChange={(e) => setPackagingWeightKg(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex flex-col">
                <label className="text-xs text-slate-500">省份</label>
                <input
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-slate-500">城市 / 区县</label>
                <div className="mt-1 flex gap-2">
                  <input
                    className="w-1/2 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                  <input
                    className="w-1/2 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* 收件人信息（只显示，不强制编辑） */}
            <div className="space-y-1 rounded-xl border border-slate-100 bg-slate-50 p-2">
              <div className="text-[11px] font-semibold text-slate-600">
                收件人信息
              </div>
              <div className="text-[11px] text-slate-600">
                姓名：<span className="font-mono">{receiverName || "-"}</span>
              </div>
              <div className="text-[11px] text-slate-600">
                电话：
                <span className="font-mono">{receiverPhone || "-"}</span>
              </div>
              <div className="text-[11px] text-slate-600">
                地址：
                <span className="font-mono">
                  {province} {city} {district} {addressDetail}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handlePrepareOrder}
                disabled={loadingPrepare || !orderRef.trim()}
                className={
                  "inline-flex w-full items-center justify-center rounded-md px-3 py-1.5 text-xs font-medium text-white shadow-sm " +
                  (loadingPrepare || !orderRef.trim()
                    ? "bg-slate-400 opacity-70"
                    : "bg-slate-700 hover:bg-slate-800")
                }
              >
                {loadingPrepare ? "加载中…" : "加载订单地址 / 行项目"}
              </button>

              <button
                type="button"
                onClick={handleCalc}
                disabled={loadingCalc || numericWeight <= 0}
                className={
                  "inline-flex w-full items-center justify-center rounded-md px-3 py-1.5 text-xs font-medium text-white shadow-sm " +
                  (loadingCalc || numericWeight <= 0
                    ? "bg-sky-400 opacity-70"
                    : "bg-sky-600 hover:bg-sky-700")
                }
              >
                {loadingCalc ? "计算中…" : "计算运费矩阵"}
              </button>
            </div>

            <p className="text-[11px] leading-relaxed text-slate-500">
              · 支持扫码枪直接扫平台订单号（例如 ORD:PDD:1:EXT123）。<br />
              · “加载订单地址 / 行项目” 会从订单地址表自动带出省市区和收件人信息；
              当前总重量来自预估/手工填写，下面可以接入电子秤自动填充。
            </p>

            {/* 电子称面板：锁定后会把重量写回上方毛重输入框 */}
            <HidScalePanel onWeightLocked={handleScaleWeightLocked} />
          </div>
        </section>

        {/* 中：订单明细（占位） */}
        <section className="rounded-2xl border border-slate-200 bg白 p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">
              订单明细（占位）
            </h2>
            <div className="text-xs text-slate-500">
              目的地：
              <span className="font-mono">
                {province} {city} {district}
              </span>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
                    商品
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500">
                    数量
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500">
                    单件重量(kg)
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500">
                    小计重量(kg)
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* 暂时用静态示例，后续可挂真实订单行 */}
                <tr className="border-t border-slate-100">
                  <td className="px-3 py-2">猫粮 2kg 装（示意）</td>
                  <td className="px-3 py-2 text-right font-mono">1</td>
                  <td className="px-3 py-2 text-right font-mono">2.00</td>
                  <td className="px-3 py-2 text-right font-mono">2.00</td>
                </tr>
                <tr className="border-t border-slate-100">
                  <td className="px-3 py-2">猫罐头 100g（示意）</td>
                  <td className="px-3 py-2 text-right font-mono">3</td>
                  <td className="px-3 py-2 text-right font-mono">0.12</td>
                  <td className="px-3 py-2 text-right font-mono">0.36</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-200 bg-slate-50">
                  <td className="px-3 py-2 text-xs font-semibold text-slate-600">
                    合计
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-xs font-semibold">
                    4
                  </td>
                  <td />
                  <td className="px-3 py-2 text-right font-mono text-xs font-semibold">
                    {numericWeight.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <p className="mt-3 text-[11px] text-slate-500">
            当前总重量来自上方输入框或电子称锁定结果。后续可以接入订单实际行项目，自动计算净重并对比秤重。
          </p>
        </section>

        {/* 右：物流公司费用矩阵 + 发货结果卡片 */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-800">
              物流公司费用对比
            </h2>
            <span className="text-xs text-slate-400">人民币(元)</span>
          </div>

          {quotes.length === 0 ? (
            <p className="text-xs text-slate-500">
              还没有费用结果。请先填写重量与目的地，并点击“计算运费矩阵”。
            </p>
          ) : (
            <div className="space-y-2 text-sm">
              {quotes.map((q) => {
                const isSelected = selectedCarrier === q.carrier;
                const isRecommended = recommended === q.carrier;
                const active = isSelected || isRecommended;
                return (
                  <button
                    key={q.carrier}
                    type="button"
                    onClick={() => setSelectedCarrier(q.carrier)}
                    className={
                      "flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left transition " +
                      (active
                        ? "border-sky-500 bg-sky-50"
                        : "border-slate-200 hover:border-sky-300 hover:bg-slate-50")
                    }
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-800">
                        {q.name}
                        <span className="ml-1 text-[11px] text-slate-500">
                          ({q.carrier})
                        </span>
                      </span>
                      {q.eta && (
                        <span className="text-[11px] text-slate-500">
                          预计时效：{q.eta}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-mono text-sm">
                        ￥{q.est_cost.toFixed(2)}
                      </span>
                      {isRecommended && (
                        <span className="mt-0.5 rounded-full bg-emerald-100 px-2 py-[1px] text-[11px] text-emerald-700">
                          推荐
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-4 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={handleConfirmShip}
              disabled={!orderRef.trim() || !selectedCarrier || confirming}
              className={
                "inline-flex w-full items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium text白 " +
                (!orderRef.trim() || !selectedCarrier || confirming
                  ? "bg-emerald-400 opacity-70"
                  : "bg-emerald-600 hover:bg-emerald-700")
              }
            >
              {confirming ? "提交中…" : "确认发货（出单 + 记录账本）"}
            </button>
            <p className="mt-2 text-[11px] text-slate-500">
              当前版本会调用平台出单（Fake）、写发货审计事件（OUTBOUND / SHIP_COMMIT）
              并写入发货账本 shipping_records。库存扣减仍由拣货 / 出库链路负责。
            </p>
          </div>

          {/* 发货结果卡片 */}
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">
                发货结果
              </span>
              {loadingResultCard && (
                <span className="text-[10px] text-slate-400">刷新中…</span>
              )}
            </div>
            {!lastShipResult ? (
              <p className="text-[11px] text-slate-500">
                确认发货后，这里会展示本次发货的运单号、承运商、状态等信息，并提供复制与跳转入口。
              </p>
            ) : (
              <div className="space-y-1 text-[11px] text-slate-600">
                <div>
                  <span className="font-semibold">运单号：</span>
                  <span className="font-mono">
                    {lastShipResult.tracking_no}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">快递公司：</span>
                  <span className="font-mono">
                    {lastShipResult.carrier_name || "-"}(
                    {lastShipResult.carrier_code})
                  </span>
                </div>
                <div>
                  <span className="font-semibold">状态：</span>
                  <span className="font-mono">
                    {lastShipResult.status || "IN_TRANSIT"}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md border border-slate-300 px-2 py-[3px] text-[11px] font-medium text-slate-700 hover:bg-slate-100"
                    onClick={() => {
                      if (!lastShipResult.tracking_no) return;
                      if (navigator.clipboard?.writeText) {
                        void navigator.clipboard
                          .writeText(lastShipResult.tracking_no)
                          .catch(() => {
                            alert(
                              `请手动复制：${lastShipResult.tracking_no}`,
                            );
                          });
                      } else {
                        alert(`请手动复制：${lastShipResult.tracking_no}`);
                      }
                    }}
                  >
                    复制运单号
                  </button>

                  <button
                    type="button"
                    className="inline-flex items-center rounded-md border border-slate-300 px-2 py-[3px] text-[11px] font-medium text-slate-700 hover:bg-slate-100"
                    onClick={() => {
                      if (!lastShipResult.ref) return;
                      const url = `/inventory/shipping-records/detail?ref=${encodeURIComponent(
                        lastShipResult.ref,
                      )}`;
                      window.open(url, "_blank");
                    }}
                  >
                    查看发货账本
                  </button>

                  <button
                    type="button"
                    className="inline-flex items-center rounded-md border border-slate-300 px-2 py-[3px] text-[11px] font-medium text-slate-700 hover:bg-slate-100"
                    onClick={() => {
                      const trace = orderTraceId;
                      if (!trace) return;
                      const url = `/diagnostics/trace-studio?trace_id=${encodeURIComponent(
                        trace,
                      )}`;
                      window.open(url, "_blank");
                    }}
                  >
                    打开 Trace Studio
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ShipCockpitPage;
