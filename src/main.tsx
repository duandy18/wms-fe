// src/main.tsx
/* eslint-disable react-refresh/only-export-components */

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";

import AppRouter from "./app/router";
import { AuthProvider } from "./shared/useAuth";

type PatchedConsoleError = typeof console.error & { __wms_safe_patched__?: boolean };

function patchConsoleError() {
  try {
    const orig = console.error as PatchedConsoleError;

    if (orig.__wms_safe_patched__) return;

    const safe: PatchedConsoleError = ((...args: unknown[]) => {
      try {
        // 原样转发，不做 String 拼接
        orig.apply(console, args as unknown[]);
      } catch {
        try {
          orig.call(console, "[console.error failed: unprintable arguments]");
        } catch {
          // ignore
        }
      }
    }) as PatchedConsoleError;

    safe.__wms_safe_patched__ = true;
    console.error = safe;
  } catch {
    // ignore
  }
}
patchConsoleError();

function safeToString(value: unknown): string {
  try {
    if (value instanceof Error) {
      try {
        return value.message || value.name || "Unknown Error";
      } catch {
        return value.name || "Unknown Error";
      }
    }

    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") return String(value);
    if (value === null) return "null";
    if (value === undefined) return "undefined";

    try {
      return JSON.stringify(value, (_k, v) => (typeof v === "bigint" ? v.toString() : v), 2);
    } catch {
      return "[Unserializable error object]";
    }
  } catch {
    return "[Failed to render error]";
  }
}

function safeStack(value: unknown): string | null {
  try {
    if (value instanceof Error && typeof value.stack === "string" && value.stack.trim()) {
      return value.stack;
    }
  } catch {
    // ignore
  }
  return null;
}

type RootErrorState = {
  error: unknown | null;
  errorInfo: React.ErrorInfo | null;
};

class RootErrorBoundary extends React.Component<{ children: React.ReactNode }, RootErrorState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: unknown): Partial<RootErrorState> {
    return { error };
  }

  componentDidCatch(error: unknown, errorInfo: React.ErrorInfo) {
    try {
      console.error("[RootErrorBoundary]", error, errorInfo);
    } catch {
      // ignore
    }
    this.setState({ errorInfo });
  }

  render() {
    const { error, errorInfo } = this.state;
    if (error) {
      const msg = safeToString(error);
      const stack = safeStack(error);
      const componentStack = errorInfo?.componentStack ? String(errorInfo.componentStack) : "";

      return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50">
          <div className="max-w-3xl w-full bg-white shadow rounded-xl p-6">
            <h1 className="text-lg font-semibold text-red-700 mb-3">前端渲染出错了</h1>

            <p className="text-sm text-slate-700 mb-2">错误信息：</p>
            <pre className="text-xs text-red-700 whitespace-pre-wrap max-h-[240px] overflow-auto rounded-lg border border-red-100 bg-red-50 p-3">
              {msg}
            </pre>

            {stack ? (
              <>
                <p className="text-sm text-slate-700 mt-4 mb-2">错误堆栈（stack）：</p>
                <pre className="text-xs text-slate-700 whitespace-pre-wrap max-h-[240px] overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3">
                  {stack}
                </pre>
              </>
            ) : null}

            {componentStack ? (
              <>
                <p className="text-sm text-slate-700 mt-4 mb-2">组件栈（componentStack）：</p>
                <pre className="text-xs text-slate-700 whitespace-pre-wrap max-h-[240px] overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3">
                  {componentStack}
                </pre>
              </>
            ) : null}

            <div className="mt-4 text-xs text-slate-500">提示：本页是兜底错误页；已对 console.error 做了防崩补丁。</div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const RootApp: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <RootApp />
    </RootErrorBoundary>
  </React.StrictMode>,
);
