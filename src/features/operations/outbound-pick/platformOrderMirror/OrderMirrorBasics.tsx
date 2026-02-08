// src/features/operations/outbound-pick/platformOrderMirror/OrderMirrorBasics.tsx
import React, { useMemo } from "react";
import type { OrderSummary } from "../../../orders/api";
import { getObj, getStr, isRecord } from "./jsonPick";
import type { PlatformOrderReplayOut } from "../orderExplain/types";

type ExplainLite =
  | { kind: "idle" }
  | { kind: "missing_key"; reason: string }
  | { kind: "loading" }
  | { kind: "ready"; data: PlatformOrderReplayOut }
  | { kind: "error"; message: string };

function fmtTs(ts: string | null): string {
  return ts && ts.trim() ? ts : "—";
}

function humanBlockedHint(blockedReasons: string[] | null | undefined): string {
  const rs = blockedReasons ?? [];
  if (!rs.length) return "—";
  if (rs.includes("PROVINCE_MISSING_OR_INVALID")) return "地址省份缺失/无效，无法履约路由（暂不可拣货）。";
  return rs.join(" / ");
}

export const OrderMirrorBasics: React.FC<{
  summary: OrderSummary | null;
  detailOrder: unknown;
  loading: boolean;
  onReload?: () => void;

  // ✅ 解析结果（replay）注入，用于把“可执行信息”体现在地址卡里
  explain: ExplainLite;
  onReloadExplain?: () => void;
}> = ({ summary, detailOrder, loading, onReload, explain, onReloadExplain }) => {
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

  const province = useMemo(() => {
    if (!shipping) return "";
    return (getStr(shipping, ["province", "state", "prov"]) ?? "").trim();
  }, [shipping]);

  const city = useMemo(() => {
    if (!shipping) return "";
    return (getStr(shipping, ["city"]) ?? "").trim();
  }, [shipping]);

  const district = useMemo(() => {
    if (!shipping) return "";
    return (getStr(shipping, ["district", "county", "area"]) ?? "").trim();
  }, [shipping]);

  const region = useMemo(() => {
    const parts = [province, city, district].filter((x) => x.trim());
    return parts.length ? parts.join(" ") : "—";
  }, [province, city, district]);

  const fullAddress = useMemo(() => {
    if (!shipping) return null;
    const addr =
      getStr(shipping, ["address", "detail", "detail_address", "detailAddress", "street"]) ?? null;
    return addr && addr.trim() ? addr.trim() : null;
  }, [shipping]);

  const headerLabel = useMemo(() => `${platform}/${shopId} · ${extOrderNo}`, [platform, shopId, extOrderNo]);

  // ---------- explain derived (only from backend fields) ----------
  const explainData = explain.kind === "ready" ? explain.data : null;
  const fulfillmentStatus = explainData?.fulfillment_status ?? null;
  const blockedReasons = explainData?.blocked_reasons ?? null;
  const isBlocked = (fulfillmentStatus ?? "") === "FULFILLMENT_BLOCKED";
  const blockedHint = humanBlockedHint(blockedReasons);

  const provinceMissingOrInvalid = isBlocked && (blockedReasons ?? []).includes("PROVINCE_MISSING_OR_INVALID");

  const explainBadge = useMemo(() => {
    if (explain.kind === "loading") return { text: "解析中…", cls: "bg-slate-50 text-slate-600 border-slate-200" };
    if (explain.kind === "error") return { text: "解析失败", cls: "bg-red-50 text-red-700 border-red-200" };
    if (explain.kind === "missing_key") return { text: "缺 store_id", cls: "bg-amber-50 text-amber-800 border-amber-200" };
    if (explain.kind === "ready") return { text: "已解析", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    return { text: "未解析", cls: "bg-slate-50 text-slate-600 border-slate-200" };
  }, [explain.kind]);

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

        <div className="shrink-0 flex items-center gap-2">
          <span className={"inline-flex items-center rounded-full border px-2 py-1 text-[11px] " + explainBadge.cls}>
            {explainBadge.text}
          </span>

          {onReloadExplain ? (
            <button
              type="button"
              className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              onClick={onReloadExplain}
              disabled={explain.kind === "loading"}
              title="重放/刷新解析结果"
            >
              {explain.kind === "loading" ? "解析中…" : "重放解析"}
            </button>
          ) : null}

          {onReload ? (
            <button
              type="button"
              className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              onClick={onReload}
              disabled={loading}
            >
              {loading ? "刷新中…" : "刷新"}
            </button>
          ) : null}
        </div>
      </div>

      {/* ✅ 履约阻塞的“人话提示”放在地址卡上方（用户能懂） */}
      {isBlocked ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
          <div className="font-semibold">暂不可拣货</div>
          <div className="mt-1">
            {blockedHint}
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 px-3 py-2">
          <div className="text-[11px] font-semibold text-slate-700">收件信息</div>
          <div className="mt-1 text-[12px] text-slate-900">
            {consigneeName} · {consigneePhone}
          </div>

          {/* region 行：如果是省份缺失导致 blocked，则红色强调 */}
          <div className={"mt-1 text-[11px] " + (provinceMissingOrInvalid ? "text-red-700 font-semibold" : "text-slate-600")}>
            {region}
            {provinceMissingOrInvalid ? (
              <span className="ml-2 rounded bg-red-100 px-2 py-0.5 text-[10px] text-red-700">
                省份缺失/无效
              </span>
            ) : null}
          </div>

          {fullAddress ? (
            <div className="mt-1 text-[11px] text-slate-500 line-clamp-2">{fullAddress}</div>
          ) : (
            <div className="mt-1 text-[11px] text-slate-400">—</div>
          )}

          {/* 额外：把“省份字段是否为空”也提示出来（不推导，只是展示 shipping.province） */}
          {provinceMissingOrInvalid ? (
            <div className="mt-2 text-[11px] text-red-700">
              当前 province：<span className="font-mono">{province ? province : "（空）"}</span>
            </div>
          ) : null}
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
