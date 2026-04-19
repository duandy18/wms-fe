import React from "react";

export type ReceivingReceiptSelectOption = {
  key: React.Key;
  value: string;
  label: React.ReactNode;
};

type Props = {
  label: string;
  value: string;
  disabled?: boolean;
  placeholder: string;
  options: ReceivingReceiptSelectOption[];
  onChange: (next: string) => void;
  className?: string;
};

const ReceivingReceiptSelect: React.FC<Props> = ({
  label,
  value,
  disabled = false,
  placeholder,
  options,
  onChange,
  className,
}) => {
  return (
    <label className={`space-y-1 text-xs text-slate-600 ${className ?? ""}`.trim()}>
      <span>{label}</span>
      <select
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.key} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
};

export default ReceivingReceiptSelect;
