import React from "react";

const AnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">统计分析</h1>
        <p className="mt-1 text-sm text-slate-500">
          OMS 统计分析入口。后续将逐步接入解析成功率、异常分布、人工处理量等指标。
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-sm font-medium text-slate-900">建设中</div>
        <div className="mt-2 text-sm text-slate-600">
          当前先建立页面入口，后续按 OMS 分析需求逐步补齐。
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
