// src/features/operations/inbound/return-receive/ReturnReceiveOrderRefCard.tsx
//
// ⚠️ 兼容保留：历史组件，避免旧 import 直接报错。
// 退货回仓已迁移为“左侧选择 order_ref（台账）→ 创建任务 → 数量录入 → 提交回仓”的独立作业台。
// 本组件不再承载任何输入/创建行为。

import React from "react";
import { InboundUI } from "../ui";

export const ReturnReceiveOrderRefCard: React.FC = () => {
  return (
    <section className={`${InboundUI.card} ${InboundUI.cardPad} ${InboundUI.cardGap}`}>
      <h2 className={InboundUI.title}>退货回仓</h2>
      <div className={InboundUI.quiet}>
        该入口已迁移：请在左侧选择订单（order_ref），右侧创建任务后录入数量并提交回仓。
      </div>
    </section>
  );
};
