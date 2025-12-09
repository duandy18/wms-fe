// src/components/common/ApiBadge.tsx
import React, { useEffect, useState } from "react";

type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type MswStatus = "on" | "off" | "starting";

interface ApiBadgeProps {
  method: ApiMethod;
  path: string;
}

function readMswStatusFromWindow(): MswStatus {
  if (typeof window === "undefined") return "off";

  const global = window as Window & {
    __MSW_ENABLED__?: boolean | "starting";
  };

  const flag = global.__MSW_ENABLED__;
  if (flag === true) return "on";
  if (flag === "starting") return "starting";

  if (navigator.serviceWorker && navigator.serviceWorker.controller) {
    return "on";
  }

  return "off";
}

const ApiBadge: React.FC<ApiBadgeProps> = ({ method, path }) => {
  const [msw, setMsw] = useState<MswStatus>(() => readMswStatusFromWindow());

  const api =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "—";

  useEffect(() => {
    const update = () => {
      setMsw(readMswStatusFromWindow());
    };

    update();

    const timer = window.setInterval(update, 500);
    window.addEventListener("MSW_READY", update as EventListener);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("MSW_READY", update as EventListener);
    };
  }, []);

  const chipClass =
    msw === "on"
      ? "bg-emerald-200 text-emerald-900"
      : msw === "starting"
      ? "bg-amber-200 text-amber-900"
      : "bg-neutral-200 text-neutral-700";

  return (
    <span className="inline-flex items-center gap-2 rounded-2xl bg-neutral-100 px-3 py-1 text-xs shadow-sm">
      <span className="rounded-md bg-neutral-900 px-1.5 py-0.5 font-mono text-[10px] uppercase text-neutral-50">
        {method}
      </span>
      <span className="font-mono text-[11px] text-neutral-700">{path}</span>
      <span className="font-mono text-[10px] text-neutral-400">
        {api}
      </span>
      <span className={`ml-1 rounded-full px-2 py-0.5 font-medium ${chipClass}`}>
        {msw === "on"
          ? "MSW on"
          : msw === "starting"
          ? "MSW starting"
          : "MSW off"}
      </span>
    </span>
  );
};

export default ApiBadge;
