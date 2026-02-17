// src/features/operations/inbound/SupplementLink.tsx
// 统一“去补录”入口：滚动定位到 Inbound 页内的补录区域（不跳转、不带 query）

import React, { useCallback } from "react";

export const INBOUND_SUPPLEMENT_ANCHOR_ID = "inbound-supplement";

export const SupplementLink: React.FC<{
  className?: string;
  children?: React.ReactNode;
}> = ({ className, children }) => {
  const onClick = useCallback(() => {
    const el = document.getElementById(INBOUND_SUPPLEMENT_ANCHOR_ID);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      // 轻微闪一下提醒（不依赖任何库）
      el.classList.add("ring-2", "ring-sky-300");
      window.setTimeout(() => {
        el.classList.remove("ring-2", "ring-sky-300");
      }, 900);
    }
  }, []);

  return (
    <button
      type="button"
      onClick={onClick}
      className={className ?? "text-sky-700 hover:text-sky-900 underline underline-offset-2"}
    >
      {children ?? "去补录"}
    </button>
  );
};
