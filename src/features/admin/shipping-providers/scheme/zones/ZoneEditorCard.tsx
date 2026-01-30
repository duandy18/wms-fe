// src/features/admin/shipping-providers/scheme/zones/ZoneEditorCard.tsx

import React, { useEffect, useMemo, useState } from "react";
import type { PricingSchemeZone } from "../../api";
import { RegionSelector } from "../components/RegionSelector";
import { UI } from "../ui";
import { buildProvinceOccupancy } from "./regionRules";
import { buildNameFromProvinces, extractProvinceMembers, getErrorMessage } from "./zonesHelpers";
import type { SegmentTemplateLite } from "./segmentTemplatesApi";
import { ZoneList } from "./ZoneList";

type Props = {
  zones: PricingSchemeZone[];
  disabled: boolean;
  selectedZoneId: number | null;

  // ⚠️ 仍保留这些 props（避免牵连上层签名），但本页不再使用
  templates: SegmentTemplateLite[];
  templatesLoading: boolean;
  templatesErr: string | null;

  onError: (msg: string) => void;
  onSelectZone: (zoneId: number) => void;

  // ✅ 收敛：本页不再“启用/停用”，只把 active 当作“归档开关”使用
  // - onToggle 仍保留签名（避免牵连上层）
  onToggle: (z: PricingSchemeZone) => Promise<void>;

  onCommitCreate: (name: string, provinces: string[], segmentTemplateId: number | null) => Promise<void>;
  onReplaceProvinceMembers: (zoneId: number, provinces: string[]) => Promise<void>;
  onPatchZone: (zoneId: number, payload: { segment_template_id?: number | null }) => Promise<void>;
};

export const ZoneEditorCard: React.FC<Props> = ({
  zones,
  disabled,
  selectedZoneId,
  onError,
  onSelectZone,
  onToggle,
  onCommitCreate,
  onReplaceProvinceMembers,
}) => {
  // ===== 编辑态 =====
  const [editingZoneId, setEditingZoneId] = useState<number | null>(null);

  const editingZone = useMemo(() => {
    if (!editingZoneId) return null;
    return zones.find((z) => z.id === editingZoneId) ?? null;
  }, [zones, editingZoneId]);

  const isEditing = editingZoneId != null;

  // ===== 表单：省份 + 名称 =====
  const [provinces, setProvinces] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [nameTouched, setNameTouched] = useState(false);

  useEffect(() => {
    if (!isEditing) return;

    const ps = extractProvinceMembers(editingZone);
    setProvinces(ps);

    const n = (editingZone?.name ?? "").trim();
    setName(n);
    setNameTouched(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingZoneId]);

  const suggestedName = useMemo(() => buildNameFromProvinces(provinces), [provinces]);

  useEffect(() => {
    if (disabled) return;
    if (isEditing) return;

    const s = suggestedName.trim();
    if (!s) return;

    const cur = name.trim();
    if (!nameTouched || cur === "") {
      setName(s);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestedName, isEditing]);

  const occupancy = useMemo(() => {
    return buildProvinceOccupancy(zones, { editingZoneId });
  }, [zones, editingZoneId]);

  const resetForm = () => {
    setProvinces([]);
    setName("");
    setNameTouched(false);
  };

  const enterEdit = (zoneId: number) => {
    onSelectZone(zoneId);
    setEditingZoneId(zoneId);
  };

  const exitEdit = () => {
    setEditingZoneId(null);
    resetForm();
  };

  const doCommitCreate = async () => {
    const ps = (provinces ?? []).map((x) => (x || "").trim()).filter(Boolean);
    if (ps.length === 0) {
      onError("必须选择省份");
      return;
    }

    const n = name.trim();
    if (!n) {
      onError("名称必填");
      return;
    }

    try {
      // ✅ zones 段不再绑定模板：segmentTemplateId 统一为 null（后端/DB 需允许）
      // ✅ 去掉 confirm 弹窗：成功反馈走页面顶部 SuccessBar（绿条）
      await onCommitCreate(n, ps, null);
      resetForm();
    } catch (e: unknown) {
      onError(getErrorMessage(e, "保存失败"));
    }
  };

  const doSaveEdit = async () => {
    if (!editingZoneId) return;

    const ps = (provinces ?? []).map((x) => (x || "").trim()).filter(Boolean);
    if (ps.length === 0) {
      onError("必须选择省份");
      return;
    }

    try {
      // ✅ 去掉 confirm 弹窗：成功反馈走页面顶部 SuccessBar（绿条）
      await onReplaceProvinceMembers(editingZoneId, ps);
      exitEdit();
    } catch (e: unknown) {
      onError(getErrorMessage(e, "保存失败"));
    }
  };

  const pageDisabled = !!disabled;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className={UI.zoneSectionTitle}>{isEditing ? "编辑区域省份" : "新增区域"}</div>

          {isEditing ? (
            <div className={UI.zonePageHint}>
              当前编辑： <span className="font-mono">{editingZone ? editingZone.name : `zone_id=${editingZoneId}`}</span>
            </div>
          ) : null}
        </div>

        <div className="mt-4">
          <RegionSelector
            value={provinces}
            onChange={setProvinces}
            disabled={pageDisabled}
            title={isEditing ? "省份（可增删）" : "选择省份（必选）"}
            hint=""
            blockedReasonByProvince={occupancy.reasonByProvince}
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="flex flex-col md:col-span-2">
            <label className={UI.zoneLabel}>名称 *</label>
            <input
              className={UI.zoneInput}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameTouched(true);
              }}
              disabled={pageDisabled || isEditing}
              placeholder="如：海南省、青海省 / 北京市、天津市、河北省"
            />
          </div>

          <div className="flex items-end gap-2">
            {isEditing ? (
              <>
                <button type="button" disabled={pageDisabled} className={UI.btnNeutral} onClick={exitEdit}>
                  取消
                </button>
                <button type="button" disabled={pageDisabled} className={UI.zoneCommitBtn} onClick={() => void doSaveEdit()}>
                  保存修改
                </button>
              </>
            ) : (
              <button type="button" disabled={pageDisabled} className={UI.zoneCommitBtn} onClick={() => void doCommitCreate()}>
                新增区域
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 text-xs text-slate-600">
          说明：本页只维护区域（省份归属、编辑）。区域绑定重量段与录价在【二维价格表工作台】中完成。
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <div className={UI.zoneSectionTitle}>区域分类列表</div>
          <div className={UI.zonePageHint}>{isEditing ? "编辑中" : selectedZoneId ? "已选择一个区域" : "未选择"}</div>
        </div>

        <div className="mt-3">
          <ZoneList
            zones={zones}
            selectedZoneId={selectedZoneId}
            disabled={pageDisabled}
            onSelectZone={onSelectZone}
            onToggleZone={onToggle}
            onEditZone={enterEdit}
          />
        </div>
      </div>
    </div>
  );
};

export default ZoneEditorCard;
