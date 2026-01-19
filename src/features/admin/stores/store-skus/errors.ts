type ApiErr = { message?: string; response?: { status?: number; data?: unknown } };

export function errMsg(e: unknown, fallback: string) {
  const x = e as ApiErr | undefined;
  const data = x?.response?.data;
  const detail =
    data && typeof data === "object" && "detail" in data
      ? (data as { detail?: unknown }).detail
      : undefined;

  return x?.message ?? (typeof detail === "string" ? detail : undefined) ?? fallback;
}

export function isNotImplemented(e: unknown) {
  const x = e as ApiErr | undefined;
  const s = x?.response?.status;
  return s === 404 || s === 405 || s === 501;
}
