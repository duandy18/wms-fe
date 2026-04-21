import React from "react";

const InventoryOutboundReversalPage: React.FC = () => {
  return (
    <div className="space-y-6 p-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">出库冲回</h1>
        <p className="text-sm text-slate-600">
          对错误出库事实做反向补回。
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-slate-900">后续承接内容</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>错误出库事实选择。</li>
            <li>补回原因、批次、库存影响确认。</li>
            <li>补回事实结果与台账回显。</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default InventoryOutboundReversalPage;
