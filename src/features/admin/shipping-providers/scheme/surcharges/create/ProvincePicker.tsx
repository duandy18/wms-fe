// src/features/admin/shipping-providers/scheme/surcharges/create/ProvincePicker.tsx
//
// 省份勾选器：复用现有 RegionSelector（已经很成熟）
// - 不允许手写文本
// - 只负责“选择省”，不掺杂金额/规则

import React from "react";
import { RegionSelector } from "../../components/RegionSelector";

export const ProvincePicker: React.FC<{
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  title?: string;
  hint?: string;
}> = ({ value, onChange, disabled, title, hint }) => {
  return <RegionSelector value={value} onChange={onChange} disabled={disabled} title={title} hint={hint} />;
};

export default ProvincePicker;
