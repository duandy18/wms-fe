// src/features/admin/stores/components/order-sim/FilledCodeCombobox.tsx

import React, { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { OrderSimFilledCodeOption } from "../../api";
import { normText, safeLower } from "./textUtils";

export type ComboPick = {
  filled_code: string;
  suggested_title: string | null;
  components_summary: string | null;
};

function useStableId(prefix: string): string {
  const idRef = useRef<string | null>(null);
  if (!idRef.current) idRef.current = `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
  return idRef.current;
}

export const FilledCodeCombobox: React.FC<{
  value: string;
  disabled?: boolean;
  loading?: boolean;
  options: OrderSimFilledCodeOption[];
  hit: OrderSimFilledCodeOption | null;

  placeholder?: string;

  onChange: (next: string) => void;
  onPick: (picked: ComboPick) => void;
}> = ({ value, disabled, loading, options, hit, placeholder, onChange, onPick }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const instanceId = useStableId("filled-code-combobox");

  const filtered = useMemo(() => {
    const q = safeLower(normText(value));
    if (!q) return options;
    return options.filter((o) => {
      const code = safeLower(normText(o.filled_code));
      const title = safeLower(normText(o.suggested_title));
      const summary = safeLower(normText(o.components_summary));
      return code.includes(q) || title.includes(q) || summary.includes(q);
    });
  }, [options, value]);

  const menuPos = useMemo(() => {
    if (!open) return null;
    const el = inputRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { left: r.left, top: r.bottom + 6, width: r.width };
  }, [open]);

  function close() {
    setOpen(false);
    setActiveIndex(-1);
  }

  function openMenu() {
    if (disabled) return;
    setOpen(true);

    if (filtered.length === 0) {
      setActiveIndex(-1);
      return;
    }

    if (hit) {
      const idx = filtered.findIndex((o) => normText(o.filled_code) === normText(hit.filled_code));
      setActiveIndex(idx >= 0 ? idx : 0);
      return;
    }

    setActiveIndex(0);
  }

  function pickAt(idx: number) {
    const o = filtered[idx];
    if (!o) return;
    onPick({
      filled_code: o.filled_code,
      suggested_title: o.suggested_title ?? null,
      components_summary: o.components_summary ?? null,
    });
    close();
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (disabled) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        openMenu();
        return;
      }
      if (filtered.length === 0) return;
      setActiveIndex((prev) => (prev < 0 ? 0 : Math.min(prev + 1, filtered.length - 1)));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        openMenu();
        return;
      }
      if (filtered.length === 0) return;
      setActiveIndex((prev) => (prev <= 0 ? 0 : prev - 1));
      return;
    }

    if (e.key === "Enter") {
      if (!open) return;
      e.preventDefault();
      if (activeIndex >= 0) pickAt(activeIndex);
      return;
    }

    if (e.key === "Escape") {
      if (!open) return;
      e.preventDefault();
      close();
    }
  }

  React.useEffect(() => {
    if (!open) return;

    function onDocMouseDown(ev: MouseEvent) {
      const target = ev.target as Node | null;
      if (!target) return;

      const inputEl = inputRef.current;
      const menuEl = menuRef.current;

      const hitInput = inputEl ? inputEl.contains(target) : false;
      const hitMenu = menuEl ? menuEl.contains(target) : false;

      if (!hitInput && !hitMenu) close();
    }

    function onDocScrollOrResize() {
      // 滚动/resize 关闭，避免菜单飘位置
      close();
    }

    document.addEventListener("mousedown", onDocMouseDown);
    window.addEventListener("scroll", onDocScrollOrResize, true);
    window.addEventListener("resize", onDocScrollOrResize);

    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      window.removeEventListener("scroll", onDocScrollOrResize, true);
      window.removeEventListener("resize", onDocScrollOrResize);
    };
  }, [open]);

  const menu =
    open && menuPos
      ? createPortal(
          <div
            ref={(el) => {
              menuRef.current = el;
            }}
            id={`${instanceId}-menu`}
            role="listbox"
            aria-label="已绑定填写码候选"
            className="fixed z-[3000] rounded-md border border-slate-200 bg-white shadow-lg"
            style={{ left: menuPos.left, top: menuPos.top, width: menuPos.width }}
          >
            <div className="max-h-[320px] overflow-auto py-1">
              {loading ? (
                <div className="px-3 py-2 text-sm text-slate-500">候选加载中…</div>
              ) : filtered.length === 0 ? (
                <div className="px-3 py-2 text-sm text-slate-500">无匹配候选</div>
              ) : (
                filtered.map((o, idx) => {
                  const isActive = idx === activeIndex;
                  const isHit = normText(o.filled_code) === normText(hit?.filled_code ?? "");
                  return (
                    <button
                      key={`${instanceId}-${o.filled_code}`}
                      type="button"
                      className={["w-full text-left px-3 py-2 text-sm", isActive ? "bg-slate-100" : "bg-white"].join(" ")}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => pickAt(idx)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-mono text-slate-900">{o.filled_code}</div>
                        {isHit ? <div className="text-[11px] text-emerald-700">已匹配</div> : null}
                      </div>
                      {o.suggested_title ? <div className="mt-0.5 text-xs text-slate-700">{o.suggested_title}</div> : null}
                      {o.components_summary ? (
                        <div className="mt-0.5 text-[11px] text-slate-500 whitespace-pre-line">{o.components_summary}</div>
                      ) : null}
                    </button>
                  );
                })
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <input
        ref={(el) => {
          inputRef.current = el;
        }}
        className={[
          "w-full rounded-md border px-2 py-1 text-sm",
          hit ? "border-emerald-300" : "border-slate-300",
        ].join(" ")}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          if (!open && !disabled) setOpen(true);
          setActiveIndex(0);
        }}
        onFocus={() => openMenu()}
        onClick={() => openMenu()}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        aria-expanded={open}
        aria-controls={`${instanceId}-menu`}
      />
      {menu}
    </>
  );
};
