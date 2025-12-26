// src/features/admin/shipping-providers/scheme/members/memberActions.ts

export function explainStrictMatch(): string {
  return "提示：命中规则是严格等值匹配（必须与订单地址字段完全一致）。建议优先使用 省/市/区 三类。";
}

export function confirmDeleteMemberText(level: string, value: string): string {
  return `确定要删除这条命中条件吗？\n\n类型：${levelLabel(level)}\n值：${value}`;
}

export function levelLabel(level: string): string {
  switch (level) {
    case "province":
      return "省";
    case "city":
      return "市";
    case "district":
      return "区/县";
    case "text":
      return "文本";
    default:
      return String(level || "未知");
  }
}

export function normalizeMemberValue(level: string, raw: string): string {
  const v = (raw ?? "").trim();
  if (!v) return "";

  // 不做复杂标准化（避免引入新模型）
  // 仅做最安全的空白清理
  if (level === "text") return v;
  return v.replace(/\s+/g, "");
}
