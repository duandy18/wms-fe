import React from "react";
import type { ReceivingSubmitOut } from "../contracts/receiving";

type Props = {
  submitError?: string;
  submitSuccess?: string;
  lastSubmit?: ReceivingSubmitOut | null;
};

const ReceivingSubmitFeedback: React.FC<Props> = ({
  submitError = "",
  submitSuccess = "",
  lastSubmit = null,
}) => {
  if (!submitError && !submitSuccess && !lastSubmit) return null;

  return (
    <>
      {submitError ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {submitError}
        </div>
      ) : null}

      {submitSuccess ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {submitSuccess}
        </div>
      ) : null}

      {lastSubmit ? (
        <div className="text-xs text-slate-500">
          最近提交：操作单 #{lastSubmit.id} / 操作时间 {lastSubmit.operated_at}
        </div>
      ) : null}
    </>
  );
};

export default ReceivingSubmitFeedback;
