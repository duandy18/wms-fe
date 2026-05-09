// src/domains/pms/export/contracts/itemsQuery.ts

export type FetchItemsBasicParams = {
  /**
   * 供应商约束（采购单创建用）
   * - 约定传给后端 query: supplier_id
   */
  supplierId?: number | null;

  /**
   * 只取启用商品（可选）
   * - 约定传给后端 query: enabled=true
   */
  enabledOnly?: boolean;

  /**
   * 关键词搜索（主数据）
   * - 约定传给后端 query: q
   */
  keyword?: string;

  /**
   * 限制返回条数（可选）
   * - 约定传给后端 query: limit
   */
  limit?: number;
};
