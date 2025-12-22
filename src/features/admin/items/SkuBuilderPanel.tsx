// src/features/admin/items/SkuBuilderPanel.tsx
//
// 已废弃：SKU 统一由后端生成（AKT-序列号），前端不允许手填或拼码。
// 保留此组件仅作为“提示/体检”，避免历史引用导致构建失败。

import React, { useState } from "react";
import { fetchNextSku } from "./api";

type Props = {
  onApplySku?: (sku: string) => void; // 兼容旧调用，不强制使用
};

function errMsg(e: unknown, fallback: string): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return fallback;
}

export const SkuBuilderPanel: React.FC<Props> = ({ onApplySku }) => {
  const [loading, setLoading] = useState(false);
  const [sku, setSku] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const ping = async () => {
    if (loading) return;
    setErr(null);
    try {
      setLoading(true);
      const s = await fetchNextSku();
      setSku(s);
      if (onApplySku) onApplySku(s);
    } catch (e: unknown) {
      setErr(errMsg(e, "调用 /items/sku/next 失败"));
      setSku(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="border border-slate-200 rounded-xl bg-white p-4 space-y-2">
      <div className="text-sm font-semibold text-slate-800">SKU 生成（已统一后端）</div>
      <div className="text-[11px] text-slate-500">
        SKU 由后端序列号生成（AKT-000001...）。前端不再提供手填/拼码入口，避免标准分裂。
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => void ping()}
          disabled={loading}
          className="rounded border px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-60"
        >
          {loading ? "调用中…" : "体检发号接口"}
        </button>

        {sku && (
          <span className="text-[11px] text-slate-700">
            返回：<span className="font-mono">{sku}</span>
          </span>
        )}
      </div>

      {err && <div className="text-[11px] text-red-600">{err}</div>}
    </section>
  );
};

export default SkuBuilderPanel;
