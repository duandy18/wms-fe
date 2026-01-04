// src/features/admin/shipping-providers/api.ts
//
// 顶层稳定出口（兼容旧 import）
// - 旧调用方依然使用 "../api" / "../../api" 不需要改
// - 内部逐步迁移到子目录实现（brackets 先迁移）

export * from "./api.types";

export * from "./api.providers";
export * from "./api.contacts";
export * from "./api.schemes";
export * from "./api.surcharges";
export * from "./api.copy";
export * from "./api/zones";

// brackets 已迁移到子目录
export * from "./api/brackets";
