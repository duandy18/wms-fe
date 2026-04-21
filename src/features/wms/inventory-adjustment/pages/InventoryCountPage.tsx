import React from "react";

const InventoryCountPage: React.FC = () => {
  return (
    <div className="space-y-6 p-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">盘点作业</h1>
        <p className="text-sm text-slate-600">
          基于实物复核，对库存差异进行调整。
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-slate-900">页面职责</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>承接后续盘点任务列表、差异确认、调账结果展示。</li>
            <li>这里先只保留库存调节模块下的独立页面边界。</li>
            <li>盘点作业已并入库存调节模块，页面路径统一为 /inventory-adjustment/count。</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default InventoryCountPage;
