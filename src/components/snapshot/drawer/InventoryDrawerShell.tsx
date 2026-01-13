// src/components/snapshot/drawer/InventoryDrawerShell.tsx
import React from "react";

type Props = {
  open: boolean;
  title: string;
  subtitle?: string | null;
  loading?: boolean;
  onClose: () => void;
  onRefresh?: () => void;
  children: React.ReactNode;
};

export function InventoryDrawerShell({
  open,
  title,
  subtitle,
  loading = false,
  onClose,
  onRefresh,
  children,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex">
      {/* 背景遮罩 */}
      <div className="flex-1 bg-black/30" onClick={onClose} aria-hidden="true" />

      {/* 右侧抽屉 */}
      <div className="w-full max-w-xl bg-white shadow-xl h-full flex flex-col">
        {/* 头部：标题 + 关闭 */}
        <header className="h-16 flex items-center justify-between border-b border-slate-200 px-6">
          <div>
            {/* 主标题：24px */}
            <div className="text-2xl font-semibold text-slate-900">{title}</div>
            {subtitle ? <div className="mt-1 text-base text-slate-600">{subtitle}</div> : null}
          </div>

          <div className="flex items-center gap-3">
            {onRefresh ? (
              <button
                type="button"
                onClick={onRefresh}
                className="text-base text-slate-600 hover:text-slate-900"
              >
                刷新明细
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="text-base text-slate-500 hover:text-slate-800"
            >
              关闭
            </button>
          </div>
        </header>

        {/* 主体内容 */}
        <main className="flex-1 overflow-auto p-5 space-y-5">
          {loading ? <div className="text-base text-slate-600">加载中…</div> : null}
          {children}
        </main>
      </div>
    </div>
  );
}
