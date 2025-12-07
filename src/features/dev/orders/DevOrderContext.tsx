// src/features/dev/orders/DevOrderContext.tsx
/* eslint-disable react-refresh/only-export-components */

import React, { createContext, useContext, useMemo, useState } from "react";

export type DevOrderKey = {
  platform: string;
  shopId: string;
  extOrderNo: string;
};

export type DevOrderContextValue = {
  orderKey: DevOrderKey | null;
  setOrderKey: (v: DevOrderKey | null) => void;

  traceId: string | null;
  setTraceId: (v: string | null) => void;
};

const Ctx = createContext<DevOrderContextValue | undefined>(undefined);

export const DevOrderProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [orderKey, setOrderKey] = useState<DevOrderKey | null>(null);
  const [traceId, setTraceId] = useState<string | null>(null);

  const value = useMemo(
    () => ({ orderKey, setOrderKey, traceId, setTraceId }),
    [orderKey, traceId],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export function useDevOrderContext(): DevOrderContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("DevOrderContext 未初始化");
  return v;
}
