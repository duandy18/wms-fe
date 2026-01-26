// src/features/admin/shipping-providers/pages/edit/schemes/errorText.ts
function asMsg(e: unknown, fallback: string): string {
  return e instanceof Error ? e.message : fallback;
}

function isMethodNotAllowed(msg: string): boolean {
  const s = msg.toLowerCase();
  return s.includes("405") || s.includes("method not allowed");
}

export function toDeleteError(e: unknown): string {
  const msg = asMsg(e, "删除失败");
  if (isMethodNotAllowed(msg)) {
    return "后端暂未开放「删除收费标准」接口（返回 405 Method Not Allowed）。当前可先批量停用，并通过筛选隐藏测试数据；如需清库，请补后端 DELETE /pricing-schemes/{id} 契约后再执行删除。";
  }
  return msg;
}

export function toBatchDeleteError(e: unknown): string {
  const msg = asMsg(e, "批量删除失败");
  if (isMethodNotAllowed(msg)) {
    return "后端暂未开放「删除收费标准」接口（返回 405 Method Not Allowed），因此无法批量删除。建议先批量停用，并通过筛选隐藏测试数据；补后端 DELETE 后再执行清理。";
  }
  return msg;
}
