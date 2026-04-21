import React from "react";

const cards = [
  {
    title: "盘点作业",
    desc: "基于实物复核，对库存差异进行调整。",
    route: "/inventory-adjustment/count",
  },
  {
    title: "入库冲回",
    desc: "对错误入库事实做反向冲回。",
    route: "/inventory-adjustment/inbound-reversal",
  },
  {
    title: "出库冲回",
    desc: "对错误出库事实做反向补回。",
    route: "/inventory-adjustment/outbound-reversal",
  },
  {
    title: "退单入库",
    desc: "选择已出库且仍可退的订单，生成退单入库单并完成回仓执行。",
    route: "/inventory-adjustment/return-inbound",
  },
];

const InventoryAdjustmentSummaryPage: React.FC = () => {
  return (
    <div className="space-y-6 p-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">库存调节汇总</h1>
        <p className="text-sm text-slate-600">
          统一查看盘点、冲回、退单入库等库存调节动作。
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <section
            key={card.title}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-slate-900">{card.title}</h2>
              <p className="text-sm leading-6 text-slate-600">{card.desc}</p>
              <div className="text-xs text-slate-500">阶段一骨架路由：{card.route}</div>
            </div>
          </section>
        ))}
      </div>

      <section className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
        <div className="space-y-2">
          <h2 className="text-base font-semibold text-slate-900">当前阶段</h2>
          <p className="text-sm leading-6 text-slate-600">
            当前页面只负责钉住模块边界、页面边界和文案边界。
            这一阶段不接真实后端接口，不合并旧 receiving 执行组件，不修改扫码状态机和数据库。
          </p>
        </div>
      </section>
    </div>
  );
};

export default InventoryAdjustmentSummaryPage;
