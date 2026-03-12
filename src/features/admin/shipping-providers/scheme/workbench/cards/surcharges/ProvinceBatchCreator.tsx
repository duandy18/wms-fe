// src/features/admin/shipping-providers/scheme/workbench/cards/surcharges/ProvinceBatchCreator.tsx
//
// 分拆说明：
// - 从 SurchargesCard.tsx 中拆出。
// - 当前负责“省级附加费编辑工作区”：
//   1) 左侧候选省份
//   2) 右侧待保存草稿
//   3) 右侧已保存省级配置编辑
// - 维护约束：
//   - 右侧为省级附加费唯一编辑区；不要再在父层额外渲染第二套省级编辑列表。
//   - 草稿状态由 surcharge 子域统一持有；本组件保持受控，不自养业务真相。

import React from "react";
import type { GeoItem } from "../../../../api/geo";
import { UI } from "../../../ui";
import SuccessBar from "../../SuccessBar";
import { useFlashOkBar } from "../../useFlashOkBar";
import type { SurchargeRuleRow } from "../../domain/types";
import type { ProvinceBatchDraft, ProvinceSelection } from "./types";
import { filterOptions } from "./utils";

type Props = {
  disabled: boolean;
  saving: boolean;
  errorMessage: string | null;
  options: GeoItem[];
  existingProvinceCodes: Set<string>;
  savedRows: SurchargeRuleRow[];
  selectedItems: ProvinceBatchDraft[];
  onAddDraft: (item: ProvinceSelection) => void;
  onUpdateDraft: (
    provinceCode: string,
    patch: Partial<Pick<ProvinceBatchDraft, "fixedAmount" | "active">>,
  ) => void;
  onRemoveDraft: (provinceCode: string) => void;
  onClearDrafts: () => void;
  onSaveWorkspace: () => Promise<boolean>;
  onUpdateSavedRow: (
    clientId: string,
    patch: Partial<
      Pick<
        SurchargeRuleRow,
        "provinceCode" | "provinceName" | "provinceMode" | "fixedAmount" | "active" | "cities"
      >
    >,
  ) => void;
  onRemoveSavedRow: (clientId: string) => void;
};

const ProvinceBatchCreator: React.FC<Props> = ({
  disabled,
  saving,
  errorMessage,
  options,
  existingProvinceCodes,
  savedRows,
  selectedItems,
  onAddDraft,
  onUpdateDraft,
  onRemoveDraft,
  onClearDrafts,
  onSaveWorkspace,
  onUpdateSavedRow,
  onRemoveSavedRow,
}) => {
  const [keyword, setKeyword] = React.useState("");
  const { okMsg, flashOk, clearOk } = useFlashOkBar();

  const availableOptions = React.useMemo(() => {
    return filterOptions(
      options.filter((opt) => !existingProvinceCodes.has(String(opt.code ?? ""))),
      keyword,
    );
  }, [existingProvinceCodes, keyword, options]);

  const selectedCodeSet = React.useMemo(
    () => new Set(selectedItems.map((item) => item.provinceCode)),
    [selectedItems],
  );

  const hasWorkspaceContent = selectedItems.length > 0 || savedRows.length > 0;

  const handleSaveWorkspace = React.useCallback(async () => {
    const ok = await onSaveWorkspace();
    if (ok) {
      flashOk("省级附加费已保存。");
    }
  }, [flashOk, onSaveWorkspace]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-800">省级附加费编辑区</div>
          <div className="mt-1 text-xs text-slate-500">
            左侧挑选省份加入右侧编辑区；右侧统一承载待保存草稿和已有省级配置，不再使用下方第二编辑区。
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className={UI.btnNeutralSm}
            onClick={onClearDrafts}
            disabled={disabled || saving || selectedItems.length === 0}
          >
            清空待保存
          </button>
          <button
            type="button"
            className={UI.btnPrimaryGreen}
            onClick={() => void handleSaveWorkspace()}
            disabled={disabled || saving}
          >
            保存省级附加费
          </button>
        </div>
      </div>

      <div className="mt-3">
        <SuccessBar msg={okMsg} onClose={clearOk} />
      </div>

      {errorMessage ? (
        <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">
          {errorMessage}
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <div className={UI.tinyHelpText}>候选省份</div>
          <input
            className={`${UI.inputBase} mt-2`}
            value={keyword}
            disabled={disabled || saving}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="输入省份名称或编码搜索"
          />

          <div className="mt-3 max-h-64 space-y-2 overflow-auto">
            {availableOptions.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                当前没有可新增的省份。
              </div>
            ) : (
              availableOptions.map((opt) => {
                const code = String(opt.code ?? "");
                const name = String(opt.name ?? "");
                const selected = selectedCodeSet.has(code);

                return (
                  <button
                    key={code}
                    type="button"
                    className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm ${
                      selected
                        ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                    disabled={disabled || saving || selected}
                    onClick={() =>
                      onAddDraft({
                        provinceCode: code,
                        provinceName: name,
                      })
                    }
                  >
                    <span className="truncate">{name}</span>
                    <span className="ml-3 shrink-0 text-xs">{selected ? "已加入" : "加入"}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <div className={UI.tinyHelpText}>右侧唯一编辑区</div>

          {!hasWorkspaceContent ? (
            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              右侧还没有省级附加费内容。请先从左侧加入省份。
            </div>
          ) : (
            <div className="mt-3 space-y-4">
              {selectedItems.length > 0 ? (
                <div className="space-y-3">
                  <div className="text-xs font-medium text-slate-500">待保存省级附加费</div>

                  {selectedItems.map((item) => (
                    <div
                      key={item.provinceCode}
                      className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3"
                    >
                      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_140px_100px_auto] lg:items-center">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-800">
                            {item.provinceName || item.provinceCode}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">省编码：{item.provinceCode}</div>
                        </div>

                        <div>
                          <div className={UI.tinyHelpText}>附加费</div>
                          <input
                            className={`${UI.inputBase} mt-1`}
                            value={item.fixedAmount}
                            disabled={disabled || saving}
                            onChange={(e) =>
                              onUpdateDraft(item.provinceCode, {
                                fixedAmount: e.target.value,
                              })
                            }
                            placeholder="例如 5"
                          />
                        </div>

                        <div>
                          <div className={UI.tinyHelpText}>状态</div>
                          <label className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                            <input
                              type="checkbox"
                              checked={item.active}
                              disabled={disabled || saving}
                              onChange={(e) =>
                                onUpdateDraft(item.provinceCode, {
                                  active: e.target.checked,
                                })
                              }
                            />
                            启用
                          </label>
                        </div>

                        <div className="flex items-center justify-start lg:justify-end">
                          <button
                            type="button"
                            className={UI.btnDangerSm}
                            onClick={() => onRemoveDraft(item.provinceCode)}
                            disabled={disabled || saving}
                          >
                            移除
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {savedRows.length > 0 ? (
                <div className="space-y-3">
                  <div className="text-xs font-medium text-slate-500">已有省级附加费配置</div>

                  {savedRows.map((row) => (
                    <div
                      key={row.clientId}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                    >
                      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_140px_100px_auto] lg:items-center">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-800">
                            {row.provinceName || row.provinceCode || "未选择"}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            模式：全省收费
                            {row.isDirty ? " · 已修改未保存" : ""}
                          </div>
                        </div>

                        <div>
                          <div className={UI.tinyHelpText}>附加费</div>
                          <input
                            className={`${UI.inputBase} mt-1`}
                            value={row.fixedAmount}
                            disabled={disabled || saving}
                            onChange={(e) =>
                              onUpdateSavedRow(row.clientId, {
                                fixedAmount: e.target.value,
                              })
                            }
                            placeholder="例如 5"
                          />
                        </div>

                        <div>
                          <div className={UI.tinyHelpText}>状态</div>
                          <label className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                            <input
                              type="checkbox"
                              checked={row.active}
                              disabled={disabled || saving}
                              onChange={(e) =>
                                onUpdateSavedRow(row.clientId, {
                                  active: e.target.checked,
                                })
                              }
                            />
                            启用
                          </label>
                        </div>

                        <div className="flex items-center justify-start lg:justify-end">
                          <button
                            type="button"
                            className={UI.btnDangerSm}
                            onClick={() => onRemoveSavedRow(row.clientId)}
                            disabled={disabled || saving}
                          >
                            删除配置
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProvinceBatchCreator;
