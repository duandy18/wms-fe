import React from "react";

type Props = {
  summaryText: string;
  onReloadList: () => void;
  onReloadCurrent: () => void;
  onSubmit: () => void;
  reloadCurrentDisabled?: boolean;
};

const OutboundSubmitActions: React.FC<Props> = ({
  summaryText,
  onReloadList,
  onReloadCurrent,
  onSubmit,
  reloadCurrentDisabled = false,
}) => {
  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-sm font-semibold text-slate-900">提交与反馈</div>
      <div className="text-sm text-slate-600">{summaryText}</div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="rounded-md border border-slate-300 px-3 py-2 text-xs hover:bg-white"
          onClick={onReloadList}
        >
          刷新列表
        </button>
        <button
          type="button"
          className="rounded-md border border-slate-300 px-3 py-2 text-xs hover:bg-white disabled:opacity-60"
          onClick={onReloadCurrent}
          disabled={reloadCurrentDisabled}
        >
          刷新当前
        </button>
        <button
          type="button"
          className="rounded-md bg-slate-900 px-3 py-2 text-xs text-white hover:bg-slate-800"
          onClick={onSubmit}
        >
          提交
        </button>
      </div>
    </div>
  );
};

export default OutboundSubmitActions;
