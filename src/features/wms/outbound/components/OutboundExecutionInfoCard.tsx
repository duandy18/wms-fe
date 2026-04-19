import React from "react";

export interface OutboundInfoItem {
  label: string;
  value: string;
}

type Props = {
  title?: string;
  items: OutboundInfoItem[];
};

const OutboundExecutionInfoCard: React.FC<Props> = ({
  title = "单头参考",
  items,
}) => {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="mb-2 text-xs font-semibold tracking-wide text-slate-500">
        {title}
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
        {items.map((item) => (
          <div key={item.label}>
            <div className="text-xs text-slate-500">{item.label}</div>
            <div className="text-sm text-slate-900">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OutboundExecutionInfoCard;
