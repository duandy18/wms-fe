// src/features/admin/psku/components/PskuDetailDrawer.tsx

import React, { useEffect, useMemo, useState } from "react";
import type { BindingHistoryItem, FskuPickerOption, PskuMirror, PskuRow } from "../types";
import { fetchBindingCurrent, fetchBindingHistory, fetchPlatformSkuMirror, fetchPublishedFskus, migrateBinding } from "../api";

export const PskuDetailDrawer: React.FC<{
  row: PskuRow | null;
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
  const [note, setNote] = useState<string>("");

  const platform = row?.platform ?? "";
  const shopId = row?.store_id ?? null; // 约定：shop_id == store_id
  const platformSkuId = useMemo(() => row?.mirror?.platform_sku_id ?? null, [row]);

  useEffect(() => {
    if (!row || shopId == null || !platformSkuId) {
      setMirror(null);
      setBindingId(null);
      setCurrentFskuId(null);
      setCurrentFskuLabel("");
      setHistory([]);
      setSelectedFskuId(null);
      setPickerQ("");
      setFskuOptions([]);
      setNote("");
      return;
    }

    let alive = true;
    setLoading(true);

    Promise.all([
      fetchPlatformSkuMirror({ platform, shopId, platformSkuId }),
      fetchBindingCurrent({ platform, shopId, platformSkuId }),
      fetchBindingHistory({ platform, shopId, platformSkuId, limit: 50, offset: 0 }),
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
          // 理论上“必须绑定”，但治理期可能存在空；UI 允许看到并提醒
          setBindingId(row.current_binding?.binding_id ?? null);
          setCurrentFskuId(null);
          setCurrentFskuLabel("未绑定（治理待处理：需要创建 binding 后才能迁移）");
          setSelectedFskuId(null);
        }

        setHistory(hist);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [row, platform, shopId, platformSkuId]);

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
          <span style={{ color: "#666" }}>
            必填参数：platform + shop_id + platform_sku_id（shop_id 默认等于 store_id）
          </span>
        </div>
        <button onClick={onClose} style={{ padding: "6px 10px" }}>
          关闭
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 12, color: "#666" }}>加载中…</div>
      ) : (
        <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Mirror */}
          <div style={{ border: "1px solid #f0f0f0", borderRadius: 10, padding: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <strong>平台事实（Mirror）</strong>
              <span style={{ color: "#666" }}>{platform}｜shop_id={shopId ?? "—"}</span>
            </div>
            <div style={{ marginTop: 8, color: "#333" }}>
              <div>platform_sku_id：{platformSkuId ?? "—"}</div>
              <div>标题：{mirror?.title ?? row.mirror?.title ?? "—"}</div>
              <div>规格：{mirror?.variant_name ?? row.mirror?.variant_name ?? "—"}</div>
              <div>observed_at：{mirror?.observed_at ?? row.mirror?.observed_at ?? "—"}</div>
            </div>
            {!platformSkuId ? (
              <div style={{ marginTop: 8, color: "#a33" }}>
                列表返回缺少 platform_sku_id，无法查询 mirror/binding。请检查 PlatformSkuListOut.items 的字段结构。
              </div>
            ) : null}
          </div>

          {/* Binding */}
          <div style={{ border: "1px solid #f0f0f0", borderRadius: 10, padding: 10 }}>
            <strong>绑定裁决（Current Binding）</strong>
            <div style={{ marginTop: 8, color: "#333" }}>
              <div>当前绑定：{currentFskuLabel || "—"}</div>
              <div style={{ color: "#666" }}>binding_id：{bindingId ?? "—"}</div>
            </div>

            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
              <input
                value={pickerQ}
                onChange={(e) => setPickerQ(e.target.value)}
                placeholder="搜索已发布 FSKU（code/name 关键词）"
                style={{ padding: "8px 10px" }}
              />

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

              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="备注（可选）：为什么迁移"
                style={{ padding: "8px 10px" }}
              />

              <button
                disabled={pickerLoading || selectedFskuId == null || selectedFskuId === currentFskuId || bindingId == null}
                onClick={async () => {
                  if (bindingId == null || selectedFskuId == null) return;
                  await migrateBinding({ bindingId, toFskuId: selectedFskuId, note: note.trim() || undefined });

                  // 迁移后刷新 current/history
                  if (!platformSkuId || shopId == null) return;
                  const [cur, hist] = await Promise.all([
                    fetchBindingCurrent({ platform, shopId, platformSkuId }),
                    fetchBindingHistory({ platform, shopId, platformSkuId, limit: 50, offset: 0 }),
                  ]);

                  if (cur) {
                    setBindingId(cur.binding_id);
                    setCurrentFskuId(cur.fsku.id);
                    setCurrentFskuLabel(`${cur.fsku.code}｜${cur.fsku.name}（${cur.fsku.status}）`);
                    setSelectedFskuId(cur.fsku.id);
                  }
                  setHistory(hist);

                  onChanged();
                }}
                style={{ padding: "8px 10px" }}
              >
                迁移到该 FSKU
              </button>

              <div style={{ color: "#666" }}>说明：不提供解绑（Unbind）。如需修正，请迁移到正确的已发布 FSKU。</div>

              {bindingId == null ? (
                <div style={{ color: "#a33" }}>
                  当前没有 binding_id：无法迁移。你们后端虽然支持 migrate(binding_id)，但如果某条记录从未绑定过，
                  需要有“创建首条 binding”的接口（或 list with_binding=1 必须带 current binding_id）。
                </div>
              ) : null}
            </div>
          </div>

          {/* History */}
          <div style={{ border: "1px solid #f0f0f0", borderRadius: 10, padding: 10 }}>
            <strong>变更历史（History）</strong>
            <div style={{ marginTop: 8, color: "#666" }}>
              {history.length ? `共 ${history.length} 条` : "暂无"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
