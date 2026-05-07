// src/lib/dateTime.ts
// 前端展示用时间格式化工具。
// 注意：这里只改变页面展示，不改变后端接口、表单提交、筛选条件或数据库时间精度。

export function formatDateTimeMinute(value: string | null | undefined): string {
  if (!value) return "-";

  const normalized = value.replace("T", " ").replace("Z", "");
  const currentYear = String(new Date().getFullYear());

  if (normalized.startsWith(currentYear)) {
    return normalized.slice(5, 16);
  }

  return normalized.slice(0, 16);
}
