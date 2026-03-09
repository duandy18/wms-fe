// src/features/admin/shipping-providers/scheme/workbench/PricingWorkbenchPanel.tsx
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
//   - 区域范围卡当前采用“单一省份面板 + 当前编辑行”模式，避免每新增一行就重复整套省份网格。
//   - 行级“保存本行并继续下一行”只是前端交互收口；底层仍复用 saveGroups 保存当前模块全部区域范围。

import React from "react";
import type { PricingSchemeDetail } from "../../api/types";
import { fetchGeoProvinces, type GeoItem } from "../../api/geo";
import { UI } from "../ui";
import { deriveMatrixColumns, deriveMatrixRows, moduleLabel } from "./domain/derived";
import { usePricingWorkbench } from "./usePricingWorkbench";
import CellEditor from "./cards/CellEditor";
import GroupsCard from "./cards/GroupsCard";
import MatrixCard from "./cards/MatrixCard";
import RangesCard from "./cards/RangesCard";
import SurchargesCard from "./cards/SurchargesCard";

type Props = {
  detail: PricingSchemeDetail;
  disabled: boolean;
  onError: (msg: string) => void;
};

export const PricingWorkbenchPanel: React.FC<Props> = ({ detail, disabled, onError }) => {
  const wb = usePricingWorkbench({ detail, disabled });

  const [provinceOptions, setProvinceOptions] = React.useState<GeoItem[]>([]);
  const [provinceError, setProvinceError] = React.useState<string | null>(null);
  const [activeGroupClientId, setActiveGroupClientId] = React.useState<string | null>(null);

  const {
    error,
    success,
    derived,
    currentModule,
    activeModuleCode,
    setActiveModuleCode,
    loadAll,
    addRange,
    saveRanges,
    updateRangeField,
    removeRange,
    provinceLoading,
    setProvinceLoading,
    addGroup,
    saveGroups,
    removeGroup,
    setGroupProvinces,
    saveCells,
    updateCellMode,
    toggleCellActive,
    updateCellField,
    savingSurcharges,
    surcharges,
    addSurchargeRow,
    saveSurcharges,
    updateSurchargeRow,
    removeSurchargeRow,
  } = wb;

  React.useEffect(() => {
    if (error) onError(error);
  }, [onError, error]);

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

  const moduleState = currentModule;

  const aliveGroups = React.useMemo(
    () => moduleState.groups.filter((g) => !g.isDeleted),
    [moduleState.groups],
  );

  React.useEffect(() => {
    if (aliveGroups.length === 0) {
      setActiveGroupClientId(null);
      return;
    }

    if (!activeGroupClientId || !aliveGroups.some((g) => g.clientId === activeGroupClientId)) {
      setActiveGroupClientId(aliveGroups[0]?.clientId ?? null);
    }
  }, [activeGroupClientId, aliveGroups]);

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
      .filter((g) => !g.isDeleted)
      .forEach((g) => {
        g.provinces.forEach((p) => {
          const code = p.provinceCode.trim();
          if (!code) return;
          if (!out.has(code)) {
            out.set(code, g.clientId);
          }
        });
      });

    return out;
  }, [moduleState.groups]);

  const handleSaveActiveGroupAndNext = React.useCallback(async () => {
    const currentAliveGroups = moduleState.groups.filter((g) => !g.isDeleted);
    if (currentAliveGroups.length === 0) return;

    const currentClientId = activeGroupClientId ?? currentAliveGroups[0]?.clientId ?? null;
    if (!currentClientId) return;

    const currentIndex = currentAliveGroups.findIndex((g) => g.clientId === currentClientId);
    const saved = await saveGroups(activeModuleCode);
    if (!saved) return;

    const nextAliveGroups = currentModule.groups.filter((g) => !g.isDeleted);
    const nextIndex = currentIndex >= 0 ? currentIndex + 1 : 1;

    if (nextIndex < nextAliveGroups.length) {
      setActiveGroupClientId(nextAliveGroups[nextIndex]?.clientId ?? null);
      return;
    }

    addGroup(activeModuleCode);

    // 这里不直接依赖“新增后立刻可见”的同步假设，交给下面 effect 收口：
    // 如果当前 activeGroupClientId 已不存在或为空，会自动切到第一条；
    // 但我们希望新增后优先切到最后一条，所以延迟一个微任务再尝试切换。
    queueMicrotask(() => {
      const latestGroups = currentModule.groups.filter((g) => !g.isDeleted);
      const last = latestGroups[latestGroups.length - 1] ?? null;
      if (last?.clientId) {
        setActiveGroupClientId(last.clientId);
      }
    });
  }, [activeGroupClientId, activeModuleCode, addGroup, currentModule.groups, moduleState.groups, saveGroups]);

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
              className={`${UI.btnNeutralSm} ${activeModuleCode === "standard" ? "bg-slate-100" : ""}`}
              onClick={() => setActiveModuleCode("standard")}
              disabled={disabled}
            >
              标准区域
            </button>
            <button
              type="button"
              className={`${UI.btnNeutralSm} ${activeModuleCode === "other" ? "bg-slate-100" : ""}`}
              onClick={() => setActiveModuleCode("other")}
              disabled={disabled}
            >
              其他区域
            </button>
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

        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            当前模块：<span className="font-semibold">{moduleLabel(activeModuleCode)}</span>
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

        {success ? (
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {success}
          </div>
        ) : null}

        {error ? (
          <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">
            {error}
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
        onAddRange={() => addRange(activeModuleCode)}
        onSaveRanges={() => void saveRanges(activeModuleCode)}
        onUpdateRangeField={(clientId, field, value) =>
          updateRangeField(activeModuleCode, clientId, field, value)
        }
        onRemoveRange={(clientId) => removeRange(activeModuleCode, clientId)}
      />

      <GroupsCard
        disabled={disabled}
        moduleState={moduleState}
        activeGroupClientId={activeGroupClientId}
        provinceOptions={provinceOptions}
        provinceLoading={provinceLoading}
        provinceNameByCode={provinceNameByCode}
        provinceOrder={provinceOrder}
        provinceOwnerMap={provinceOwnerMap}
        onSetActiveGroup={setActiveGroupClientId}
        onAddGroup={() => {
          addGroup(activeModuleCode);
        }}
        onSaveGroups={() => void saveGroups(activeModuleCode)}
        onSaveActiveGroupAndNext={() => void handleSaveActiveGroupAndNext()}
        onRemoveGroup={(clientId) => {
          const nextGroups = aliveGroups.filter((g) => g.clientId !== clientId);
          if (activeGroupClientId === clientId) {
            setActiveGroupClientId(nextGroups[0]?.clientId ?? null);
          }
          removeGroup(activeModuleCode, clientId);
        }}
        onSetGroupProvinces={(clientId, provinces) =>
          setGroupProvinces(activeModuleCode, clientId, provinces)
        }
      />

      <MatrixCard
        disabled={disabled}
        moduleState={moduleState}
        rows={rows}
        columns={columns}
        canEdit={derived.canEditActiveMatrix}
        onSaveCells={() => void saveCells(activeModuleCode)}
        renderCell={(cell) => (
          <CellEditor
            cell={cell}
            disabled={disabled || moduleState.savingCells}
            onUpdateMode={(mode) => updateCellMode(activeModuleCode, cell.groupId, cell.moduleRangeId, mode)}
            onToggleActive={() => toggleCellActive(activeModuleCode, cell.groupId, cell.moduleRangeId)}
            onUpdateField={(field, value) =>
              updateCellField(activeModuleCode, cell.groupId, cell.moduleRangeId, field, value)
            }
          />
        )}
      />

      <SurchargesCard
        disabled={disabled}
        saving={savingSurcharges}
        rows={surcharges}
        provinceOptions={provinceOptions}
        provinceNameByCode={provinceNameByCode}
        onAddRow={() => addSurchargeRow()}
        onSave={() => void saveSurcharges()}
        onUpdateRow={(clientId, patch) => updateSurchargeRow(clientId, patch)}
        onRemoveRow={(clientId) => removeSurchargeRow(clientId)}
      />
    </div>
  );
};

export default PricingWorkbenchPanel;
