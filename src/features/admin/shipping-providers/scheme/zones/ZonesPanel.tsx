// src/features/admin/shipping-providers/scheme/zones/ZonesPanel.tsx

import React, { useEffect, useMemo, useState } from "react";
import type { PricingSchemeDetail, PricingSchemeZone } from "../../api";
import { ZoneList } from "./ZoneList";
import { RegionSelector } from "../components/RegionSelector";
import { UI } from "../ui";
import { buildProvinceOccupancy } from "./regionRules";

function buildNameFromProvinces(list: string[]): string {
  const cleaned = (list ?? []).map((x) => (x || "").trim()).filter(Boolean);
  if (cleaned.length === 0) return "";
  return cleaned.join("、");
}

function getErrorMessage(e: unknown, fallback: string): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return fallback;
}

function extractProvinceMembers(z: PricingSchemeZone | null | undefined): string[] {
  if (!z) return [];
  const ms = z.members ?? [];
  return ms
    .filter((m) => (m.level || "").toLowerCase() === "province")
    .map((m) => (m.value || "").trim())
    .filter(Boolean);
}

export const ZonesPanel: React.FC<{
  detail: PricingSchemeDetail;
  disabled?: boolean;
  selectedZoneId: number | null;

  onError: (msg: string) => void;
  onSelectZone: (zoneId: number) => void;

  // ✅ 提交创建（原子接口）：一次性创建 zone + 写入 provinces members
  onCommitCreate: (name: string, provinces: string[]) => Promise<void>;

  onToggle: (z: PricingSchemeZone) => Promise<void>;

  // ✅ 新增：编辑时保存省份集合（后端 PUT /zones/{id}/province-members）
  onReplaceProvinceMembers: (zoneId: number, provinces: string[]) => Promise<void>;

  // 兼容保留：历史上可能有人从外部传入（当前组件不使用）
  onChangeBracketAmount?: (bracketId: number, nextAmountJson: unknown) => Promise<void>;
}> = ({
  detail,
  disabled,
  selectedZoneId,
  onError,
  onSelectZone,
  onCommitCreate,
  onToggle,
  onReplaceProvinceMembers,
}) => {
  // ✅ 固定 zones 引用，避免 useMemo 依赖警告
  const zones = useMemo(() => detail.zones ?? [], [detail.zones]);

  // ===== 编辑态 =====
  const [editingZoneId, setEditingZoneId] = useState<number | null>(null);
  const editingZone = useMemo(() => {
    if (!editingZoneId) return null;
    return zones.find((z) => z.id === editingZoneId) ?? null;
  }, [zones, editingZoneId]);

  const isEditing = editingZoneId != null;

  // ===== 表单：省份 + 名称（新增用；编辑态只改省份，不改名称）=====
  const [provinces, setProvinces] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [nameTouched, setNameTouched] = useState(false);

  // 编辑态：进入时回显省份；退出时清理
  useEffect(() => {
    if (!isEditing) return;
    const ps = extractProvinceMembers(editingZone);
    setProvinces(ps);

    // 编辑态名称不参与保存，但展示回显更安心
    const n = (editingZone?.name ?? "").trim();
    setName(n);
    setNameTouched(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingZoneId]);

  const suggestedName = useMemo(() => buildNameFromProvinces(provinces), [provinces]);

  // 新增态：自动填充名称（编辑态不做自动覆盖）
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

  // ✅ 占用规则：编辑态要放行当前 editingZoneId（避免自锁）
  const occupancy = useMemo(() => {
    return buildProvinceOccupancy(zones, { editingZoneId });
  }, [zones, editingZoneId]);

  const pageDisabled = !!disabled;

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

    const confirmText = `确认新增区域？\n\n名称：${n}\n省份：${ps.join("、")}\n`;
    const ok = window.confirm(confirmText);
    if (!ok) return;

    try {
      await onCommitCreate(n, ps);
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

    const confirmText =
      `确认保存省份修改？\n\n` +
      `区域：${(editingZone?.name ?? `zone#${editingZoneId}`).trim()}\n` +
      `省份：${ps.join("、")}\n`;

    const ok = window.confirm(confirmText);
    if (!ok) return;

    try {
      await onReplaceProvinceMembers(editingZoneId, ps);
      exitEdit();
    } catch (e: unknown) {
      onError(getErrorMessage(e, "保存失败"));
    }
  };

  return (
    <div className="space-y-4">
      {/* ✅ 删除新增区域上方纯标题卡（减负） */}

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

        {/* 新增态：保留名称输入；编辑态：名称只展示不保存（避免引入更多后端 API 依赖） */}
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

        {/* ✅ 列表并入同一卡片（删除第三张卡外壳） */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <div className={UI.zoneSectionTitle}>区域分类列表</div>
            <div className={UI.zonePageHint}>
              {isEditing ? "编辑中" : selectedZoneId ? "已选择一个区域" : "未选择"}
            </div>
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
    </div>
  );
};

export default ZonesPanel;
