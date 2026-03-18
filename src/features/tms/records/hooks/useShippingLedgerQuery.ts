// src/features/tms/records/hooks/useShippingLedgerQuery.ts

import { useState } from "react";
import type { ShippingLedgerQuery } from "../types";

const DEFAULT_QUERY: ShippingLedgerQuery = {
  from_date: "",
  to_date: "",
  order_ref: "",
  tracking_no: "",
  carrier_code: "",
  province: "",
  city: "",
  warehouse_id: undefined,
  limit: 50,
  offset: 0,
};

export function useShippingLedgerQuery() {
  const [query, setQuery] = useState<ShippingLedgerQuery>(DEFAULT_QUERY);

  function setField<K extends keyof ShippingLedgerQuery>(
    key: K,
    value: ShippingLedgerQuery[K],
  ): void {
    setQuery((prev) => {
      const next = { ...prev, [key]: value };

      if (key !== "limit" && key !== "offset") {
        next.offset = 0;
      }

      if (key === "limit") {
        next.offset = 0;
      }

      return next;
    });
  }

  function reset(): void {
    setQuery(DEFAULT_QUERY);
  }

  function setOffset(offset: number): void {
    setQuery((prev) => ({
      ...prev,
      offset: Math.max(0, offset),
    }));
  }

  return {
    query,
    setField,
    reset,
    setOffset,
  };
}
