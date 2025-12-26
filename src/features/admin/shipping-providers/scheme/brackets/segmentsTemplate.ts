// src/features/admin/shipping-providers/scheme/brackets/segmentsTemplate.ts
//
// Phase 4.3：segments（重量分段）已迁移为【后端方案主数据】（segments_json）。
//
// 本文件改为“门面导出（barrel）”，将职责拆分到更小的文件：
// - segmentsLocalTemplate.ts    : 仅用于「导入本地模板」迁移工具
// - segmentsCompat.ts           : 仅用于旧代码兼容（loadSegments 返回空）
// - segmentsDefaults.ts         : 系统默认模板（用于“采用默认模板”）
//
// ✅ 目的：降低单文件复杂度 + 语义清晰 + 保持 import 不变

export { readLocalSegmentsForImport, clearLocalSegments } from "./segmentsLocalTemplate";
export { loadSegments } from "./segmentsCompat";
export { getDefaultSegmentsTemplate } from "./segmentsDefaults";
