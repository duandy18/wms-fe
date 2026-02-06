// src/features/operations/outbound-pick/platformOrderMirror/OrderMirrorBasics.tsx
import React, { useMemo } from "react";
import type { OrderSummary } from "../../../orders/api";
import { getObj, getStr, isRecord } from "./jsonPick";

function fmtTs(ts: string | null): string {
  return ts && ts.trim() ? ts : "—";
}

export const OrderMirrorBasics: React.FC<{
  summary: OrderSummary | null;
  detailOrder: unknown;
  loading: boolean;
  onReload?: () => void;
}> = ({ summary, detailOrder, loading, onReload }) => {
  const detailRec = isRecord(detailOrder) ? detailOrder : null;

  const platform = useMemo(() => {
    if (summary?.platform) return String(summary.platform);
    if (detailRec) return getStr(detailRec, ["platform"]) ?? "—";
    return "—";
  }, [summary?.platform, detailRec]);

  const shopId = useMemo(() => {
    if (summary?.shop_id != null) return String(summary.shop_id);
    if (detailRec) return getStr(detailRec, ["shop_id", "shopId"]) ?? "—";
    return "—";
  }, [summary?.shop_id, detailRec]);

  const extOrderNo = useMemo(() => {
    if (summary?.ext_order_no) return String(summary.ext_order_no);
    if (detailRec)
      return getStr(detailRec, ["ext_order_no", "extOrderNo", "order_no", "orderNo"]) ?? "—";
    return "—";
  }, [summary?.ext_order_no, detailRec]);

  const status = useMemo(() => {
    if (summary?.status) return String(summary.status);
    if (detailRec) return getStr(detailRec, ["status", "order_status", "orderStatus"]) ?? "—";
    return "—";
  }, [summary?.status, detailRec]);

  const createdAt = useMemo(() => {
    if (summary?.created_at) return String(summary.created_at);
    if (detailRec)
      return getStr(detailRec, ["created_at", "createdAt", "created_time", "createdTime"]) ?? null;
    return null;
  }, [summary?.created_at, detailRec]);

  const buyerRemark = useMemo(() => {
    if (!detailRec) return null;
    return (
      getStr(detailRec, ["buyer_remark", "buyerRemark", "buyer_message", "buyerMessage", "message"]) ??
      null
    );
  }, [detailRec]);

  const sellerRemark = useMemo(() => {
    if (!detailRec) return null;
    return (
      getStr(detailRec, ["seller_remark", "sellerRemark", "seller_note", "sellerNote", "note"]) ??
      null
    );
  }, [detailRec]);

  const shipping = useMemo(() => {
    if (!detailRec) return null;
    return (
      getObj(detailRec, ["shipping_address", "shippingAddress", "address", "receiver", "consignee"]) ??
      null
    );
  }, [detailRec]);

  const consigneeName = useMemo(() => {
    if (!shipping) return "—";
    return (
      getStr(shipping, ["name", "receiver_name", "receiverName", "consignee", "consignee_name"]) ??
      "—"
    );
  }, [shipping]);

  const consigneePhone = useMemo(() => {
    if (!shipping) return "—";
    return getStr(shipping, ["phone", "mobile", "tel", "receiver_phone", "receiverPhone"]) ?? "—";
  }, [shipping]);

  const region = useMemo(() => {
    if (!shipping) return "—";
    const province = getStr(shipping, ["province", "state", "prov"]) ?? "";
    const city = getStr(shipping, ["city"]) ?? "";
    const district = getStr(shipping, ["district", "county", "area"]) ?? "";
    const parts = [province, city, district].filter((x) => x.trim());
    return parts.length ? parts.join(" ") : "—";
  }, [shipping]);

  const fullAddress = useMemo(() => {
    if (!shipping) return null;
    const addr =
      getStr(shipping, ["address", "detail", "detail_address", "detailAddress", "street"]) ?? null;
    return addr && addr.trim() ? addr.trim() : null;
  }, [shipping]);

  const headerLabel = useMemo(() => `${platform}/${shopId} · ${extOrderNo}`, [platform, shopId, extOrderNo]);

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] text-slate-500">平台订单（镜像）</div>
          <div className="mt-1 font-mono text-[12px] text-slate-900 truncate">{headerLabel}</div>
          <div className="mt-1 text-[11px] text-slate-500">
            状态：<span className="font-mono text-slate-700">{status}</span> · 下单：
            <span className="ml-1 font-mono text-slate-700">{fmtTs(createdAt)}</span>
          </div>
        </div>

        {onReload ? (
          <button
            type="button"
            className="shrink-0 inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            onClick={onReload}
            disabled={loading}
          >
            {loading ? "刷新中…" : "刷新"}
          </button>
        ) : null}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 px-3 py-2">
          <div className="text-[11px] font-semibold text-slate-700">收件信息</div>
          <div className="mt-1 text-[12px] text-slate-900">
            {consigneeName} · {consigneePhone}
          </div>
          <div className="mt-1 text-[11px] text-slate-600">{region}</div>
          {fullAddress ? (
            <div className="mt-1 text-[11px] text-slate-500 line-clamp-2">{fullAddress}</div>
          ) : (
            <div className="mt-1 text-[11px] text-slate-400">—</div>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 px-3 py-2">
          <div className="text-[11px] font-semibold text-slate-700">备注</div>
          <div className="mt-1 text-[11px] text-slate-600">
            买家留言：<span className="text-slate-900">{buyerRemark ?? "—"}</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-600">
            卖家备注：<span className="text-slate-900">{sellerRemark ?? "—"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
