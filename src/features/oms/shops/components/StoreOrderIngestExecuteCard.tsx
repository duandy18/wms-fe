// src/features/admin/stores/components/StoreOrderIngestExecuteCard.tsx

import React, { useMemo, useState } from "react";
import type { StoreOrderIngestSimModel } from "./useStoreOrderIngestSimulator";
import { apiIngestPlatformOrder, apiOrderSimGenerate, apiOrderSimPreview } from "../api_order_ingest";
import type { IngestOut, OrderSimPreviewOut } from "../api_order_ingest";
import { buildIdempotencyKey } from "./order-sim/execute/utils";
import { PreviewHumanPanel } from "./order-sim/execute/PreviewHumanPanel";
import { JsonBox } from "./order-sim/execute/JsonBox";
import { RowDetail } from "./order-sim/execute/RowDetail";

export const StoreOrderIngestExecuteCard: React.FC<{
  platform: string;
  shopId: string;
  storeId: number;
  model: StoreOrderIngestSimModel;
  onResetWorkspace: () => Promise<void>;
}> = ({ platform, shopId, storeId, model, onResetWorkspace }) => {
  const { state } = model;

  const [previewing, setPreviewing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [resetting, setResetting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [lastPreview, setLastPreview] = useState<OrderSimPreviewOut | null>(null);
  const [lastOut, setLastOut] = useState<IngestOut | null>(null);

  const summaryLine = useMemo(() => {
    if (!lastOut) return null;
    const blocked = lastOut.blocked_reasons?.join(", ") ?? "";
    return `status=${lastOut.status} id=${lastOut.id ?? "-"} unresolved=${lastOut.unresolved.length} blocked=${blocked || "-"}`;
  }, [lastOut]);

  async function resetWorkspaceUiAndDb() {
    setResetting(true);
    try {
      await onResetWorkspace();
      setLastPreview(null);
      setLastOut(null);
      setError(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "清空失败";
      setError(msg);
    } finally {
      setResetting(false);
    }
  }

  async function onPreview() {
    setError(null);
    setLastPreview(null);

    if (!state.canExecute) {
      setError(state.validateMessage ?? "执行条件未满足");
      return;
    }

    setPreviewing(true);
    try {
      const key = buildIdempotencyKey("PREVIEW");
      const out = await apiOrderSimPreview({ storeId, idempotency_key: key });
      setLastPreview(out);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "请求失败";
      setError(msg);
    } finally {
      setPreviewing(false);
    }
  }

  async function onGenerate() {
    setError(null);
    setLastOut(null);

    if (!state.canExecute) {
      setError(state.validateMessage ?? "执行条件未满足");
      return;
    }

    setGenerating(true);
    try {
      const key = buildIdempotencyKey("GEN");
      const out = await apiOrderSimGenerate({ storeId, idempotency_key: key });
      setLastOut(out);

      // ✅ 生成成功后：自动清空工作区，准备下一单
      if (String(out.status).toUpperCase() === "OK") {
        await resetWorkspaceUiAndDb();
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "请求失败";
      setError(msg);
    } finally {
      setGenerating(false);
    }
  }

  // 旧入口保留（极简）：直接调 /platform-orders/ingest（不推荐）
  async function onLegacyIngest() {
    setError(null);
    setLastOut(null);

    if (!state.canExecute) {
      setError(state.validateMessage ?? "执行条件未满足");
      return;
    }

    setGenerating(true);
    try {
      const ext = `TEST-PICK-${String(platform).toUpperCase()}-${String(shopId)}-${Date.now()}`;
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
      setGenerating(false);
    }
  }

  const busy = previewing || generating || resetting;

  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-base font-semibold text-slate-900">执行生成（预览 → 确认生成）</div>
          <div className="mt-1 text-xs text-slate-500">
            推荐路径：先预览（不落库），再确认生成（落库）。确认生成成功后系统会自动清空工作区，方便继续下一单。
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800 disabled:opacity-50"
            onClick={() => void onPreview()}
            disabled={busy || !state.canExecute}
          >
            {previewing ? "预览中…" : "预览（不落库）"}
          </button>

          <button
            type="button"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
            onClick={() => void onGenerate()}
            disabled={busy || !state.canExecute}
          >
            {generating ? "生成中…" : "确认生成（落库）"}
          </button>

          <button
            type="button"
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 disabled:opacity-50"
            onClick={() => void resetWorkspaceUiAndDb()}
            disabled={busy}
            title="清空客户信息/勾选/qty/预览结果，开始下一单"
          >
            {resetting ? "清空中…" : "开始下一单"}
          </button>

          <button
            type="button"
            className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 disabled:opacity-50"
            onClick={() => void onLegacyIngest()}
            disabled={busy || !state.canExecute}
            title="兼容旧路径：POST /platform-orders/ingest（不推荐）"
          >
            旧：ingest
          </button>
        </div>
      </div>

      {!state.canExecute && state.validateMessage ? (
        <div className="mt-2 text-xs text-amber-700">提示：{state.validateMessage}</div>
      ) : null}

      {error ? <div className="mt-2 text-sm text-red-600">{error}</div> : null}

      {lastPreview ? <PreviewHumanPanel storeId={storeId} data={lastPreview} /> : null}

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

          <details className="mt-3">
            <summary className="cursor-pointer text-xs text-slate-600 hover:text-slate-800">查看原始 JSON（排障用）</summary>
            <JsonBox title="generate result（raw）" value={lastOut} />
          </details>
        </div>
      ) : null}
    </div>
  );
};
