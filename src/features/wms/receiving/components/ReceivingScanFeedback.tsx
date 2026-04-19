import React from "react";

type Props = {
  scanError?: string;
  scanSuccess?: string;
};

const ReceivingScanFeedback: React.FC<Props> = ({
  scanError = "",
  scanSuccess = "",
}) => {
  if (!scanError && !scanSuccess) return null;

  return (
    <>
      {scanError ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {scanError}
        </div>
      ) : null}

      {scanSuccess ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {scanSuccess}
        </div>
      ) : null}
    </>
  );
};

export default ReceivingScanFeedback;
