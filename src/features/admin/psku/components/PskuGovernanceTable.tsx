// src/features/admin/psku/components/PskuGovernanceTable.tsx

import React, { useMemo } from "react";
import type { PskuGovernanceRow, PskuGovernanceStatus } from "../types";

export const PskuGovernanceTable: React.FC<{
  rows: PskuGovernanceRow[];
  loading: boolean;
  selectedRow: PskuGovernanceRow | null;
  onSelectRow: (row: PskuGovernanceRow) => void;
}> = ({ rows, loading, selectedRow, onSelectRow }) => {
  const tableHeaderStyle: React.CSSProperties = useMemo(
    () => ({
      textAlign: "left",
      padding: "10px 12px",
      fontSize: 12,
      color: "#444",
      background: "#fafafa",
      borderBottom: "1px solid #eee",
      position: "sticky",
      top: 0,
      zIndex: 1,
      whiteSpace: "nowrap",
    }),
    [],
  );

  const cellStyle: React.CSSProperties = useMemo(
    () => ({
      padding: "10px 12px",
      borderBottom: "1px solid #f2f2f2",
      verticalAlign: "top",
      fontSize: 12,
      color: "#222",
    }),
    [],
  );

  const mono: React.CSSProperties = useMemo(
    () => ({
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    }),
    [],
  );

  function statusColor(s: PskuGovernanceStatus): string {
    if (s === "BOUND") return "#2b6";
    if (s === "UNBOUND") return "#c33";
    return "#c60";
  }

  return (
    <div style={{ overflow: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ ...tableHeaderStyle, width: 240 }}>标题（sku_name）</th>
            <th style={{ ...tableHeaderStyle, width: 80 }}>平台</th>
            <th style={{ ...tableHeaderStyle, width: 160 }}>店铺</th>
            <th style={{ ...tableHeaderStyle, width: 220 }}>platform_sku_id</th>
            <th style={{ ...tableHeaderStyle, width: 160 }}>规格（spec）</th>
            <th style={{ ...tableHeaderStyle, width: 180 }}>状态 / 行动</th>
            <th style={{ ...tableHeaderStyle, width: 260 }}>当前绑定（FSKU）</th>
            <th style={{ ...tableHeaderStyle, width: 80 }}>Mirror</th>
            <th style={{ ...tableHeaderStyle, width: 90 }}>binding_id</th>
            <th style={{ ...tableHeaderStyle, width: 100 }}>components</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r) => {
            const key = `${r.platform}::${r.store_id}::${r.platform_sku_id}`;
            const isActive =
              selectedRow?.platform === r.platform &&
              selectedRow?.store_id === r.store_id &&
              selectedRow?.platform_sku_id === r.platform_sku_id;

            const title = r.sku_name ?? "（无商品名）";
            const spec = r.spec ?? "—";
            const requiredText = r.action_hint.required.length ? `（required: ${r.action_hint.required.join(",")}）` : "";
            const bindingText = r.fsku_id ? `${r.fsku_code ?? "—"}｜${r.fsku_name ?? "—"}（${r.fsku_status ?? "—"}）` : "未绑定";
            const storeText = `${r.store_name ?? ""}`.trim() ? `${r.store_name}（${r.store_id}）` : `store_id=${r.store_id}`;
            const suggest = r.bind_ctx?.suggest_q ? `建议检索：${r.bind_ctx.suggest_q}` : "";

            return (
              <tr
                key={key}
                onClick={() => onSelectRow(r)}
                style={{
                  cursor: "pointer",
                  background: isActive ? "#f7f9ff" : "white",
                }}
                title={suggest}
              >
                <td style={cellStyle}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{title}</div>
                  {r.bind_ctx?.suggest_q ? <div style={{ marginTop: 4, color: "#666" }}>{r.bind_ctx.suggest_q}</div> : null}
                </td>

                <td style={cellStyle}>
                  <span style={{ color: "#666" }}>{r.platform}</span>
                </td>

                <td style={cellStyle}>
                  <div style={{ color: "#222" }}>{storeText}</div>
                </td>

                <td style={cellStyle}>
                  <span style={{ ...mono, color: "#222" }}>{r.platform_sku_id}</span>
                </td>

                <td style={cellStyle}>
                  <span style={{ color: "#222" }}>{spec}</span>
                </td>

                <td style={cellStyle}>
                  <div style={{ color: statusColor(r.governance.status), fontWeight: 600 }}>{r.governance.status}</div>
                  <div style={{ color: "#666", marginTop: 4 }}>
                    {r.action_hint.action}
                    {requiredText}
                  </div>
                </td>

                <td style={cellStyle}>
                  <span style={{ color: r.fsku_id ? "#2b6" : "#c33", fontWeight: 600 }}>{bindingText}</span>
                </td>

                <td style={cellStyle}>
                  <span style={{ color: "#666" }}>{r.mirror_freshness}</span>
                </td>

                <td style={cellStyle}>
                  <span style={{ ...mono, color: "#666" }}>{r.binding_id ?? "—"}</span>
                </td>

                <td style={cellStyle}>
                  <span style={{ ...mono, color: "#666" }}>{r.component_item_ids.length}</span>
                </td>
              </tr>
            );
          })}

          {!loading && rows.length === 0 ? (
            <tr>
              <td style={{ ...cellStyle, color: "#666" }} colSpan={10}>
                没有数据
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
};
