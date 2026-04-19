import React, { useMemo } from "react";
import type { ReceivingTaskReadOut } from "../contracts/receiving";
import ReceivingReadonlyLinesTable from "./ReceivingReadonlyLinesTable";
import ReceivingTaskInfoCard from "./ReceivingTaskInfoCard";
import { formatQty } from "../utils/fixedRows";

type Props = {
  detail: ReceivingTaskReadOut | null;
  loading: boolean;
  error: string;
};

const ReceivingInlineDetail: React.FC<Props> = ({
  detail,
  loading,
  error,
}) => {
  const remainingTotal = useMemo(() => {
    if (!detail) return "0";
    const total = detail.lines.reduce((sum, line) => {
      const value = Number(line.remaining_qty || "0");
      return sum + (Number.isFinite(value) ? value : 0);
    }, 0);
    return formatQty(total);
  }, [detail]);

  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
        正在加载当前收货情况…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
        {error}
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
        未找到当前收货情况。
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <ReceivingTaskInfoCard task={detail} remainingTotal={remainingTotal} />
      <ReceivingReadonlyLinesTable lines={detail.lines} />
    </div>
  );
};

export default ReceivingInlineDetail;
