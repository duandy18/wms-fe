// src/features/admin/shipping-providers/scheme/members/memberActions.ts

export function explainStrictMatch(): string {
  return "注意：当前命中规则是严格等值匹配（value 必须与订单地址字段一字不差）。建议优先用 province/city/district。";
}

export function confirmDeleteMemberText(level: string, value: string): string {
  return `确定要删除命中条件吗？\n\nlevel=${level}\nvalue=${value}`;
}
