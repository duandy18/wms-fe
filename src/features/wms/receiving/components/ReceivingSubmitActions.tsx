import React from "react";

type Props = {
  refreshLabel: string;
  submitLabel: string;
  submitting: boolean;
  onRefresh: () => void;
  onSubmit: () => void;
  refreshDisabled?: boolean;
  submitDisabled?: boolean;
};

const ReceivingSubmitActions: React.FC<Props> = ({
  refreshLabel,
  submitLabel,
  submitting,
  onRefresh,
  onSubmit,
  refreshDisabled = false,
  submitDisabled = false,
}) => {
  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        className="rounded-md border border-slate-300 px-3 py-1 text-xs hover:bg-white"
        disabled={refreshDisabled}
        onClick={onRefresh}
      >
        {refreshLabel}
      </button>
      <button
        type="button"
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-60"
        disabled={submitDisabled}
        onClick={onSubmit}
      >
        {submitting ? "提交中…" : submitLabel}
      </button>
    </div>
  );
};

export default ReceivingSubmitActions;
