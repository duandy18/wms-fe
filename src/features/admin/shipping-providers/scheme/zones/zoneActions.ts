// src/features/admin/shipping-providers/scheme/zones/zoneActions.ts

export function confirmDeleteZoneText(zoneName: string): string {
  return `确定要删除 Zone「${zoneName}」吗？\n\n提示：如果该 Zone 下已有命中条件（Members）或重量区间（Brackets），数据库可能会拒绝删除（RESTRICT）。建议先“停用”。`;
}

export function explainDeleteZoneError(msg: string): string {
  // 这里不做复杂解析，保持确定性中文提示
  return `删除 Zone 失败：${msg}\n\n常见原因：该 Zone 下存在 Members/Brackets，数据库约束（RESTRICT）拒绝删除。建议先停用，或先清空子项后再删。`;
}
