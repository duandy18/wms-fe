// src/features/admin/shipping-providers/scheme/flow/sections/ExplainSection.tsx

import React, { useEffect, useMemo, useRef, useCallback } from "react";
import FlowSectionCard from "../FlowSectionCard";

import { usePricingSchemeMatrix } from "../../brackets/matrix/usePricingSchemeMatrix";
import type { ZoneBracketsMatrixGroup } from "../../brackets/matrix/types";

import { buildZonePricePreview } from "../../table/utils/pricePreview";
import PriceTablePreviewCard from "../../table/cards/PriceTablePreviewCard";
import QuoteExplainCard from "../../table/cards/QuoteExplainCard";

// ✅ 明确事件：事实变更后通知“末端只读区”刷新（不做隐式兜底）
const PRICING_MATRIX_UPDATED_EVENT = "wms:pricing-matrix-updated";

type Props = {
  schemeId: number;
  selectedZoneId: number | null;
  disabled: boolean;
  onError: (msg: string) => void;
};

export const ExplainSection: React.FC<Props> = (p) => {
  const mx = usePricingSchemeMatrix({ schemeId: p.schemeId, enabled: true });

  // 🔑 关键：只解构需要的函数，不再在 hooks 中引用 mx 对象
  const { reload } = mx;

  // matrix groups（只读）
  const groups = useMemo(
    () => (mx.groups ?? []) as ZoneBracketsMatrixGroup[],
    [mx.groups],
  );

  // 当前 Zone 的价格预览
  const preview = useMemo(() => {
    return buildZonePricePreview({
      mx: { groups },
      selectedZoneId: p.selectedZoneId,
    });
  }, [groups, p.selectedZoneId]);

  /**
   * ✅ reload 的稳定 callback
   * - 这里只依赖 reload（函数），不依赖 mx
   * - eslint 不再要求把 mx 放进依赖数组
   */
  const reloadMatrix = useCallback(() => {
    return reload();
  }, [reload]);

  /**
   * ✅ 用 ref 保存 reloadMatrix，避免 effect 因 callback 变化反复绑定
   */
  const reloadRef = useRef<(() => Promise<void>) | null>(null);
  useEffect(() => {
    reloadRef.current = reloadMatrix;
  }, [reloadMatrix]);

  /**
   * ✅ 防抖刷新（250ms 合并）
   */
  const timerRef = useRef<number | null>(null);

  const requestReload = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      void reloadRef.current?.();
    }, 250);
  }, []);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  /**
   * ✅ 监听“事实已更新”事件（价格 / 目的地附加费 / 规则附加费 / 区域等）
   */
  useEffect(() => {
    const onUpdated = () => {
      requestReload();
    };
    window.addEventListener(PRICING_MATRIX_UPDATED_EVENT, onUpdated);
    return () => {
      window.removeEventListener(PRICING_MATRIX_UPDATED_EVENT, onUpdated);
    };
  }, [requestReload]);

  /**
   * ✅ scheme / zone 切换时刷新（走防抖，不直刷）
   */
  useEffect(() => {
    requestReload();
  }, [p.schemeId, p.selectedZoneId, requestReload]);

  return (
    <FlowSectionCard
      title="7）结果校验与算价解释"
      desc="末端只读：先看当前区域价格预览，再用真实订单条件执行算价解释（地址 → Zone → 命中重量段 → 目的地附加费 → 规则附加费 → 总价）。"
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PriceTablePreviewCard
          title={preview.title}
          selectedZoneId={p.selectedZoneId}
          rows={preview.rows}
        />
        <QuoteExplainCard
          schemeId={p.schemeId}
          disabled={p.disabled}
          onError={p.onError}
        />
      </div>
    </FlowSectionCard>
  );
};

export default ExplainSection;
