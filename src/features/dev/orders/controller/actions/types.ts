// src/features/dev/orders/controller/actions/types.ts

export type LinesPayload = { item_id: number; qty: number }[];

export type RmaFromOrderPayload = {
  warehouse_id: number;
  lines: {
    item_id: number;
    qty: number;
    item_name?: string | null;
    batch_code?: string | null;
  }[];
};
