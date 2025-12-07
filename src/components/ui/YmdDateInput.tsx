// src/components/ui/YmdDateInput.tsx
//
// 统一的 YYYY-MM-DD 日期输入框
// - 不使用 <input type="date">，避免浏览器按本地习惯渲染成 MM/DD/YYYY 等
// - 直接用文本 + placeholder="YYYY-MM-DD"
// - 上层自己做格式校验（正则 / 业务逻辑）
//

import React from "react";

type YmdDateInputProps = {
  value?: string;
  onChange: (value: string | undefined) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
};

export const YmdDateInput: React.FC<YmdDateInputProps> = ({
  value,
  onChange,
  className,
  disabled,
  placeholder,
}) => {
  return (
    <input
      type="text"
      inputMode="numeric"
      className={
        className ??
        "border rounded-lg px-3 py-2 text-sm font-mono placeholder:text-slate-400"
      }
      placeholder={placeholder ?? "YYYY-MM-DD"}
      value={value || ""}
      disabled={disabled}
      onChange={(e) => {
        const v = e.target.value.trim();
        onChange(v || undefined);
      }}
    />
  );
};
