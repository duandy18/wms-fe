// src/features/admin/stores/components/StoreOrderIngestExecuteCard.tsx

import React, { useMemo, useState } from "react";
import type { StoreOrderIngestSimModel } from "./useStoreOrderIngestSimulator";
import { apiIngestPlatformOrder } from "../api_order_ingest";
import type { IngestOut, NextAction, ResolvedRow } from "../api_order_ingest";

function buildExtOrderNo(platform: string, shopId: string): string {
  const ts = Date.now();
  const rand = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `TEST-PICK-${String(platform).toUpperCase()}-${String(shopId)}-${ts}-${rand}`;
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

function ActionButtons(props: { actions: NextAction[] | null; storeId: number }) {
  const actions = props.actions ?? [];
  if (!actions.length) return null;

  function asObj(x: unknown): Record<string, unknown> | null {
    return x && typeof x === "object" ? (x as Record<string, unknown>) : null;
  }
  function asString(x: unknown): string | null {
    return typeof x === "string" ? x : null;
  }
  function asNumber(x: unknown): number | null {
    return typeof x === "number" && Number.isFinite(x) ? x : null;
  }
  function getPayload(a: NextAction): unknown {
    return (a as unknown as { payload?: unknown }).payload;
  }

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {actions.map((a, i) => {
        if (a.action === "go_store_fsku_binding_governance") {
          const p = asObj(getPayload(a));
          const storeId = asNumber(p?.store_id) ?? props.storeId;
          const mc = asString(p?.merchant_code) ?? "";
          const href = `/stores/${storeId}?focus_merchant_code=${encodeURIComponent(mc)}`;
          return (
            <button
              key={`${a.action}-${i}`}
              type="button"
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
              onClick={() => {
                window.location.href = href;
              }}
            >
              {a.label}
            </button>
          );
        }

        if (a.action === "bind_merchant_code") {
          const endpoint = (a as unknown as { endpoint?: unknown }).endpoint;
          const payload = getPayload(a);
          const payloadText = JSON.stringify(
            { endpoint: typeof endpoint === "string" ? endpoint : undefined, payload },
            null,
            2
          );

          return (
            <button
              key={`${a.action}-${i}`}
              type="button"
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
              onClick={async () => {
                const ok = await copyText(payloadText);
                if (!ok) window.prompt("复制以下内容用于人工绑定：", payloadText);
              }}
            >
              复制：{a.label}
            </button>
          );
        }

        const raw = JSON.stringify(a, null, 2);
        return (
          <button
            key={`${a.action}-${i}`}
            type="button"
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
            onClick={async () => {
              const ok = await copyText(raw);
              if (!ok) window.prompt("复制动作信息：", raw);
            }}
          >
            复制动作：{a.label || a.action}
          </button>
        );
      })}
    </div>
  );
}

function RowDetail(props: { row: ResolvedRow; storeId: number }) {
  const r = props.row;

  return (
    <div className="mt-2 rounded-md border border-slate-200 bg-white p-3">
      <div className="text-xs text-slate-700">
        <span className="font-semibold">reason：</span>
        <span className="font-mono">{r.reason ?? "-"}</span>
        {r.hint ? <span className="ml-2 text-slate-500">（{r.hint}）</span> : null}
      </div>

      {r.risk_level || r.risk_reason ? (
        <div className="mt-1 text-xs">
          <span className="font-semibold text-slate-700">risk：</span>
          <span className="font-mono text-slate-700">{r.risk_level ?? "-"}</span>
          {r.risk_reason ? <span className="ml-2 text-slate-600">{r.risk_reason}</span> : null}
        </div>
      ) : null}

      {r.risk_flags && r.risk_flags.length ? (
        <div className="mt-1 text-xs text-slate-500">
          flags：<span className="font-mono">{r.risk_flags.join(", ")}</span>
        </div>
      ) : null}

      <ActionButtons actions={r.next_actions} storeId={props.storeId} />
    </div>
  );
}

export const StoreOrderIngestExecuteCard: React.FC<{
  platform: string;
  shopId: string;
  storeId: number;
  model: StoreOrderIngestSimModel;
}> = ({ platform, shopId, storeId, model }) => {
  const { state } = model;

  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastOut, setLastOut] = useState<IngestOut | null>(null);

  const summaryLine = useMemo(() => {
    if (!lastOut) return null;
    const blocked = lastOut.blocked_reasons?.join(", ") ?? "";
    return `status=${lastOut.status} id=${lastOut.id ?? "-"} unresolved=${lastOut.unresolved.length} blocked=${blocked || "-"}`;
  }, [lastOut]);

  async function onExecute() {
    setError(null);
    setLastOut(null);

    if (!state.canExecute) {
      setError(state.validateMessage ?? "执行条件未满足");
      return;
    }

    setRunning(true);
    try {
      const ext = buildExtOrderNo(platform, shopId);
      const out = await apiIngestPlatformOrder({
        platform,
        shop_id: shopId,
        ext_order_no: ext,
        province: state.province.trim(),
        city: state.city.trim(),
        lines: state.selectedLines.map((x) => ({
          filled_code: x.filled_code,
          qty: x.qty,
          title: x.title,
          spec: x.spec,
        })),
      });
      setLastOut(out);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "请求失败";
      setError(msg);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-base font-semibold text-slate-900">执行生成（调用 ingest）</div>
          <div className="mt-1 text-xs text-slate-500">
            本卡负责调用 <span className="font-mono">POST /platform-orders/ingest</span> 并展示最近一次执行结果。
          </div>
        </div>

        <button
          type="button"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
          onClick={() => void onExecute()}
          disabled={running || !state.canExecute}
        >
          {running ? "执行中…" : "生成测试订单（1 单）"}
        </button>
      </div>

      {!state.canExecute && state.validateMessage ? (
        <div className="mt-2 text-xs text-amber-700">提示：{state.validateMessage}</div>
      ) : null}

      {error ? <div className="mt-2 text-sm text-red-600">{error}</div> : null}

      {lastOut ? (
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs text-slate-700">
            <span className="font-semibold">ref：</span> <span className="font-mono">{lastOut.ref}</span>
          </div>
          <div className="mt-1 text-xs text-slate-600">{summaryLine}</div>

          {lastOut.risk_reason ? (
            <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <span className="font-semibold">后端提示：</span>
              <span className="ml-1">{lastOut.risk_reason}</span>
            </div>
          ) : null}

          {lastOut.unresolved.length ? (
            <div className="mt-3">
              <div className="text-sm font-semibold text-slate-800">未解析明细（{lastOut.unresolved.length}）</div>
              <div className="mt-2">
                {lastOut.unresolved.map((u, idx) => (
                  <div key={`${u.filled_code}-${idx}`} className="mb-2">
                    <div className="text-xs text-slate-700">
                      行：<span className="font-mono">{u.filled_code || "（空码）"}</span> · qty={u.qty}
                    </div>
                    <RowDetail row={u} storeId={storeId} />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
