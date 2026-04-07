// src/shared/runtime/internal/errors.ts
//
// 拆分说明：
// 本文件从 src/shared/runtime/provider.tsx 中拆出错误识别与错误文案提取逻辑，
// 保持 provider 只负责编排，不再内嵌错误结构解析细节。

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function pickErrorDetail(err: unknown): unknown {
  const e = isRecord(err) ? err : {};

  return (
    (isRecord(e["body"])
      ? (e["body"] as Record<string, unknown>)["detail"]
      : undefined) ??
    e["detail"] ??
    (isRecord(e["response"]) &&
    isRecord((e["response"] as Record<string, unknown>)["data"])
      ? (((e["response"] as Record<string, unknown>)[
          "data"
        ] as Record<string, unknown>)["detail"] as unknown)
      : undefined) ??
    e["message"]
  );
}

export function isNotAuthenticatedError(err: unknown): boolean {
  const e = isRecord(err) ? err : {};

  const status =
    (typeof e["status"] === "number" ? e["status"] : undefined) ??
    (typeof e["statusCode"] === "number" ? e["statusCode"] : undefined) ??
    (isRecord(e["response"]) &&
    typeof (e["response"] as Record<string, unknown>)["status"] === "number"
      ? ((e["response"] as Record<string, unknown>)["status"] as number)
      : undefined);

  if (status === 401) return true;

  const detail = pickErrorDetail(err);

  return (
    typeof detail === "string" &&
    detail.toLowerCase().includes("not authenticated")
  );
}

export function extractErrorMessage(
  err: unknown,
  fallback: string,
): string {
  const detail = pickErrorDetail(err);

  return typeof detail === "string" && detail.trim()
    ? detail
    : fallback;
}
