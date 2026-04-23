import React from "react";
import CountDocLinesTable, { type CountDocLineDraft } from "./CountDocLinesTable";
import type { CountDocExecutionDetailOut } from "../contracts/countDoc";

type Props = {
  detail: CountDocExecutionDetailOut | null;
  loading: boolean;
  error: string;
  countedByNameSnapshot: string;
  reviewedByNameSnapshot: string;
  interactionDisabled: boolean;
  draftsByLineId: Record<number, CountDocLineDraft>;
  onChangeDraft: (lineId: number, patch: Partial<CountDocLineDraft>) => void;
  onChangeCountedByNameSnapshot: (value: string) => void;
  onChangeReviewedByNameSnapshot: (value: string) => void;
};

const CountDocInlineDetail: React.FC<Props> = ({
  detail,
  loading,
  error,
  countedByNameSnapshot,
  reviewedByNameSnapshot,
  interactionDisabled,
  draftsByLineId,
  onChangeDraft,
  onChangeCountedByNameSnapshot,
  onChangeReviewedByNameSnapshot,
}) => {
  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
        正在加载当前盘点单…
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
        请先创建并冻结盘点单，或选择一张已有盘点单。
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-3 text-sm font-semibold text-slate-900">责任信息</div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="space-y-1">
            <div className="text-xs text-slate-500">盘点人</div>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={countedByNameSnapshot}
              disabled={interactionDisabled || Boolean(detail.counted_by_name_snapshot)}
              readOnly={Boolean(detail.counted_by_name_snapshot)}
              placeholder="保存盘点录入时填写盘点人"
              onChange={(e) => onChangeCountedByNameSnapshot(e.target.value)}
            />
          </label>

          <label className="space-y-1">
            <div className="text-xs text-slate-500">复核人</div>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={reviewedByNameSnapshot}
              disabled={interactionDisabled || detail.status !== "COUNTED"}
              placeholder="提交盘点结果并过账时填写复核人"
              onChange={(e) => onChangeReviewedByNameSnapshot(e.target.value)}
            />
          </label>
        </div>
      </section>

      <CountDocLinesTable
        lines={detail.lines}
        draftsByLineId={draftsByLineId}
        interactionDisabled={interactionDisabled}
        onChangeDraft={onChangeDraft}
      />
    </div>
  );
};

export default CountDocInlineDetail;
