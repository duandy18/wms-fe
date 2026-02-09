// src/features/admin/psku/PskuManagePage.tsx

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { PskuGovernanceAction, PskuGovernanceRow, PskuGovernanceStatus } from "./types";
import type { PlatformCode } from "./api";
import { PskuDetailDrawer } from "./components/PskuDetailDrawer";
import { PskuGovernanceTable } from "./components/PskuGovernanceTable";
import { useStorePicker } from "./useStorePicker";
import { usePskuGovernanceList } from "./hooks/usePskuGovernanceList";

type StatusFilter = "all" | PskuGovernanceStatus;
type ActionFilter = "all" | PskuGovernanceAction;

const DEFAULT_LIMIT = 50;

export const PskuManagePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    platformOptions,
    platformLoading,
    platformErr,

    platform,
    setPlatform,

    storeQ,
    setStoreQ,
    storeOptions,
    storeLoading,
    storeErr,
    storeId,
    setStoreId,
  } = useStorePicker();

  const [q, setQ] = useState<string>("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [action, setAction] = useState<ActionFilter>("all");

  const [selectedRow, setSelectedRow] = useState<PskuGovernanceRow | null>(null);

  // URL -> state：platform（允许空：表示“全部平台汇总”）
  useEffect(() => {
    const p = (searchParams.get("platform") || "").trim().toUpperCase();
    if (p) setPlatform(p as PlatformCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // URL -> state：store_id
  useEffect(() => {
    const sidRaw = (searchParams.get("store_id") || "").trim();
    if (!sidRaw) return;
    const n = Number(sidRaw);
    if (!Number.isFinite(n) || n < 1) return;
    if (storeId == null) setStoreId(n);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // state -> URL：platform + store_id
  useEffect(() => {
    const next = new URLSearchParams(searchParams);

    // ✅ 为空表示“全部平台”，不写入 URL 参数
    if (platform) next.set("platform", platform);
    else next.delete("platform");

    if (storeId == null) next.delete("store_id");
    else next.set("store_id", String(storeId));

    if (next.toString() !== searchParams.toString()) setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform, storeId]);

  const query = useMemo(
    () => ({
      platform: platform || null, // ✅ null => 后端汇总全部平台
      storeId: storeId ?? null,
      status: status === "all" ? null : status,
      action: action === "all" ? null : action,
      q: q.trim() ? q.trim() : null,
      limit: DEFAULT_LIMIT,
      offset: 0,
    }),
    [platform, storeId, status, action, q],
  );

  const L = usePskuGovernanceList(query);

  const emptyHint = useMemo(() => {
    if (platformErr) return "";
    if (platformLoading) return "加载平台中…";
    if (!platformOptions.length) return "当前系统没有可用平台（/meta/platforms 为空）。";
    if (!L.loading && L.rows.length === 0) return "暂无治理对象（或过滤条件过严）。";
    return "";
  }, [platformErr, platformLoading, platformOptions.length, L.loading, L.rows.length]);

  const platformLabel = platform ? platform : "ALL";

  return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0 }}>平台上架SKU（PSKU）治理工作台</h2>
        <span style={{ color: "#666" }}>数据源：/psku-governance（后端裁决 status/action/action_hint/bind_ctx；前端不推断）</span>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <select
          value={platform}
          onChange={(e) => {
            const v = (e.target.value || "").trim().toUpperCase();
            // "" => 全部平台
            setPlatform(v as PlatformCode);
            // 切到全部平台时，店铺过滤没有意义（而且 storeOptions 依赖 platform），直接清空
            if (!v) setStoreId(null);
          }}
          style={{ padding: "8px 10px", minWidth: 160 }}
          disabled={platformLoading || !!platformErr || platformOptions.length === 0}
        >
          {platformLoading ? <option value="">加载平台中…</option> : null}
          {!platformLoading && platformOptions.length === 0 ? <option value="">无可用平台</option> : null}
          {/* ✅ 新增：全部平台 */}
          <option value="">全部平台（汇总）</option>
          {platformOptions.map((o) => (
            <option key={o.platform} value={o.platform}>
              {o.label}
            </option>
          ))}
        </select>

        <input
          value={storeQ}
          onChange={(e) => setStoreQ(e.target.value)}
          placeholder="店铺搜索（name/shop_id/id）"
          style={{ width: 260, padding: "8px 10px" }}
          disabled={storeLoading || !platform || !!platformErr || platformLoading}
          title={!platform ? "需先选择具体平台，才能加载该平台下的店铺候选" : undefined}
        />

        <select
          value={storeId ?? ""}
          onChange={(e) => setStoreId(e.target.value ? Number(e.target.value) : null)}
          style={{ minWidth: 360, padding: "8px 10px" }}
          disabled={storeLoading || !!storeErr || !platform || !!platformErr || platformLoading}
          title={!platform ? "需先选择具体平台，才能按平台加载店铺候选" : undefined}
        >
          <option value="">
            {storeLoading ? "加载店铺中…" : platform ? `店铺过滤（可选，${platform}）` : "店铺过滤（需先选具体平台）"}
          </option>
          {storeOptions.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜索：q（platform_sku_id/sku_name/spec/fsku）"
          style={{ minWidth: 360, padding: "8px 10px" }}
        />

        <select value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)} style={{ padding: "8px 10px" }}>
          <option value="all">状态：全部</option>
          <option value="BOUND">状态：已绑定（BOUND）</option>
          <option value="UNBOUND">状态：未绑定（UNBOUND）</option>
          <option value="LEGACY_ITEM_BOUND">状态：遗留绑定（LEGACY_ITEM_BOUND）</option>
        </select>

        <select value={action} onChange={(e) => setAction(e.target.value as ActionFilter)} style={{ padding: "8px 10px" }}>
          <option value="all">行动：全部</option>
          <option value="OK">行动：OK</option>
          <option value="BIND_FIRST">行动：BIND_FIRST</option>
          <option value="MIGRATE_LEGACY">行动：MIGRATE_LEGACY</option>
        </select>
      </div>

      {platformErr ? (
        <div style={{ padding: 10, border: "1px solid #f3d3d3", background: "#fff6f6", borderRadius: 10, color: "#a33" }}>
          平台列表加载失败：{platformErr}（接口：/meta/platforms）
        </div>
      ) : null}

      {storeErr ? (
        <div style={{ padding: 10, border: "1px solid #f3d3d3", background: "#fff6f6", borderRadius: 10, color: "#a33" }}>
          店铺列表加载失败：{storeErr}
        </div>
      ) : null}

      {L.errorMsg ? (
        <div style={{ padding: 10, border: "1px solid #f3d3d3", background: "#fff6f6", borderRadius: 10, color: "#a33" }}>
          {L.errorMsg}
        </div>
      ) : null}

      {!platformErr && !storeErr && !L.errorMsg && emptyHint ? (
        <div style={{ padding: 10, border: "1px solid #eee", background: "#fafafa", borderRadius: 10, color: "#666" }}>
          {emptyHint} <span style={{ color: "#999" }}>（接口：/psku-governance）</span>
        </div>
      ) : null}

      <div style={{ display: "flex", gap: 12, minHeight: 520 }}>
        <div style={{ flex: 1, border: "1px solid #eee", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: 10, borderBottom: "1px solid #eee", display: "flex", alignItems: "center", gap: 10 }}>
            <strong>治理总表</strong>
            <span style={{ color: "#666" }}>platform={platformLabel}</span>
            {storeId != null ? <span style={{ color: "#666" }}>store_id={storeId}</span> : null}
            {L.loading ? <span style={{ color: "#666" }}>加载中…</span> : <span style={{ color: "#666" }}>total={L.total}（当前 {L.rows.length} 条）</span>}
          </div>

          <PskuGovernanceTable rows={L.rows} loading={L.loading} selectedRow={selectedRow} onSelectRow={(r) => setSelectedRow(r)} />
        </div>

        <PskuDetailDrawer
          row={selectedRow}
          onClose={() => setSelectedRow(null)}
          onChanged={async () => {
            await L.reload();
          }}
        />
      </div>
    </div>
  );
};

export default PskuManagePage;
