// src/features/admin/shipping-providers/scheme/zones/ZoneEditorCard.tsx

import React, { useEffect, useMemo, useState } from "react";
import type { PricingSchemeZone } from "../../api";
import { RegionSelector } from "../components/RegionSelector";
import { UI } from "../ui";
import { buildProvinceOccupancy } from "./regionRules";
import { buildNameFromProvinces, extractProvinceMembers, getErrorMessage } from "./zonesHelpers";
import type { SegmentTemplateLite } from "./segmentTemplatesApi";
import SegmentTemplateRadioPicker from "./SegmentTemplateRadioPicker";
import { ZoneList } from "./ZoneList";

type Props = {
  zones: PricingSchemeZone[];
  disabled: boolean;
  selectedZoneId: number | null;

  templates: SegmentTemplateLite[];
  templatesLoading: boolean;
  templatesErr: string | null;

  onError: (msg: string) => void;
  onSelectZone: (zoneId: number) => void;
  onToggle: (z: PricingSchemeZone) => Promise<void>;

  onCommitCreate: (name: string, provinces: string[], segmentTemplateId: number | null) => Promise<void>;
  onReplaceProvinceMembers: (zoneId: number, provinces: string[]) => Promise<void>;
  onPatchZone: (zoneId: number, payload: { segment_template_id?: number | null }) => Promise<void>;
};

export const ZoneEditorCard: React.FC<Props> = ({
  zones,
  disabled,
  selectedZoneId,
  templates,
  templatesLoading,
  templatesErr,
  onError,
  onSelectZone,
  onToggle,
  onCommitCreate,
  onReplaceProvinceMembers,
  onPatchZone,
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

  // ✅ 必选：绑定模板（必须为启用模板 id）
  const [segmentTemplateId, setSegmentTemplateId] = useState<number | null>(null);

  // ✅ “零暗示”：必须用户点过一次才算选择完成
  const [templatePicked, setTemplatePicked] = useState(false);

  useEffect(() => {
    if (!isEditing) return;

    const ps = extractProvinceMembers(editingZone);
    setProvinces(ps);

    const n = (editingZone?.name ?? "").trim();
    setName(n);
    setNameTouched(true);

    // ✅ 回显模板绑定：若历史数据为 null，则要求用户重新选择
    const curTpl = editingZone?.segment_template_id ?? null;
    const okTpl = typeof curTpl === "number" && Number.isFinite(curTpl) ? curTpl : null;

    setSegmentTemplateId(okTpl);
    setTemplatePicked(okTpl != null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingZoneId]);

  useEffect(() => {
    if (isEditing) return;
    setSegmentTemplateId(null);
    setTemplatePicked(false);
  }, [isEditing]);

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
    setSegmentTemplateId(null);
    setTemplatePicked(false);
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

    if (!templatePicked || segmentTemplateId == null) {
      onError("必须选择重量段方案（从启用中的方案中选择一条）");
      return;
    }

    const tplName = templates.find((t) => t.id === segmentTemplateId)?.name ?? `模板#${segmentTemplateId}`;

    const confirmText = `确认新增区域？\n\n名称：${n}\n省份：${ps.join("、")}\n重量段方案：${tplName}\n`;
    const ok = window.confirm(confirmText);
    if (!ok) return;

    try {
      await onCommitCreate(n, ps, segmentTemplateId);
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

    if (!templatePicked || segmentTemplateId == null) {
      onError("必须选择重量段方案（从启用中的方案中选择一条）");
      return;
    }

    const tplName = templates.find((t) => t.id === segmentTemplateId)?.name ?? `模板#${segmentTemplateId}`;

    const confirmText =
      `确认保存修改？\n\n` +
      `区域：${(editingZone?.name ?? `zone#${editingZoneId}`).trim()}\n` +
      `省份：${ps.join("、")}\n` +
      `重量段方案：${tplName}\n`;

    const ok = window.confirm(confirmText);
    if (!ok) return;

    try {
      await onReplaceProvinceMembers(editingZoneId, ps);
      await onPatchZone(editingZoneId, { segment_template_id: segmentTemplateId });
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

        {templatesErr ? <div className={`mt-3 ${UI.error}`}>{templatesErr}</div> : null}

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

        <div className="mt-4">
          <SegmentTemplateRadioPicker
            disabled={pageDisabled || templatesLoading}
            templates={templates}
            value={segmentTemplateId}
            picked={templatePicked}
            onChange={(next) => {
              setSegmentTemplateId(next.id);
              setTemplatePicked(next.picked);
            }}
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
          说明：该页只展示“启用中”的重量段方案。本区域必须显式绑定一个方案，用于后续录价矩阵行结构。
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
