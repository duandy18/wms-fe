// src/features/operations/outbound-pick/orderExplain/useOrderExplain.ts

import { useCallback, useEffect, useMemo, useState } from "react";
import type { OrderExplainCardInput, PlatformOrderReplayOut } from "./types";
import { replayPlatformOrder } from "./api";

type ExplainState =
  | { kind: "idle" }
  | { kind: "missing_key"; reason: string }
  | { kind: "loading" }
  | { kind: "ready"; data: PlatformOrderReplayOut }
  | { kind: "error"; message: string };

export function useOrderExplain(input: OrderExplainCardInput | null) {
  const [state, setState] = useState<ExplainState>({ kind: "idle" });

  const canReplay = useMemo(() => {
    if (!input) return false;
    if (!input.store_id) return false;
    if (!input.platform) return false;
    if (!input.ext_order_no) return false;
    return true;
  }, [input]);

  const reload = useCallback(async () => {
    if (!input) {
      setState({ kind: "idle" });
      return;
    }
    if (!input.store_id) {
      setState({ kind: "missing_key", reason: "缺 store_id：无法调用重放解码（replay）" });
      return;
    }
    setState({ kind: "loading" });
    try {
      const data = await replayPlatformOrder({
        platform: input.platform,
        store_id: input.store_id,
        ext_order_no: input.ext_order_no,
      });
      setState({ kind: "ready", data });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "重放解码失败（未知错误）";
      setState({ kind: "error", message: msg });
    }
  }, [input]);

  // 选中订单变化：自动触发一次（符合“卡片消费后端结果”）
  useEffect(() => {
    void reload();
  }, [reload]);

  return { state, reload, canReplay };
}
