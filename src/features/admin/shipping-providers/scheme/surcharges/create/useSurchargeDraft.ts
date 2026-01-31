// src/features/admin/shipping-providers/scheme/surcharges/create/useSurchargeDraft.ts
//
// 三卡编辑器：省 / 城市 / 清单（金额）
//
// 关键保证：
// - 必须返回：draft/saved、editing、save/edit、collapsed、setCollapsed、amountById、setAmountForId、rowAmountErrors、scopeRows
// - “修改”按钮一定能把 editing=true 且展开
// - ✅ “保存”按钮只负责锁定（editing=false），不自动折叠（折叠仅允许用户手动触发）
// - 第三表金额：保存/修改锁定（tableEditing）
// - 回显：localStorage（防丢） + existingSurcharges（兜底）
// - 现实约束：城市点名省 与 全省收费互斥（保存城市时自动从省 saved/draft 移除同省）

export type { ScopeRow } from "./draft/types";
export { useSurchargeDraft } from "./draft/useSurchargeDraft";
