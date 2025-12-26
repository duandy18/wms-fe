// src/features/admin/shipping-providers/modals/edit-provider/ModalFrame.tsx
//
// Modal 外壳（纯展示）
// - 只负责遮罩/居中/容器/右上角关闭按钮

import React from "react";
import { MUI } from "./ui";

export const ModalFrame: React.FC<{
  title: string;
  subtitle?: React.ReactNode;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ title, subtitle, busy, error, onClose, children }) => {
  return (
    <div className={MUI.overlay}>
      <div className={MUI.frame}>
        <div className={MUI.headerRow}>
          <div>
            <div className={MUI.title}>{title}</div>
            {subtitle ? <div className={MUI.subtitle}>{subtitle}</div> : null}
          </div>

          <button type="button" className={MUI.btnClose} onClick={onClose} disabled={busy}>
            关闭
          </button>
        </div>

        {error ? <div className={MUI.errorBox}>{error}</div> : null}

        <div className={MUI.body}>{children}</div>

        <div className={MUI.footerRow}>
          <button type="button" className={MUI.btnClose} onClick={onClose} disabled={busy}>
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalFrame;
