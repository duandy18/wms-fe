// src/features/admin/shipping-providers/scheme/members/MemberRow.tsx

import React from "react";
import type { PricingSchemeZoneMember } from "../../api";
import { confirmDeleteMemberText, levelLabel } from "./memberActions";
import { UI } from "../ui";

export const MemberRow: React.FC<{
  member: PricingSchemeZoneMember;
  disabled?: boolean;
  onDelete: (m: PricingSchemeZoneMember) => Promise<void>;
}> = ({ member, disabled, onDelete }) => {
  return (
    <div className={UI.memberRowWrap}>
      <div className={UI.memberRowText}>
        {levelLabel(member.level)}：{member.value}
        <span className={UI.memberRowId}>#{member.id}</span>
      </div>

      <button
        type="button"
        disabled={disabled}
        className={UI.btnDangerSm}
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
