import React from "react";

type Props = {
  summaryText: string;
  onReloadList: () => void;
  onReloadCurrent: () => void;
  onSubmit: () => void;
  reloadCurrentDisabled?: boolean;
  title?: string;
  reloadListLabel?: string;
  reloadCurrentLabel?: string;
  submitLabel?: string;
  showReloadList?: boolean;
  submitDisabled?: boolean;
};

const OutboundSubmitActions: React.FC<Props> = ({
  summaryText,
  onReloadList,
  onReloadCurrent,
  onSubmit,
  reloadCurrentDisabled = false,
  title,
  reloadListLabel = "刷新列表",
  reloadCurrentLabel = "刷新当前",
  submitLabel = "提交出库",
  showReloadList = true,
  submitDisabled = false,
}) => {
  return (
    <div className="space-y-2">
      {title ? (
        <div className="text-sm font-semibold text-slate-900">{title}</div>
      ) : null}

      <div className="text-sm text-slate-600">{summaryText}</div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-3">
          {showReloadList ? (
            <button
              type="button"
              className="rounded-md border border-slate-300 px-3 py-2 text-xs hover:bg-slate-50"
              onClick={onReloadList}
            >
              {reloadListLabel}
            </button>
          ) : null}

          <button
            type="button"
            className="rounded-md border border-slate-300 px-3 py-2 text-xs hover:bg-slate-50 disabled:opacity-60"
            onClick={onReloadCurrent}
            disabled={reloadCurrentDisabled}
          >
            {reloadCurrentLabel}
          </button>
        </div>

        <button
          type="button"
          className="ml-auto rounded-md bg-slate-900 px-3 py-2 text-xs text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={onSubmit}
          disabled={submitDisabled}
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
};

export default OutboundSubmitActions;
