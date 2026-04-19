import React from "react";

export interface OutboundSourceOption {
  key: string | number;
  value: string;
  label: string;
}

type Props = {
  label: string;
  value: string;
  disabled?: boolean;
  placeholder?: string;
  options: OutboundSourceOption[];
  onChange: (value: string) => void;
};

const OutboundSourceSelect: React.FC<Props> = ({
  label,
  value,
  disabled = false,
  placeholder = "请选择",
  options,
  onChange,
}) => {
  return (
    <div>
      <div className="mb-1 text-xs text-slate-500">{label}</div>
      <select
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={String(option.key)} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default OutboundSourceSelect;
