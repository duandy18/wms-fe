// src/features/dev/orders/DevOrderScenariosPanel.tsx
// 调试场景面板（优化版）
// =====================================================
// 特点：
// - 每个调试场景使用独立卡片，信息更清晰
// - 禁用逻辑突出显示
// - 与 Flow 分区结构保持一致
// - 适合未来扩展更多场景
// =====================================================

import React from "react";
import type { DevOrderInfo, DevOrderItemFact } from "./api";
import type { ScenarioType } from "./DevOrdersPanel";

type Props = {
  order: DevOrderInfo | null;
  orderFacts: DevOrderItemFact[] | null;
  isBusy: boolean;
  forbidScenarios: boolean;
  onRunScenario: (scenario: ScenarioType) => void;
};

// 小组件：单一场景卡片
const ScenarioCard: React.FC<{
  title: string;
  desc: string;
  color: string;
  onClick: () => void;
  disabled: boolean;
}> = ({ title, desc, color, onClick, disabled }) => {
  return (
    <div
      className="rounded-md border border-slate-200 bg-white p-3 shadow-sm flex flex-col gap-2 w-full md:w-[48%]"
      style={{ opacity: disabled ? 0.6 : 1 }}
    >
      <div className="flex flex-col">
        <span className="font-semibold text-slate-900 text-sm">{title}</span>
        <span className="text-[11px] text-slate-500 mt-0.5">{desc}</span>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={
          "mt-auto inline-flex items-center rounded-md px-3 py-1.5 text-[11px] font-medium text-white disabled:opacity-50 " +
          color
        }
      >
        执行场景
      </button>
    </div>
  );
};

export const DevOrderScenariosPanel: React.FC<Props> = ({
  order,
  orderFacts,
  isBusy,
  forbidScenarios,
  onRunScenario,
}) => {
  const hasFacts = !!orderFacts && orderFacts.length > 0;

  // 禁用场景的原因
  const disabledReason: string | null = !order
    ? "请先查询并加载一笔订单"
    : !hasFacts
    ? "该订单没有行事实，无法执行调试场景"
    : forbidScenarios
    ? "生命周期健康度为 BAD，禁止执行调试场景"
    : null;

  const disableAll = isBusy || Boolean(disabledReason);

  return (
    <div className="space-y-4">
      {/* 顶部说明 */}
      <div className="flex flex-col gap-1">
        <div className="text-sm font-semibold text-slate-900">调试场景（Scenarios）</div>
        <div className="text-[11px] text-slate-500">
          用于验证复杂链路、极端场景、异常流程等。仅限 Dev 环境使用。
        </div>
        {order && (
          <div className="text-[11px] text-slate-500">
            当前订单：
            <span className="font-mono ml-1">
              {order.platform}/{order.shop_id}/{order.ext_order_no}
            </span>
          </div>
        )}
      </div>

      {/* 禁用提示 */}
      {disabledReason && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
          ⚠ {disabledReason}
        </div>
      )}

      {/* 场景卡片列表 */}
      <div className="flex flex-wrap gap-4">
        <ScenarioCard
          title="正常履约（完整链路）"
          desc="按真实流程执行 reserve → pick → ship，全链路验证最常见路径。"
          color="bg-emerald-600 hover:bg-emerald-500"
          onClick={() => onRunScenario("normal_fullflow")}
          disabled={disableAll}
        />

        <ScenarioCard
          title="拣货不足（Under Pick）"
          desc="预占足量，但拣货只拣一半。用于验证库存异常链路。"
          color="bg-amber-600 hover:bg-amber-500"
          onClick={() => onRunScenario("under_pick")}
          disabled={disableAll}
        />

        <ScenarioCard
          title="超卖模拟（Oversell）"
          desc="预占为下单数量的两倍，用于验证超卖与库存风控相关逻辑。"
          color="bg-rose-600 hover:bg-rose-500"
          onClick={() => onRunScenario("oversell")}
          disabled={disableAll}
        />

        <ScenarioCard
          title="退货链路（RMA Flow）"
          desc="执行完整履约后自动创建退货任务（RMA），验证逆向链路。"
          color="bg-sky-600 hover:bg-sky-500"
          onClick={() => onRunScenario("return_flow")}
          disabled={disableAll}
        />
      </div>

      {/* 使用提示 */}
      <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
        <div className="font-semibold text-slate-800">使用建议</div>
        <ul className="mt-1 list-disc pl-4">
          <li>建议先执行“正常履约”确保链路稳定，再执行异常场景。</li>
          <li>遇到问题时切换到 Flow 页，结合 Trace / Lifecycle / Ledger 分析。</li>
        </ul>
      </div>
    </div>
  );
};
