// src/features/admin/shipping-providers/scheme/brackets/useSegmentTemplateWorkbench/actions/renameSelectedTemplate.ts
//
// ⚠️ 暂不支持改名：后端目前没有“改名”契约接口。
// - 为了避免 TS build 因历史文件残留失败，这里保留一个 no-op 工厂函数。
// - 该文件当前不应被 actions/index.ts 引用（也不应出现在 UI 入口）。

import type { WorkbenchActionCtx } from "./types";

export function makeRenameSelectedTemplate(ctx: WorkbenchActionCtx) {
  const { disabled, onError, setErr } = ctx;

  return async function renameSelectedTemplateAction() {
    if (disabled) return;
    const msg = "暂不支持改名（后端未提供改名契约）。";
    setErr(msg);
    onError?.(msg);
  };
}
