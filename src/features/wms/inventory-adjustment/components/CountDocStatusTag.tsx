import React from "react";
import { formatCountDocStatus, type CountDocStatus } from "../contracts/countDoc";

type Props = {
  status: CountDocStatus;
};

function statusClass(status: CountDocStatus): string {
  switch (status) {
    case "DRAFT":
      return "border-slate-200 bg-slate-100 text-slate-700";
    case "FROZEN":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "COUNTED":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "POSTED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "VOIDED":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

const CountDocStatusTag: React.FC<Props> = ({ status }) => {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass(
        status,
      )}`}
    >
      {formatCountDocStatus(status)}
    </span>
  );
};

export default CountDocStatusTag;
