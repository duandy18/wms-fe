// src/features/operations/inbound/supplement/labels.ts

export function missingLabel(fields: string[]): string[] {
  return fields.map((f) => {
    if (f === "batch_code") return "批次";
    if (f === "production_date") return "生产日期";
    if (f === "expiry_date") return "到期日期";
    return "其他";
  });
}
