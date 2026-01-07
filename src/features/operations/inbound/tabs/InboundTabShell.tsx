// src/features/operations/inbound/tabs/InboundTabShell.tsx

import React from "react";

export const InboundTabShell: React.FC<{
  left: React.ReactNode;
  right: React.ReactNode;
}> = ({ left, right }) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-6 items-start">
      {left}
      {right}
    </div>
  );
};
