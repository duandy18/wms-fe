// src/features/operations/ship/ShippingLabelPrintPage.tsx
//
// 电子面单打印页（HTML 版，用于标签打印机）
// - 从 URL query 读取 tracking_no / order_ref / carrier / 收件人信息
// - 打开后自动调用 window.print()，仓库选择标签打印机即可打印一张标签

import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import JsBarcode from "jsbarcode";

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

const ShippingLabelPrintPage: React.FC = () => {
  const query = useQuery();

  const barcodeRef = useRef<SVGSVGElement | null>(null);

  const trackingNo = query.get("tracking_no") ?? "";
  const orderRef = query.get("order_ref") ?? "";
  const carrierCode = query.get("carrier_code") ?? "";
  const carrierName = query.get("carrier_name") ?? "";
  const receiverName = query.get("receiver_name") ?? "";
  const receiverPhone = query.get("receiver_phone") ?? "";
  const province = query.get("province") ?? "";
  const city = query.get("city") ?? "";
  const district = query.get("district") ?? "";
  const addressDetail = query.get("address_detail") ?? "";

  // 渲染条形码
  useEffect(() => {
    if (!trackingNo || !barcodeRef.current) return;
    try {
      JsBarcode(barcodeRef.current, trackingNo, {
        format: "CODE128",
        displayValue: false,
        margin: 0,
        height: 60,
        width: 2,
      });
    } catch (e) {
      console.error("JsBarcode render failed", e);
    }
  }, [trackingNo]);

  // 打开后自动弹出打印对话框
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex h-screen items-center justify-center bg-slate-200">
      <div
        className="border border-slate-400 bg-white text-slate-900"
        style={{
          width: "380px", // 接近 100mm（按 96dpi 粗略换算）
          padding: "8px",
        }}
      >
        {/* 顶部：快递公司 + 小号订单引用 */}
        <div className="mb-1 flex items-center justify-between border-b border-slate-300 pb-1">
          <div className="text-xs font-semibold">
            {carrierName || "快递公司"}
            {carrierCode ? ` (${carrierCode})` : ""}
          </div>
          <div className="max-w-[180px] truncate text-right text-[10px] text-slate-600">
            {orderRef || "-"}
          </div>
        </div>

        {/* 运单号（大号） */}
        <div className="mb-2">
          <div className="text-[10px] text-slate-500">运单号</div>
          <div className="font-mono text-xl font-bold tracking-widest">
            {trackingNo || "XXXXXXXXXXXX"}
          </div>
        </div>

        {/* 条形码（CODE128） */}
        {trackingNo && (
          <div className="mb-2 flex justify-center">
            <svg
              ref={barcodeRef}
              style={{ width: "100%", height: "64px" }}
            />
          </div>
        )}

        {/* 收件人信息 */}
        <div className="mt-2 border-t border-dashed border-slate-300 pt-1">
          <div className="mb-1 text-[10px] text-slate-500">收件人</div>
          <div className="text-xs font-semibold">
            {receiverName || "收件人"}
            {receiverPhone && (
              <span className="ml-2 font-mono">{receiverPhone}</span>
            )}
          </div>
          <div className="mt-1 text-[11px] leading-snug">
            {province} {city} {district} {addressDetail}
          </div>
        </div>

        {/* 底部备注 */}
        <div className="mt-2 border-t border-dashed border-slate-300 pt-1 text-[10px] text-slate-500">
          WMS-DU 测试标签 · 非正式面单
        </div>
      </div>

      <style>
        {`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          html, body, #root {
            height: auto;
          }
          body > div {
            background: transparent !important;
          }
        }
      `}
      </style>
    </div>
  );
};

export default ShippingLabelPrintPage;
