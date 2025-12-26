// src/features/admin/shipping-providers/scheme/members/MemberList.tsx

import React from "react";
import type { PricingSchemeZoneMember } from "../../api";
import { MemberRow } from "./MemberRow";
import { UI } from "../ui";

export const MemberList: React.FC<{
  members: PricingSchemeZoneMember[];
  disabled?: boolean;
  onDelete: (m: PricingSchemeZoneMember) => Promise<void>;
}> = ({ members, disabled, onDelete }) => {
  if (!members.length) {
    return <div className={UI.memberEmpty}>暂无命中条件。建议至少配置 省/市/区 之一。</div>;
  }

  return (
    <div className="space-y-2">
      {members.map((m) => (
        <MemberRow key={m.id} member={m} disabled={disabled} onDelete={onDelete} />
      ))}
    </div>
  );
};

export default MemberList;
