import React from "react";

type Props = {
  message: string;
};

const OutboundSubmitFeedback: React.FC<Props> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
      {message}
    </div>
  );
};

export default OutboundSubmitFeedback;
