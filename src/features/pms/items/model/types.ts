// src/features/pms/items/store/types.ts

import type { Item } from "../../../../contracts/item/contract";
import type { ItemListRow } from "../contracts/itemList";

export type EnabledFilter = "all" | "enabled" | "disabled" | "incomplete";

export type ItemsState = {
  /**
   * 完整商品合同：供编辑器、公共选择器等需要 /items 主合同的地方使用。
   */
  items: Item[];

  /**
   * 商品列表页 owner 读模型：只供商品列表表格使用。
   */
  listRows: ItemListRow[];

  loading: boolean;
  error: string | null;

  selectedItem: Item | null;

  filter: EnabledFilter;

  setSelectedItem: (item: Item | null) => void;

  setError: (msg: string | null) => void;
  setFilter: (f: EnabledFilter) => void;

  loadItems: () => Promise<void>;
};

export type ApiErrorShape = {
  message?: string;
};
