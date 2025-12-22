// src/features/admin/shipping-providers/scheme/brackets/IntroCard.tsx

import React from "react";
import { UI } from "../ui";

export const IntroCard: React.FC = () => {
  return (
    <div className={UI.cardTight}>
      <div className={UI.panelTitle}>快递公司报价表录入</div>
      <div className={UI.panelHint}>
        你在这里做的是“逐行补全一张报价表”。选择 Zone 只是切换当前编辑行；底部成果表永远保留所有区域行，并支持单元格就地改价。
      </div>
    </div>
  );
};

export default IntroCard;
