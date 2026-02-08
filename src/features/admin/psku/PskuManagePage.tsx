// src/features/admin/psku/PskuManagePage.tsx

import React, { useEffect, useMemo, useState } from "react";
import type { PskuRow } from "./types";
import { fetchPlatformSkus } from "./api";
import { PskuDetailDrawer } from "./components/PskuDetailDrawer";

type BoundFilter = "all" | "bound" | "unbound";

const DEFAULT_LIMIT = 50;

export const PskuManagePage: React.FC = () => {
  const [storeId, setStoreId] = useState<string>("");
  const [q, setQ] = useState<string>("");
  const [bound, setBound] = useState<BoundFilter>("all");

  const [loading, setLoading] = useState<boolean>(false);
  const [rows, setRows] = useState<PskuRow[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const [selectedRow, setSelectedRow] = useState<PskuRow | null>(null);

  const parsedStoreId = useMemo((): number | null => {
    const v = storeId.trim();
    if (!v) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }, [storeId]);

  useEffect(() => {
    if (parsedStoreId == null) {
      setRows([]);
      setLoading(false);
      setErrorMsg("请先输入店铺ID（store_id）。列表接口为 /stores/{store_id}/platform-skus");
      return;
    }

    let alive = true;
    setLoading(true);
    setErrorMsg("");

    fetchPlatformSkus({
      storeId: parsedStoreId,
      withBinding: 1,
      limit: DEFAULT_LIMIT,
      offset: 0,
      q: q.trim() ? q.trim() : null,
    })
      .then((res) => {
        if (!alive) return;
        setRows(res.items);
      })
      .catch((e: unknown) => {
        if (!alive) return;
        setRows([]);
        setErrorMsg(e instanceof Error ? e.message : "加载失败");
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [parsedStoreId, q]);

  const filteredRows = useMemo(() => {
    if (bound === "all") return rows;
    if (bound === "bound") return rows.filter((r) => !!r.current_binding);
    return rows.filter((r) => !r.current_binding);
  }, [rows, bound]);

  return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0 }}>平台上架SKU（PSKU）</h2>
        <span style={{ color: "#666" }}>
          mirror-first；绑定必须存在（不留空）；不提供解绑；通过 migrate 替换绑定目标
        </span>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          value={storeId}
          onChange={(e) => setStoreId(e.target.value)}
          placeholder="店铺ID store_id（必填）"
          style={{ width: 180, padding: "8px 10px" }}
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜索：q（后端支持）"
          style={{ minWidth: 360, padding: "8px 10px" }}
        />
        <select value={bound} onChange={(e) => setBound(e.target.value as BoundFilter)} style={{ padding: "8px 10px" }}>
          <option value="all">全部</option>
          <option value="bound">已绑定</option>
          <option value="unbound">未绑定</option>
        </select>
      </div>

      {errorMsg ? (
        <div style={{ padding: 10, border: "1px solid #f3d3d3", background: "#fff6f6", borderRadius: 10, color: "#a33" }}>
          {errorMsg}
        </div>
      ) : null}

      <div style={{ display: "flex", gap: 12, minHeight: 520 }}>
        <div style={{ flex: 1, border: "1px solid #eee", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: 10, borderBottom: "1px solid #eee", display: "flex", alignItems: "center", gap: 10 }}>
            <strong>列表</strong>
            {loading ? (
              <span style={{ color: "#666" }}>加载中…</span>
            ) : (
              <span style={{ color: "#666" }}>共 {filteredRows.length} 条</span>
            )}
          </div>

          <div style={{ overflow: "auto" }}>
            {filteredRows.map((r) => {
              const title = r.mirror?.title ?? "（无镜像标题）";
              const skuId = r.mirror?.platform_sku_id ?? "—";
              const binding = r.current_binding?.fsku
                ? `${r.current_binding.fsku.code}｜${r.current_binding.fsku.name}`
                : "未绑定";
              const isActive = selectedRow?.id === r.id;

              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRow(r)}
                  style={{
                    padding: 12,
                    borderBottom: "1px solid #f2f2f2",
                    cursor: "pointer",
                    background: isActive ? "#f7f9ff" : "white",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                      <strong>{title}</strong>
                      <span style={{ color: "#666" }}>{r.platform}</span>
                      <span style={{ color: "#666" }}>Store {r.store_id}</span>
                    </div>
                    <div style={{ color: "#666" }}>platform_sku_id：{skuId}</div>
                    <div style={{ color: r.current_binding ? "#2b6" : "#c33" }}>绑定：{binding}</div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <span style={{ color: "#666" }}>Mirror: {r.mirror_freshness}</span>
                  </div>
                </div>
              );
            })}

            {!loading && filteredRows.length === 0 ? <div style={{ padding: 16, color: "#666" }}>没有数据</div> : null}
          </div>
        </div>

        <PskuDetailDrawer
          row={selectedRow}
          onClose={() => setSelectedRow(null)}
          onChanged={async () => {
            // 变更后刷新列表：重新拉一次（确保 binding_id / current_binding 更新）
            const sid = parsedStoreId;
            if (sid == null) return;
            const res = await fetchPlatformSkus({
              storeId: sid,
              withBinding: 1,
              limit: DEFAULT_LIMIT,
              offset: 0,
              q: q.trim() ? q.trim() : null,
            });
            setRows(res.items);
          }}
        />
      </div>
    </div>
  );
};

export default PskuManagePage;
