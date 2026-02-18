// src/features/operations/inbound/tabs/InboundTabShell.tsx

import React from "react";

export const InboundTabShell: React.FC<{
  left: React.ReactNode;
  right: React.ReactNode;
}> = ({ left, right }) => {
  return (
    <div className="space-y-6">
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
};
