// src/features/admin/shipping-providers/scheme/members/MemberList.tsx

import React from "react";
import type { PricingSchemeZoneMember } from "../../api";
import { MemberRow } from "./MemberRow";

export const MemberList: React.FC<{
  members: PricingSchemeZoneMember[];
  disabled?: boolean;
  onDelete: (m: PricingSchemeZoneMember) => Promise<void>;
}> = ({ members, disabled, onDelete }) => {
  if (!members.length) {
    return <div className="text-sm text-slate-600">暂无命中条件。建议至少配置 province/city/district 之一。</div>;
  }

  return (
    <div className="space-y-2">
      {members.map((m) => (
        <MemberRow key={m.id} member={m} disabled={disabled} onDelete={onDelete} />
      ))}
    </div>
  );
};
