// src/features/admin/psku/components/PskuDetailDrawer.tsx

import React, { useEffect, useMemo, useState } from "react";
import type { BindingHistoryItem, FskuPickerOption, PskuGovernanceRow, PskuMirror } from "../types";
import {
  createBinding,
  fetchBindingCurrent,
  fetchBindingHistory,
  fetchPlatformSkuMirror,
  fetchPublishedFskus,
  migrateBinding,
} from "../api";

export const PskuDetailDrawer: React.FC<{
  row: PskuGovernanceRow | null;
  onClose: () => void;
  onChanged: () => void;
}> = ({ row, onClose, onChanged }) => {
  const [loading, setLoading] = useState<boolean>(false);

  const [mirror, setMirror] = useState<PskuMirror | null>(null);
  const [bindingId, setBindingId] = useState<number | null>(null);
  const [currentFskuId, setCurrentFskuId] = useState<number | null>(null);
  const [currentFskuLabel, setCurrentFskuLabel] = useState<string>("");

  const [history, setHistory] = useState<BindingHistoryItem[]>([]);

  const [pickerQ, setPickerQ] = useState<string>("");
  const [pickerLoading, setPickerLoading] = useState<boolean>(false);
  const [fskuOptions, setFskuOptions] = useState<FskuPickerOption[]>([]);
  const [selectedFskuId, setSelectedFskuId] = useState<number | null>(null);
  const [reason, setReason] = useState<string>("");

  const platform = row?.platform ?? "";
  const storeId = row?.store_id ?? null;
  const platformSkuId = useMemo(() => row?.platform_sku_id ?? null, [row]);

  useEffect(() => {
    if (!row || storeId == null || !platformSkuId) {
      setMirror(null);
      setBindingId(null);
      setCurrentFskuId(null);
      setCurrentFskuLabel("");
      setHistory([]);
      setSelectedFskuId(null);
      setPickerQ("");
      setFskuOptions([]);
      setReason("");
      return;
    }

    let alive = true;
    setLoading(true);

    Promise.all([
      fetchPlatformSkuMirror({ platform, storeId, platformSkuId }),
      fetchBindingCurrent({ platform, storeId, platformSkuId }),
      fetchBindingHistory({ platform, storeId, platformSkuId, limit: 50, offset: 0 }),
    ])
      .then(([m, cur, hist]) => {
        if (!alive) return;
        setMirror(m);

        if (cur) {
          setBindingId(cur.binding_id);
          setCurrentFskuId(cur.fsku.id);
          setCurrentFskuLabel(`${cur.fsku.code}｜${cur.fsku.name}（${cur.fsku.status}）`);
          setSelectedFskuId(cur.fsku.id);
        } else {
          setBindingId(row.binding_id ?? null);
          setCurrentFskuId(null);
          setCurrentFskuLabel("未绑定（治理待处理：需要创建首条 binding 后才能迁移）");
          setSelectedFskuId(null);
        }

        setHistory(hist);

        if (row.bind_ctx?.suggest_fsku_query) setPickerQ(row.bind_ctx.suggest_fsku_query);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [row, platform, storeId, platformSkuId]);

  useEffect(() => {
    const q = pickerQ.trim();
    if (!q) {
      setFskuOptions([]);
      return;
    }
    let alive = true;
    setPickerLoading(true);

    fetchPublishedFskus(q)
      .then((items) => {
        if (!alive) return;
        setFskuOptions(items);
      })
      .finally(() => {
        if (!alive) return;
        setPickerLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [pickerQ]);

  if (!row) return null;

  const canCreateFirstBinding = storeId != null && !!platform && !!platformSkuId && bindingId == null && selectedFskuId != null;
  const canMigrate =
    storeId != null && !!platform && !!platformSkuId && bindingId != null && selectedFskuId != null && selectedFskuId !== currentFskuId;

  async function reloadFactsAfterWrite(): Promise<void> {
    if (!platformSkuId || storeId == null) return;
    const [cur, hist] = await Promise.all([
      fetchBindingCurrent({ platform, storeId, platformSkuId }),
      fetchBindingHistory({ platform, storeId, platformSkuId, limit: 50, offset: 0 }),
    ]);

    if (cur) {
      setBindingId(cur.binding_id);
      setCurrentFskuId(cur.fsku.id);
      setCurrentFskuLabel(`${cur.fsku.code}｜${cur.fsku.name}（${cur.fsku.status}）`);
      setSelectedFskuId(cur.fsku.id);
    } else {
      setBindingId(null);
      setCurrentFskuId(null);
      setCurrentFskuLabel("未绑定（治理待处理：需要创建首条 binding 后才能迁移）");
      setSelectedFskuId(null);
    }
    setHistory(hist);
  }

  const actionText =
    row.action_hint.action === "OK" ? "无需治理" : row.action_hint.action === "BIND_FIRST" ? "需首绑（BIND_FIRST）" : "需迁移遗留（MIGRATE_LEGACY）";

  return (
    <div
      style={{
        width: 520,
        border: "1px solid #eee",
        borderRadius: 10,
        overflow: "hidden",
        background: "white",
      }}
    >
      <div style={{ padding: 12, borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <strong>详情</strong>
          <span style={{ color: "#666" }}>必填参数：platform + store_id + platform_sku_id</span>
        </div>
        <button onClick={onClose} style={{ padding: "6px 10px" }}>
          关闭
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 12, color: "#666" }}>加载中…</div>
      ) : (
        <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Governance */}
          <div style={{ border: "1px solid #f0f0f0", borderRadius: 10, padding: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <strong>治理裁决（Governance）</strong>
              <span style={{ color: "#666" }}>
                {platform}｜store_id={storeId ?? "—"}
              </span>
            </div>
            <div style={{ marginTop: 8, color: "#333", display: "flex", flexDirection: "column", gap: 4 }}>
              <div>platform_sku_id：{platformSkuId ?? "—"}</div>
              <div>sku_name：{row.sku_name ?? "—"}</div>
              <div>spec：{row.spec ?? "—"}</div>
              <div>
                status：<span style={{ fontFamily: "monospace" }}>{row.governance.status}</span> · action：
                <span style={{ fontFamily: "monospace" }}> {row.action_hint.action}</span>（{actionText}）
              </div>
              {row.bind_ctx ? (
                <div style={{ color: "#666" }}>
                  建议检索：<span style={{ fontFamily: "monospace" }}>{row.bind_ctx.suggest_q}</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Mirror */}
          <div style={{ border: "1px solid #f0f0f0", borderRadius: 10, padding: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <strong>平台事实（Mirror）</strong>
              <span style={{ color: "#666" }}>freshness={row.mirror_freshness}</span>
            </div>
            <div style={{ marginTop: 8, color: "#333" }}>
              <div>标题：{mirror?.title ?? row.sku_name ?? "—"}</div>
              <div>规格：{mirror?.variant_name ?? row.spec ?? "—"}</div>
              <div>observed_at：{mirror?.observed_at ?? "—"}</div>
            </div>
          </div>

          {/* Binding */}
          <div style={{ border: "1px solid #f0f0f0", borderRadius: 10, padding: 10 }}>
            <strong>绑定裁决（Current Binding）</strong>
            <div style={{ marginTop: 8, color: "#333" }}>
              <div>当前绑定：{currentFskuLabel || "—"}</div>
              <div style={{ color: "#666" }}>binding_id：{bindingId ?? "—"}</div>
            </div>

            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
              <input value={pickerQ} onChange={(e) => setPickerQ(e.target.value)} placeholder="搜索已发布 FSKU（code/name 关键词）" style={{ padding: "8px 10px" }} />

              <select
                value={selectedFskuId ?? ""}
                onChange={(e) => setSelectedFskuId(e.target.value ? Number(e.target.value) : null)}
                style={{ padding: "8px 10px" }}
              >
                <option value="">请选择目标 FSKU（published）</option>
                {fskuOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.code}｜{o.name}（{o.status}）
                  </option>
                ))}
              </select>

              <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="原因/备注（可选，字段名 reason）" style={{ padding: "8px 10px" }} />

              {/* ✅ 创建首条 binding（BIND_FIRST） */}
              <button
                disabled={pickerLoading || !canCreateFirstBinding}
                onClick={async () => {
                  if (storeId == null || !platformSkuId || selectedFskuId == null) return;

                  await createBinding({
                    platform,
                    storeId,
                    platformSkuId,
                    fskuId: selectedFskuId,
                    reason: reason.trim() || undefined,
                  });

                  await reloadFactsAfterWrite();
                  onChanged();
                }}
                style={{ padding: "8px 10px" }}
              >
                创建首条绑定（写入）
              </button>

              {/* 迁移（需要 binding_id） */}
              <button
                disabled={pickerLoading || !canMigrate}
                onClick={async () => {
                  if (bindingId == null || selectedFskuId == null) return;

                  await migrateBinding({ bindingId, toFskuId: selectedFskuId, reason: reason.trim() || undefined });
                  await reloadFactsAfterWrite();
                  onChanged();
                }}
                style={{ padding: "8px 10px" }}
              >
                迁移到该 FSKU
              </button>

              <div style={{ color: "#666" }}>说明：不提供解绑。修正请迁移到正确的已发布 FSKU。</div>

              {bindingId == null ? (
                <div style={{ color: "#a33" }}>当前没有 binding_id：无法迁移。若该 PSKU 从未绑定过，需要先创建首条 binding。</div>
              ) : null}
            </div>
          </div>

          {/* History */}
          <div style={{ border: "1px solid #f0f0f0", borderRadius: 10, padding: 10 }}>
            <strong>变更历史（History）</strong>
            <div style={{ marginTop: 8, color: "#666" }}>{history.length ? `共 ${history.length} 条` : "暂无"}</div>
          </div>
        </div>
      )}
    </div>
  );
};
