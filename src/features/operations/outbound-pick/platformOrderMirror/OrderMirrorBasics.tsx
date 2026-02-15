// src/features/operations/outbound-pick/platformOrderMirror/OrderMirrorBasics.tsx
import React, { useMemo, useState } from "react";
import type { OrderSummary, OrderView } from "../../../orders/api";
import type { PlatformOrderReplayOut } from "../orderExplain/types";

type ExplainLite =
  | { kind: "idle" }
  | { kind: "missing_key"; reason: string }
  | { kind: "loading" }
  | { kind: "ready"; data: PlatformOrderReplayOut }
  | { kind: "error"; message: string };

function fmtTs(ts: string | null | undefined): string {
  const s = ts == null ? "" : String(ts);
  return s.trim() ? s : "—";
}

function fmtMoney(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return "—";
  // 不强行货币格式化（避免 locale 变化），保持简单可读
  return String(v);
}

function safeText(v: string | null | undefined): string {
  const s = v == null ? "" : String(v);
  return s.trim() ? s.trim() : "—";
}

function joinRegion(parts: Array<string | null | undefined>): string {
  const xs = parts
    .map((x) => (x == null ? "" : String(x)).trim())
    .filter((x) => x);
  return xs.length ? xs.join(" ") : "—";
}

function buildHumanAddress(addr: OrderView["order"]["address"] | null | undefined): string {
  if (!addr) return "—";
  const region = joinRegion([addr.province, addr.city, addr.district]);
  const detail = (addr.detail ?? "").trim();
  if (region === "—" && !detail) return "—";
  if (region === "—") return detail || "—";
  if (!detail) return region;
  return `${region} ${detail}`;
}

function buildCopySummaryText(args: {
  order: OrderView["order"] | null;
  summary: OrderSummary | null;
}): string {
  const o = args.order;
  const s = args.summary;

  const platform = safeText(o?.platform ?? s?.platform);
  const shopId = safeText(o?.shop_id ?? s?.shop_id);
  const ext = safeText(o?.ext_order_no ?? s?.ext_order_no);

  const status = safeText(o?.status ?? s?.status);
  const createdAt = fmtTs((o?.created_at as unknown as string | undefined) ?? s?.created_at);

  const receiver = safeText(o?.address?.receiver_name);
  const phone = safeText(o?.address?.receiver_phone);
  const addr = buildHumanAddress(o?.address ?? null);

  const orderAmount = fmtMoney(o?.order_amount);
  const payAmount = fmtMoney(o?.pay_amount);

  const lines = (o?.items ?? []).map((it) => {
    const title = safeText(it.title ?? "—");
    const spec = (it.spec ?? "").trim();
    const qty = typeof it.qty === "number" ? it.qty : 0;
    return spec ? `- ${title}（${spec}）×${qty}` : `- ${title} ×${qty}`;
  });

  const head = [
    `订单：${platform}/${shopId} · ${ext}`,
    `状态：${status} · 下单：${createdAt}`,
    `收件：${receiver} · ${phone}`,
    `地址：${addr}`,
    `金额：order_amount=${orderAmount} · pay_amount=${payAmount}`,
  ].join("\n");

  const body = lines.length ? `\n商品：\n${lines.join("\n")}\n` : "\n商品：—\n";
  return head + body;
}

export const OrderMirrorBasics: React.FC<{
  summary: OrderSummary | null;
  detailOrder: OrderView["order"] | null;
  loading: boolean;
  onReload?: () => void;

  // ✅ 解析结果（replay）注入：降级为“可选展开”
  explain: ExplainLite;
  onReloadExplain?: () => void;
}> = ({ summary, detailOrder, loading, onReload, explain, onReloadExplain }) => {
  const [copyBusy, setCopyBusy] = useState(false);

  const platform = safeText(detailOrder?.platform ?? summary?.platform ?? "—");
  const shopId = safeText(detailOrder?.shop_id ?? summary?.shop_id ?? "—");
  const extOrderNo = safeText(detailOrder?.ext_order_no ?? summary?.ext_order_no ?? "—");
  const status = safeText(detailOrder?.status ?? summary?.status ?? "—");

  const createdAt = fmtTs((detailOrder?.created_at as unknown as string | undefined) ?? summary?.created_at);
  const orderAmount = fmtMoney(detailOrder?.order_amount);
  const payAmount = fmtMoney(detailOrder?.pay_amount);

  const receiverName = safeText(detailOrder?.address?.receiver_name);
  const receiverPhone = safeText(detailOrder?.address?.receiver_phone);
  const region = joinRegion([
    detailOrder?.address?.province ?? null,
    detailOrder?.address?.city ?? null,
    detailOrder?.address?.district ?? null,
  ]);
  const detailAddr = safeText(detailOrder?.address?.detail ?? null);
  const zipcode = safeText(detailOrder?.address?.zipcode ?? null);

  const buyerName = safeText(detailOrder?.buyer_name ?? null);
  const buyerPhone = safeText(detailOrder?.buyer_phone ?? null);

  const headerLabel = useMemo(
    () => `${platform}/${shopId} · ${extOrderNo}`,
    [platform, shopId, extOrderNo],
  );

  const explainBadge = useMemo(() => {
    if (explain.kind === "loading") return { text: "解析中…", cls: "bg-slate-50 text-slate-600 border-slate-200" };
    if (explain.kind === "error") return { text: "解析失败", cls: "bg-red-50 text-red-700 border-red-200" };
    if (explain.kind === "missing_key") return { text: "缺 store_id", cls: "bg-amber-50 text-amber-800 border-amber-200" };
    if (explain.kind === "ready") return { text: "已解析", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    return { text: "未解析", cls: "bg-slate-50 text-slate-600 border-slate-200" };
  }, [explain.kind]);

  const explainData = explain.kind === "ready" ? explain.data : null;
  const fulfillmentStatus = explainData?.fulfillment_status ?? null;
  const blockedReasons = explainData?.blocked_reasons ?? null;
  const isBlocked = (fulfillmentStatus ?? "") === "FULFILLMENT_BLOCKED";

  const blockedHint = useMemo(() => {
    const rs = blockedReasons ?? [];
    if (!rs.length) return "—";
    if (rs.includes("PROVINCE_MISSING_OR_INVALID")) return "地址省份缺失/无效，无法履约路由（暂不可拣货）。";
    return rs.join(" / ");
  }, [blockedReasons]);

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] text-slate-500">平台订单（镜像 / 对账视图）</div>
          <div className="mt-1 font-mono text-[12px] text-slate-900 truncate">{headerLabel}</div>
          <div className="mt-1 text-[11px] text-slate-500">
            状态：<span className="font-mono text-slate-700">{status}</span> · 下单：
            <span className="ml-1 font-mono text-slate-700">{createdAt}</span>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            onClick={() => {
              if (copyBusy) return;
              setCopyBusy(true);
              const text = buildCopySummaryText({ order: detailOrder, summary });
              void navigator.clipboard
                .writeText(text)
                .finally(() => setCopyBusy(false));
            }}
            disabled={copyBusy}
            title="复制订单摘要（用于运营沟通/排障对账）"
          >
            {copyBusy ? "复制中…" : "复制摘要"}
          </button>

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

      {/* ✅ 人类可读：收件/地址/金额/买家 */}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 px-3 py-2">
          <div className="text-[11px] font-semibold text-slate-700">收件信息</div>
          <div className="mt-1 text-[12px] text-slate-900">
            {receiverName} · {receiverPhone}
          </div>
          <div className="mt-1 text-[11px] text-slate-600">{region}</div>
          <div className="mt-1 text-[11px] text-slate-500 line-clamp-2">{detailAddr}</div>
          <div className="mt-1 text-[11px] text-slate-500">
            邮编：<span className="font-mono text-slate-700">{zipcode}</span>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 px-3 py-2">
          <div className="text-[11px] font-semibold text-slate-700">金额与买家</div>
          <div className="mt-1 text-[11px] text-slate-600">
            order_amount：<span className="font-mono text-slate-900">{orderAmount}</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-600">
            pay_amount：<span className="font-mono text-slate-900">{payAmount}</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600">
            买家：<span className="text-slate-900">{buyerName}</span> ·{" "}
            <span className="text-slate-900">{buyerPhone}</span>
          </div>
        </div>
      </div>

      {/* ✅ 解析/阻塞：降级为“可选展开” */}
      <details className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
        <summary className="cursor-pointer list-none select-none">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-semibold text-slate-700">解析/履约提示（可选）</div>
            <div className="flex items-center gap-2">
              <span className={"inline-flex items-center rounded-full border px-2 py-1 text-[11px] " + explainBadge.cls}>
                {explainBadge.text}
              </span>
            </div>
          </div>
        </summary>

        <div className="mt-2 space-y-2">
          {isBlocked ? (
            <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
              <div className="font-semibold">暂不可拣货</div>
              <div className="mt-1">{blockedHint}</div>
            </div>
          ) : (
            <div className="text-[11px] text-slate-600">
              履约状态：<span className="font-mono text-slate-900">{safeText(fulfillmentStatus ?? "—")}</span>
            </div>
          )}

          {explain.kind === "missing_key" ? (
            <div className="text-[12px] text-amber-700">{explain.reason}</div>
          ) : explain.kind === "error" ? (
            <div className="text-[12px] text-red-700">{explain.message}</div>
          ) : null}

          <div className="flex items-center gap-2">
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
            <div className="text-[11px] text-slate-500">
              说明：这里仅用于排障/治理提示；镜像区默认只展示订单本身。
            </div>
          </div>
        </div>
      </details>
    </div>
  );
};
