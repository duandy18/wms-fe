// src/features/orders/page/types.ts
//
// OrdersPage 拆分：本页过滤器/派生数据类型（无 React）

export type OrdersFilters = {
  platform: string;
  shopId: string;
  status: string;
  timeFrom: string; // YYYY-MM-DD
  timeTo: string; // YYYY-MM-DD
  limit: number;
};
