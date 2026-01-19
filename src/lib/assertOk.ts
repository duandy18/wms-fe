// src/lib/assertOk.ts
//
// 目的：把后端 { ok, data } 合同做成前端“刚性断言”。
// - ok !== true → 直接 throw
// - data === null/undefined → 直接 throw
// - 可选：断言 data 类型结构（v1 再做）

export type OkEnvelope<T> = {
  ok: boolean;
  data: T;
};

export function assertOk<T>(
  resp: OkEnvelope<T> | null | undefined,
  ctx: string,
): T {
  if (!resp) {
    throw new Error(`后端合同不一致：${ctx} 返回为空`);
  }
  if (resp.ok !== true) {
    // 这里不要吞细节，让上层 api.ts 捕获并显示
    throw new Error(`后端合同不一致：${ctx} ok 必须为 true`);
  }
  if ((resp as { data?: unknown }).data == null) {
    throw new Error(`后端合同不一致：${ctx} data 不能为空`);
  }
  return resp.data;
}
