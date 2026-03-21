// src/features/tms/pricingTemplates/workbench/flow/sections/ExplainSection.tsx

import React from "react";
import FlowSectionCard from "../FlowSectionCard";
import QuoteExplainCard from "../../explain/QuoteExplainCard";

type Props = {
  templateId: number;
  disabled: boolean;
  onError: (msg: string) => void;
};

const ExplainSection: React.FC<Props> = ({
  templateId,
  disabled,
  onError,
}) => {
  return (
    <FlowSectionCard
      title="算价解释"
      hint="这里用于试算与解释当前已保存版本的运价结果，不参与未保存草稿推导。"
    >
      <QuoteExplainCard
        templateId={templateId}
        disabled={disabled}
        onError={onError}
      />
    </FlowSectionCard>
  );
};

export default ExplainSection;
