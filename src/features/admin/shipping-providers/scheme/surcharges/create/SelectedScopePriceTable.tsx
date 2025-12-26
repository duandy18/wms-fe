// src/features/admin/shipping-providers/scheme/surcharges/create/SelectedScopePriceTable.tsx

import React from "react";
import { UI } from "../../ui";

export type ScopeRow = {
  id: string;
  scope: "province" | "city";
  label: string; // 省：广东省；城市：深圳市（不带省前缀）
};

export const SelectedScopePriceTable: React.FC<{
  title: string;
  rows: ScopeRow[];
  amountById: Record<string, string>;
  onChangeAmount: (id: string, next: string) => void;
  disabled?: boolean;
  amountLabel?: string;
  emptyText?: string;
}> = ({
  title,
  rows,
  amountById,
  onChangeAmount,
  disabled,
  amountLabel = "单票加价（元）",
  emptyText = "暂无已保存的省/城市。请先在第一/第二部分选择后点击“保存”。",
}) => {
  return (
    <div className={UI.surchargeScopeCard}>
      <div className={UI.surchargeScopeHeadRow}>
        <div>
          <div className={UI.surchargeScopeTitle}>{title}</div>
          <div className={UI.surchargeScopeHint}>
            规则：省=全省收费；城市=省内点名收费（该省其他地区不收）。金额只在此表逐行填写。
          </div>
        </div>
        <div className={UI.surchargeScopeMeta}>
          已选：<span className="font-mono">{rows.length}</span>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className={UI.surchargeScopeEmpty}>{emptyText}</div>
      ) : (
        <div className={UI.surchargeScopeTableArea}>
          <table className={UI.surchargeScopeTable}>
            <thead>
              <tr className={UI.surchargeScopeTheadRow}>
                <th className={UI.surchargeScopeThIndex}>序号</th>
                <th className={UI.surchargeScopeThType}>类型</th>
                <th className={UI.surchargeScopeTh}>范围</th>
                <th className={UI.surchargeScopeThAmount}>{amountLabel}</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r, idx) => {
                const pill = r.scope === "province" ? UI.surchargeDestPillProvince : UI.surchargeDestPillCity;
                return (
                  <tr key={r.id} className={UI.surchargeScopeTr}>
                    <td className={UI.surchargeTdIndex}>{idx + 1}</td>

                    <td className={UI.surchargeScopeTd}>
                      <span className={`${UI.surchargeDestPillBase} ${pill}`}>{r.scope === "province" ? "省" : "城市"}</span>
                    </td>

                    <td className={UI.surchargeScopeTdText}>{r.label}</td>

                    <td className={UI.surchargeScopeTd}>
                      <input
                        className={UI.inputMono}
                        value={amountById[r.id] ?? ""}
                        disabled={disabled}
                        onChange={(e) => onChangeAmount(r.id, e.target.value)}
                        placeholder="例如：0.3"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className={UI.surchargeScopeFootHint}>
            金额必须是 <span className="font-mono">&gt;=0</span> 的数字。这里每一行会生成一条附加费记录。
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectedScopePriceTable;
