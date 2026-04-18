import React from "react";
import {
  formatReceivingSourceType,
  formatReceivingStatus,
  type ReceivingTaskReadOut,
} from "../contracts/receiving";

type Props = {
  task: ReceivingTaskReadOut;
  remainingTotal: string;
};

const ReceivingTaskInfoCard: React.FC<Props> = ({ task, remainingTotal }) => {
  return (
    <section className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-2 xl:grid-cols-4">
      <div>
        <div className="text-xs text-slate-500">收货单号</div>
        <div className="font-mono text-sm text-slate-900">{task.receipt_no}</div>
      </div>
      <div>
        <div className="text-xs text-slate-500">来源</div>
        <div className="text-sm text-slate-900">{formatReceivingSourceType(task.source_type)}</div>
      </div>
      <div>
        <div className="text-xs text-slate-500">来源单号</div>
        <div className="text-sm text-slate-900">{task.source_doc_no_snapshot || "-"}</div>
      </div>
      <div>
        <div className="text-xs text-slate-500">仓库</div>
        <div className="text-sm text-slate-900">
          {task.warehouse_name_snapshot || `仓库 ${task.warehouse_id}`}
        </div>
      </div>
      <div>
        <div className="text-xs text-slate-500">对方</div>
        <div className="text-sm text-slate-900">{task.counterparty_name_snapshot || "-"}</div>
      </div>
      <div>
        <div className="text-xs text-slate-500">状态</div>
        <div className="text-sm text-slate-900">{formatReceivingStatus(task.status)}</div>
      </div>
      <div>
        <div className="text-xs text-slate-500">剩余待收合计</div>
        <div className="font-mono text-sm text-slate-900">{remainingTotal}</div>
      </div>
      <div>
        <div className="text-xs text-slate-500">备注</div>
        <div className="text-sm text-slate-900">{task.remark || "-"}</div>
      </div>
    </section>
  );
};

export default ReceivingTaskInfoCard;
