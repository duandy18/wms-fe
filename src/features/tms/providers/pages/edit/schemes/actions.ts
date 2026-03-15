// src/features/tms/providers/pages/edit/schemes/actions.ts
import type { PricingScheme } from "../../../api/types";
import { createPricingScheme, patchPricingScheme } from "../../../api/schemes";
import { isArchived } from "./types";

export async function createScheme(providerId: number, warehouseId: number, name: string, currency: string) {
  return createPricingScheme(providerId, {
    warehouse_id: warehouseId,
    name,
    currency,
  });
}

/**
 * 旧主线遗留接口：
 * - 历史上前端曾尝试通过 patch { active } 切换方案状态；
 * - 当前后端终态合同已切到 status + publish/clone 语义，
 *   且 PATCH /pricing-schemes/{id} 只允许修改 draft 元数据，不再接受 active 切换。
 *
 * 为避免继续误用旧合同，这里保留导出名，但不再接受参数，也不再向后端发错误请求。
 */
export async function patchActive() {
  throw new Error("当前主线已切到 publish/status 语义：不再支持通过 patchActive 切换方案状态。");
}

// ✅ 改名：仅允许 draft 改元数据；active / archived 需走克隆后编辑
export async function renameScheme(schemeId: number, name: string) {
  return patchPricingScheme(schemeId, { name });
}

/**
 * 当前后端主线未提供可用归档能力：
 * - 没有独立 archive/unarchive 路由；
 * - PATCH 仅允许修改 draft 元数据；
 * - 不能通过 patch archived_at/status 对 active / archived 方案做生命周期切换。
 *
 * 因此这里显式拒绝，避免再把旧 archived_at / active=false 合同发给后端。
 */
export async function archiveScheme() {
  throw new Error("当前后端主线未提供可用归档能力：前端不再发送 archived_at / active=false 的旧合同请求。");
}

export async function unarchiveScheme() {
  throw new Error("当前后端主线未提供可用取消归档能力。");
}

export function assertNotArchivedOrThrow(schemes: PricingScheme[], schemeId: number) {
  const s = schemes.find((x) => x.id === schemeId);
  if (s && isArchived(s)) {
    throw new Error("该收费标准已归档：当前后端主线未提供取消归档能力，不能直接恢复。");
  }
}

// ✅ 旧批量动作退场：保留导出名，仅阻断误调用
export async function batchDeactivate() {
  throw new Error("当前主线已切到 publish/status 语义：旧的批量取消生效动作已退出主线。");
}

export async function batchArchiveInactive() {
  throw new Error("当前后端主线未提供批量归档能力。");
}
