export type PlatformCode = "pdd" | "taobao" | "jd";

export type MockScenario =
  | "normal"
  | "address_missing"
  | "item_abnormal"
  | "combo"
  | "mixed";

export type NullableString = string | null;

export type JsonRecord = Record<string, unknown>;

export type PageQuery = {
  limit?: number;
  offset?: number;
};
