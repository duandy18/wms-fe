// src/features/operations/inbound/SupplementLink.tsx
// 统一“去补录”入口：打开 /inbound 内的补录抽屉（通过 query 控制）

import React, { useMemo } from "react";
import { Link } from "react-router-dom";

export type SupplementSource = "purchase" | "return" | "misc";

export const SupplementLink: React.FC<{
  source?: SupplementSource;
  className?: string;
  children?: React.ReactNode;
}> = ({ source = "purchase", className, children }) => {
  const to = useMemo(() => {
    const sp = new URLSearchParams();
    sp.set("supplement", "1");
    sp.set("source", source);
    return `/inbound?${sp.toString()}`;
  }, [source]);

  return (
    <Link
      to={to}
      className={
        className ??
        "text-sky-700 hover:text-sky-900 underline underline-offset-2"
      }
    >
      {children ?? "去补录"}
    </Link>
  );
};
