// src/features/tms/pricingTemplates/workbench/PricingWorkbenchPanel.tsx
//
// 分拆说明：
// - 本文件是“运价工作台页面壳”，由原先单文件大组件继续收口而来。
// - 当前只负责：
//   1) 挂接 usePricingWorkbench
//   2) 拉取省份选项
//   3) 组装顶层派生数据
//   4) 按顺序编排四张卡（重量段 / 区域范围 / 价格矩阵 / 附加费）
// - 当前不负责：
//   1) 单元格价格编辑细节
//   2) 各卡内部表单布局
//   3) 各子域保存逻辑
// - 协作关系：
//   - ./cards/RangesCard
//   - ./cards/GroupsCard
//   - ./cards/MatrixCard
//   - ./cards/SurchargesCard
//   - ./cards/CellEditor
// - 维护约束：
//   - 后续不要再把大段 JSX、卡片内部交互、局部编辑器逻辑塞回本文件。
//   - 第五张卡“算价与解释”继续复用页面外层 ExplainSection，不在本文件扩张。
//   - 省份选项拉取 effect 严禁依赖整个 wb 对象，避免因对象引用变化导致重复拉取与页面抖动。
//   - 区域范围卡当前仍采用“单一省份面板 + 当前编辑行”模式，避免每新增一行就重复整套省份网格。
//   - 当前终态：区域范围按“逐行保存”收口，不再提供整卡统一保存。

import React from "react";
import type { GeoItem } from "../../providers/api/geo";
import { fetchGeoProvinces } from "../../providers/api/geo";
import type { PricingTemplateDetail } from "../types";
import { UI } from "./ui";
import { deriveMatrixColumns, deriveMatrixRows } from "./domain/derived";
import type { GroupRow } from "./domain/types";
import { usePricingWorkbench } from "./usePricingWorkbench";
import CellEditor from "./cards/CellEditor";
import GroupsCard from "./cards/GroupsCard";
import MatrixCard from "./cards/MatrixCard";
import RangesCard from "./cards/RangesCard";
import SurchargesCard from "./cards/SurchargesCard";

type Props = {
  detail: PricingTemplateDetail;
  disabled: boolean;
  onError: (msg: string) => void;
};

function isPersistedGroup(row: GroupRow): boolean {
  return !row.isDeleted && typeof row.id === "number" && !row.isNew;
}

export const PricingWorkbenchPanel: React.FC<Props> = ({ detail, disabled, onError }) => {
  const wb = usePricingWorkbench({ detail, disabled });

  const [provinceOptions, setProvinceOptions] = React.useState<GeoItem[]>([]);
  const [provinceError, setProvinceError] = React.useState<string | null>(null);
  const [activeGroupClientId, setActiveGroupClientId] = React.useState<string | null>(null);

  const [suppressAutoPick, setSuppressAutoPick] = React.useState(false);

  const {
    loadError,
    rangesFeedback,
    groupsFeedback,
    matrixFeedback,
    provinceSurchargeFeedback,
    citySurchargeFeedbackByClientId,
    surcharges,
    provinceDrafts,
    savingSurcharges,
    derived,
    moduleState,
    loadAll,
    addRange,
    saveRanges,
    updateRangeField,
    removeRange,
    provinceLoading,
    setProvinceLoading,
    addGroup,
    saveGroupRow,
    removeGroup,
    setGroupMembers,
    saveCells,
    updateCellMode,
    toggleCellActive,
    updateCellField,
    addProvinceDraft,
    updateProvinceDraft,
    removeProvinceDraft,
    clearProvinceDrafts,
    createCitySurchargeGroup,
    updateSurchargeRow,
    removeSurchargeRow,
    addCityToSurchargeRow,
    updateSurchargeCity,
    removeSurchargeCity,
    saveProvinceWorkspace,
    saveCityRow,
  } = wb;

  React.useEffect(() => {
    if (loadError) onError(loadError);
  }, [loadError, onError]);

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      setProvinceLoading(true);
      setProvinceError(null);
      try {
        const rows = await fetchGeoProvinces();
        if (cancelled) return;
        setProvinceOptions(rows);
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : "加载省份列表失败";
        setProvinceError(msg);
        onError(msg);
      } finally {
        if (!cancelled) setProvinceLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [onError, setProvinceLoading]);

  const aliveGroups = React.useMemo(
    () => moduleState.groups.filter((g) => !g.isDeleted),
    [moduleState.groups],
  );

  React.useEffect(() => {
    if (aliveGroups.length === 0) {
      setActiveGroupClientId(null);
      return;
    }

    if (activeGroupClientId && !aliveGroups.some((g) => g.clientId === activeGroupClientId)) {
      setActiveGroupClientId(null);
      return;
    }

    if (!activeGroupClientId && !suppressAutoPick) {
      setActiveGroupClientId(aliveGroups[0]?.clientId ?? null);
    }
  }, [activeGroupClientId, aliveGroups, suppressAutoPick]);

  const columns = React.useMemo(() => deriveMatrixColumns(moduleState.ranges), [moduleState.ranges]);

  const rows = React.useMemo(
    () =>
      deriveMatrixRows({
        groups: moduleState.groups,
        columns,
        cellMap: moduleState.cells,
      }),
    [columns, moduleState.cells, moduleState.groups],
  );

  const provinceNameByCode = React.useMemo(() => {
    const out = new Map<string, string>();
    provinceOptions.forEach((p) => {
      out.set(String(p.code ?? ""), String(p.name ?? ""));
    });
    return out;
  }, [provinceOptions]);

  const provinceOrder = React.useMemo(() => {
    const out = new Map<string, number>();
    provinceOptions.forEach((p, idx) => {
      out.set(String(p.code ?? ""), idx);
    });
    return out;
  }, [provinceOptions]);

  const provinceOwnerMap = React.useMemo(() => {
    const out = new Map<string, string>();

    moduleState.groups
      .filter(isPersistedGroup)
      .forEach((g) => {
        g.members.forEach((p) => {
          const code = p.provinceCode.trim();
          if (!code) return;
          if (!out.has(code)) {
            out.set(code, g.clientId);
          }
        });
      });

    return out;
  }, [moduleState.groups]);

  const handleSaveGroupRow = React.useCallback(
    async (clientId: string) => {
      const saved = await saveGroupRow(clientId);
      if (saved) {
        setSuppressAutoPick(false);
        setActiveGroupClientId(null);
      }
      return saved;
    },
    [saveGroupRow],
  );

  const cityErrorByClientId = React.useMemo(() => {
    const out: Record<string, string | null> = {};
    surcharges.forEach((row) => {
      out[row.clientId] = citySurchargeFeedbackByClientId[row.clientId]?.error ?? null;
    });
    return out;
  }, [citySurchargeFeedbackByClientId, surcharges]);

  const generalError = loadError;

  return (
    <div className="space-y-4">
      <div className={`${UI.cardTight} [overflow-anchor:none]`}>
        <div className={UI.headerRow}>
          <div>
            <div className={UI.panelTitle}>运价编辑工作台</div>
            <div className={UI.panelHint}>
              四卡顺序：重量段 → 区域范围 → 价格矩阵 → 附加费。算价与解释作为第 5 张卡由页面下方单独承接。
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className={UI.btnNeutralSm}
              onClick={() => void loadAll()}
              disabled={disabled || moduleState.loading}
            >
              刷新
            </button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            重量段：
            <span className="ml-1 font-semibold">
              {moduleState.ranges.filter((r) => !r.isDeleted).length}
            </span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            区域行：
            <span className="ml-1 font-semibold">
              {moduleState.groups.filter((g) => !g.isDeleted).length}
            </span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            矩阵：
            <span className="ml-1 font-semibold">
              {derived.actualCellCount} / {derived.expectedCellCount}
            </span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            发布状态：{" "}
            <span className={derived.canPublish ? "font-semibold text-emerald-700" : "font-semibold text-amber-700"}>
              {derived.canPublish ? "可发布" : "暂不可发布"}
            </span>
          </div>
        </div>

        {provinceError ? (
          <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">
            {provinceError}
          </div>
        ) : null}

        {generalError ? (
          <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">
            {generalError}
          </div>
        ) : null}

        {derived.blockers.length > 0 ? (
          <div className="mt-3 space-y-2">
            {derived.blockers.map((x) => (
              <div key={x.code} className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">
                {x.message}
              </div>
            ))}
          </div>
        ) : null}

        {derived.warnings.length > 0 ? (
          <div className="mt-3 space-y-2">
            {derived.warnings.map((x) => (
              <div key={x.code} className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                {x.message}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <RangesCard
        disabled={disabled}
        moduleState={moduleState}
        errorMessage={rangesFeedback.error}
        successMessage={rangesFeedback.success}
        onAddRange={() => addRange()}
        onSaveRanges={saveRanges}
        onUpdateRangeField={(clientId, field, value) =>
          updateRangeField(clientId, field, value)
        }
        onRemoveRange={(clientId) => removeRange(clientId)}
      />

      <GroupsCard
        disabled={disabled}
        moduleState={moduleState}
        errorMessage={groupsFeedback.error}
        successMessage={groupsFeedback.success}
        activeGroupClientId={activeGroupClientId}
        provinceOptions={provinceOptions}
        provinceLoading={provinceLoading}
        provinceNameByCode={provinceNameByCode}
        provinceOrder={provinceOrder}
        provinceOwnerMap={provinceOwnerMap}
        onSetActiveGroup={(clientId) => {
          setSuppressAutoPick(false);
          setActiveGroupClientId(clientId);
        }}
        onAddGroup={() => {
          setSuppressAutoPick(false);
          const nextClientId = addGroup();
          setActiveGroupClientId(nextClientId);
        }}
        onSaveGroupRow={handleSaveGroupRow}
        onRemoveGroup={(clientId) => {
          const nextGroups = aliveGroups.filter((g) => g.clientId !== clientId);
          if (activeGroupClientId === clientId) {
            setActiveGroupClientId(nextGroups[0]?.clientId ?? null);
          }
          void removeGroup(clientId);
        }}
        onSetGroupMembers={(clientId, members) =>
          setGroupMembers(clientId, members)
        }
      />

      <MatrixCard
        disabled={disabled}
        moduleState={moduleState}
        errorMessage={matrixFeedback.error}
        successMessage={matrixFeedback.success}
        rows={rows}
        columns={columns}
        canEdit={derived.canEditMatrix}
        onSaveCells={saveCells}
        renderCell={(cell) => (
          <CellEditor
            cell={cell}
            disabled={disabled || moduleState.savingCells}
            onUpdateMode={(mode) => updateCellMode(cell.groupId, cell.moduleRangeId, mode)}
            onToggleActive={() => toggleCellActive(cell.groupId, cell.moduleRangeId)}
            onUpdateField={(field, value) =>
              updateCellField(cell.groupId, cell.moduleRangeId, field, value)
            }
          />
        )}
      />

      <SurchargesCard
        disabled={disabled}
        saving={savingSurcharges}
        rows={surcharges}
        provinceOptions={provinceOptions}
        provinceDrafts={provinceDrafts}
        provinceErrorMessage={provinceSurchargeFeedback.error}
        cityErrorByClientId={cityErrorByClientId}
        onAddProvinceDraft={addProvinceDraft}
        onUpdateProvinceDraft={updateProvinceDraft}
        onRemoveProvinceDraft={removeProvinceDraft}
        onClearProvinceDrafts={clearProvinceDrafts}
        onSaveProvinceWorkspace={saveProvinceWorkspace}
        onCreateCityGroup={createCitySurchargeGroup}
        onSaveCityRow={saveCityRow}
        onUpdateRow={(clientId, patch) => updateSurchargeRow(clientId, patch)}
        onRemoveRow={(clientId) => removeSurchargeRow(clientId)}
        onAddCityToRow={(clientId) => addCityToSurchargeRow(clientId)}
        onUpdateCity={(clientId, cityClientId, patch) =>
          updateSurchargeCity(clientId, cityClientId, patch)
        }
        onRemoveCity={(clientId, cityClientId) =>
          removeSurchargeCity(clientId, cityClientId)
        }
      />
    </div>
  );
};

export default PricingWorkbenchPanel;
