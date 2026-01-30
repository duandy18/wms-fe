// src/features/admin/shipping-providers/scheme/table/cards/QuoteExplainCard.tsx

import React from "react";
import { QuotePreviewPanel } from "../../preview/QuotePreviewPanel";

export const QuoteExplainCard: React.FC<{
  schemeId: number;
  disabled: boolean;
  onError: (msg: string) => void;
}> = ({ schemeId, disabled, onError }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
      <div>
        <div className="text-base font-semibold text-slate-900">算价与解释</div>
        <div className="mt-1 text-sm text-slate-600">解释链路：地址 → Zone → Bracket → Surcharge → Total</div>
      </div>

      <QuotePreviewPanel schemeId={schemeId} disabled={disabled} onError={onError} />
    </div>
  );
};

export default QuoteExplainCard;
