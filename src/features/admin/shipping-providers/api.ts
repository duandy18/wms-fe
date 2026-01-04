// src/features/admin/shipping-providers/api.ts
//
// 顶层稳定出口（迁移完成后的形态）
// - 外部仍然 import "../api" / "../../api" 不变
// - 内部实现全部走子目录（领域目录）

export * from "./api.types";
export * from "./api/zones";
export * from "./api/brackets";

export * from "./api/providers";
export * from "./api/contacts";
export * from "./api/schemes";
export * from "./api/surcharges";
export * from "./api/copy";
