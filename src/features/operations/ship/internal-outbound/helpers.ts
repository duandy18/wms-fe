// src/features/operations/ship/internal-outbound/helpers.ts

export function extractErrorMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    const eObj = err as { body?: unknown; message?: unknown };
    if (eObj.body && typeof eObj.body === "object" && "detail" in eObj.body) {
      const detail = (eObj.body as { detail?: unknown }).detail;
      if (typeof detail === "string") return detail;
    }
    if (typeof eObj.message === "string") return eObj.message;
  }
  return "操作失败";
}
