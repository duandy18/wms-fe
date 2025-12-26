// src/features/admin/shipping-providers/scheme/brackets/SegmentsHeader.tsx
//
// Header：标题 + 状态（已采用/未采用） + More 菜单（防误触）
// UI token：scheme/ui.ts

import React, { useEffect, useRef, useState } from "react";
import UI from "../ui";

export const SegmentsHeader: React.FC<{
  adopted: boolean;
  isEditing: boolean;
  disabled: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onAdoptDefault: () => void;
  onDisable: () => void;
}> = ({ adopted, isEditing, disabled, onStartEdit, onCancelEdit, onAdoptDefault, onDisable }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuOpen) return;
      const el = wrapRef.current;
      const target = e.target as Node | null;
      if (!el || !target) return;
      if (!el.contains(target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen]);

  return (
    <div className={UI.headerRow}>
      <div className="flex flex-wrap items-center gap-3">
        <div className={UI.panelTitle}>重量区间（表头结构）</div>

        <div className={UI.headerMeta}>
          状态： <span className={adopted ? UI.statusOn : UI.statusOff}>{adopted ? "已采用" : "未采用（已停用）"}</span>
          <span className={UI.rowIdTiny}>（segments_json）</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isEditing ? (
          <button type="button" className={UI.btnNeutral} disabled={disabled} onClick={() => onCancelEdit()}>
            取消编辑
          </button>
        ) : (
          <div className="relative" ref={wrapRef}>
            <button
              type="button"
              className={UI.btnNeutral}
              disabled={disabled}
              onClick={() => setMenuOpen((v) => !v)}
            >
              更多
            </button>

            {menuOpen ? (
              <div className="absolute right-0 mt-2 w-[260px]">
                <div className={UI.cardTight}>
                  <div className="space-y-2">
                    <button
                      type="button"
                      className={`${UI.btnNeutralSm} w-full justify-center`}
                      disabled={disabled}
                      onClick={() => {
                        setMenuOpen(false);
                        onStartEdit();
                      }}
                    >
                      编辑（高风险）
                    </button>

                    <button
                      type="button"
                      className={`${UI.btnNeutralSm} w-full justify-center`}
                      disabled={disabled}
                      onClick={() => {
                        setMenuOpen(false);
                        onAdoptDefault();
                      }}
                    >
                      采用默认模板
                    </button>

                    <button
                      type="button"
                      className={`${UI.btnDangerSm} w-full justify-center`}
                      disabled={disabled}
                      onClick={() => {
                        setMenuOpen(false);
                        onDisable();
                      }}
                    >
                      停用（清空表头）
                    </button>

                    <div className={UI.tinyHelpText}>提示：重量区间是“列结构”。误改会影响录价列与算价解释链。</div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default SegmentsHeader;
