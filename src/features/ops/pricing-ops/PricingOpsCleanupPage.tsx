// src/features/ops/pricing-ops/PricingOpsCleanupPage.tsx
import { useState } from "react";
import { PricingOpsApi } from "./api";
import type { CleanupShellSchemesOut } from "./types";
import { OpsSectionCard } from "./components/OpsSectionCard";

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}

export default function PricingOpsCleanupPage() {
  const [limit, setLimit] = useState(500);
  const [includeSurchargeOnly, setIncludeSurchargeOnly] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [out, setOut] = useState<CleanupShellSchemesOut | null>(null);

  async function run(dryRun: boolean) {
    setLoading(true);
    setErr(null);
    try {
      const r = await PricingOpsApi.cleanupShellSchemes({
        dryRun,
        limit,
        includeSurchargeOnly,
      });
      setOut(r);
    } catch (e: unknown) {
      setErr(getErrorMessage(e));
      setOut(null);
    } finally {
      setLoading(false);
    }
  }

  async function exec() {
    const ok = window.confirm(
      "确认执行清理？将删除符合条件的 inactive 空壳方案（以及可选的 surcharge-only 方案）。",
    );
    if (!ok) return;
    await run(false);
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>运价运维中心 · 方案壳清理</div>
          <div style={{ marginTop: 6, fontSize: 12, color: "#6b7280" }}>
            建议：先 dry-run 查看候选，再执行。
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <a
            href="/ops/pricing-ops"
            style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 10 }}
          >
            返回总览
          </a>
          <button onClick={() => run(true)} disabled={loading} style={{ padding: "8px 12px" }}>
            {loading ? "运行中…" : "dry-run"}
          </button>
          <button onClick={exec} disabled={loading} style={{ padding: "8px 12px" }}>
            执行清理
          </button>
        </div>
      </div>

      {err ? <div style={{ marginTop: 12, color: "#b91c1c" }}>{err}</div> : null}

      <OpsSectionCard title="参数">
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ fontSize: 12, color: "#6b7280" }}>limit</div>
          <input
            type="number"
            value={limit}
            min={1}
            max={5000}
            onChange={(e) => setLimit(Number(e.target.value || 500))}
            style={{ width: 120, padding: "6px 8px" }}
          />
          <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12 }}>
            <input
              type="checkbox"
              checked={includeSurchargeOnly}
              onChange={(e) => setIncludeSurchargeOnly(e.target.checked)}
            />
            包含 surcharge-only 空壳
          </label>
        </div>
      </OpsSectionCard>

      <OpsSectionCard
        title="结果"
        subtitle={out ? `candidates_n=${out.candidates_n} / deleted_n=${out.deleted_n}` : "未运行"}
      >
        {out ? (
          <div style={{ fontSize: 12 }}>
            {out.candidates.length ? (
              <pre>{JSON.stringify(out.candidates, null, 2)}</pre>
            ) : (
              <div style={{ color: "#6b7280" }}>无候选（当前非常干净）</div>
            )}
          </div>
        ) : (
          <div style={{ color: "#6b7280", fontSize: 12 }}>点击 dry-run 获取候选列表</div>
        )}
      </OpsSectionCard>
    </div>
  );
}
