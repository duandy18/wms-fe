// src/features/admin/shipping-providers/scheme/workbench-page/useWorkbenchActions.ts

import { useMemo } from "react";
import type { PricingSchemeDetail, PricingSchemeSurcharge, PricingSchemeZone } from "../../api";
import { createZoneAtomic, createSurcharge, deleteSurcharge, patchSurcharge, patchZone, replaceZoneProvinceMembers } from "../../api";
import { archiveReleaseZoneProvinces } from "../../api/zones";
import { deleteDestAdjustment, patchDestAdjustment, upsertDestAdjustment } from "../../api/destAdjustments";
import type { DestAdjustmentUpsertPayload } from "../../api/destAdjustments";
import { buildZoneNameFromProvinces } from "./types";

export function useWorkbenchActions(params: {
  wb: {
    detail: PricingSchemeDetail | null;
    selectedZoneId: number | null;
    setSelectedZoneId: (id: number | null) => void;
    mutate: (fn: () => Promise<void>) => Promise<void>;
    setError: (msg: string) => void;
  };
  flashOk: (msg: string) => void;
  goTab: (k: "zones" | "segments") => void;
}) {
  const { wb, flashOk, goTab } = params;

  return useMemo(() => {
    const requireDetail = (): PricingSchemeDetail => {
      if (!wb.detail) throw new Error("缺少方案数据");
      return wb.detail;
    };

    const zones = {
      onToggleZoneArchiveRelease: async (z: PricingSchemeZone) => {
        await wb.mutate(async () => {
          await archiveReleaseZoneProvinces(z.id);
        });
        flashOk("已归档-释放省份");
      },

      onCommitCreateZone: async (name: string, provinces: string[], segmentTemplateId: number | null) => {
        const d = requireDetail();
        await wb.mutate(async () => {
          const z = await createZoneAtomic(d.id, {
            name,
            provinces,
            active: true,
            segment_template_id: segmentTemplateId,
          });
          wb.setSelectedZoneId(z.id);
        });
        flashOk("已创建区域分类");
      },

      onReplaceProvinceMembers: async (zoneId: number, provinces: string[]) => {
        await wb.mutate(async () => {
          await replaceZoneProvinceMembers(zoneId, { provinces });
          const nextName = buildZoneNameFromProvinces(provinces);
          if (nextName) await patchZone(zoneId, { name: nextName });
        });
        flashOk("已保存区域省份");
      },

      onPatchZone: async (zoneId: number, payload: Record<string, unknown>) => {
        await wb.mutate(async () => {
          await patchZone(zoneId, payload as never);
        });
        flashOk("已保存区域设置");
      },

      onPatchZoneTemplate: async (zoneId: number, templateId: number) => {
        await wb.mutate(async () => {
          await patchZone(zoneId, { segment_template_id: templateId });
        });
        flashOk("已绑定重量段模板");
      },

      onUnbindZoneTemplate: async (zoneId: number) => {
        await wb.mutate(async () => {
          await patchZone(zoneId, { segment_template_id: null });
        });
        flashOk("已解除绑定");
      },

      onGoZonesTab: () => goTab("zones"),
      onGoSegmentsTab: () => goTab("segments"),
    };

    const surcharges = {
      onCreate: async (payload: { name: string; condition_json: Record<string, unknown>; amount_json: Record<string, unknown> }) => {
        const d = requireDetail();
        await wb.mutate(async () => {
          await createSurcharge(d.id, {
            name: payload.name,
            active: true,
            condition_json: payload.condition_json,
            amount_json: payload.amount_json,
          });
        });
        flashOk("已创建附加费规则");
      },

      onPatch: async (
        surchargeId: number,
        payload: Partial<{ name: string; condition_json: Record<string, unknown>; amount_json: Record<string, unknown>; active: boolean }>,
      ) => {
        await wb.mutate(async () => {
          await patchSurcharge(surchargeId, payload);
        });
        flashOk("已保存附加费规则");
      },

      onToggle: async (s: PricingSchemeSurcharge) => {
        await wb.mutate(async () => {
          await patchSurcharge(s.id, { active: !s.active });
        });
        flashOk("已更新附加费状态");
      },

      onDelete: async (s: PricingSchemeSurcharge) => {
        await wb.mutate(async () => {
          await deleteSurcharge(s.id);
        });
        flashOk("已删除附加费规则");
      },
    };

    const destAdjustments = {
      onUpsert: async (payload: DestAdjustmentUpsertPayload) => {
        const d = requireDetail();
        await wb.mutate(async () => {
          await upsertDestAdjustment(d.id, payload);
        });
        flashOk("已写入目的地附加费");
      },

      onPatch: async (id: number, payload: Partial<{ active: boolean; amount: number; priority: number }>) => {
        await wb.mutate(async () => {
          await patchDestAdjustment(id, payload);
        });
        flashOk("已更新目的地附加费");
      },

      onDelete: async (id: number) => {
        await wb.mutate(async () => {
          await deleteDestAdjustment(id);
        });
        flashOk("已删除目的地附加费");
      },
    };

    return { zones, surcharges, destAdjustments };
  }, [flashOk, goTab, wb]);
}
