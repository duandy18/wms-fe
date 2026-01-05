// src/features/operations/inbound/ReceiveSupplementPage.tsx
// 收货补录（独立页：保留用于直达/调试；主入口在 /inbound 抽屉）
// 说明：仍然不接业务

import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ReceiveSupplementPanel, type SupplementSourceType } from "./ReceiveSupplementPanel";

function normalizeSourceParam(v: string | null): SupplementSourceType | null {
  if (!v) return null;
  const x = v.trim().toLowerCase();
  if (x === "purchase") return "PURCHASE";
  if (x === "return") return "RETURN";
  if (x === "misc") return "MISC";
  return null;
}

export const ReceiveSupplementPage: React.FC = () => {
  const [sp] = useSearchParams();
  const [initialSourceType, setInitialSourceType] = useState<SupplementSourceType>("PURCHASE");

  useEffect(() => {
    const q = normalizeSourceParam(sp.get("source"));
    if (q) setInitialSourceType(q);
  }, [sp]);

  return <ReceiveSupplementPanel initialSourceType={initialSourceType} showTitle compact={false} />;
};
