// src/features/admin/shipping-providers/scheme/members/MemberRow.tsx

import React from "react";
import type { PricingSchemeZoneMember } from "../../api";
import { confirmDeleteMemberText } from "./memberActions";

export const MemberRow: React.FC<{
  member: PricingSchemeZoneMember;
  disabled?: boolean;
  onDelete: (m: PricingSchemeZoneMember) => Promise<void>;
}> = ({ member, disabled, onDelete }) => {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
      <div className="text-sm text-slate-700 font-mono">
        {member.level} = {member.value}
        <span className="ml-2 text-xs text-slate-400">id={member.id}</span>
      </div>

      <button
        type="button"
        disabled={disabled}
        className="inline-flex items-center rounded-xl border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
        onClick={() => {
          const ok = window.confirm(confirmDeleteMemberText(member.level, member.value));
          if (!ok) return;
          void onDelete(member);
        }}
      >
        删除
      </button>
    </div>
  );
};
