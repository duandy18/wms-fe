// src/features/wms/inventory/ledger/components/filters/datalists.tsx
import React from "react";
import type { InventoryLedgerItemOption, WarehouseOut } from "./api";

export const WarehouseDatalist: React.FC<{ id: string; warehouses: WarehouseOut[] }> = ({
  id,
  warehouses,
}) => {
  return (
    <datalist id={id}>
      {warehouses.map((w) => {
        const nm = (w.name ?? w.code ?? "").trim();
        const label = nm ? `${w.id} | ${nm}` : String(w.id);
        return <option key={w.id} value={label} />;
      })}
    </datalist>
  );
};

export const ItemDatalist: React.FC<{ id: string; items: InventoryLedgerItemOption[]; limit?: number }> = ({
  id,
  items,
  limit = 500,
}) => {
  return (
    <datalist id={id}>
      {items.slice(0, limit).map((it) => {
        const nm = (it.name ?? it.sku ?? "").trim();
        const label = nm ? `${it.id} | ${nm}` : String(it.id);
        return <option key={it.id} value={label} />;
      })}
    </datalist>
  );
};
