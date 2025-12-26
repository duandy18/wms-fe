// src/features/admin/items/sku-builder/seq.ts
//
// 序号递增（纯函数）
// - "B01" -> "B02"
// - "B09" -> "B10"
// - "01"  -> "02"
// - 其他不符合规则时，直接返回原值

export function nextSeq(seq: string): string {
  const s = (seq || "").trim();
  if (!s) return "B01";

  // 匹配 [字母前缀][数字部分]
  const m = s.match(/^([A-Za-z]*)(\d+)$/);
  if (!m) return s;

  const prefix = m[1];
  const numStr = m[2];
  const width = numStr.length;

  const n = Number(numStr);
  if (!Number.isFinite(n)) return s;

  const next = (n + 1).toString().padStart(width, "0");
  return `${prefix}${next}`;
}
