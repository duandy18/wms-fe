// src/features/admin/shipping-providers/modals/edit-provider/ContactsTable.tsx
//
// 联系人表格渲染（纯渲染 + 行内操作）
// - 不持有 state，只响应 props

import React from "react";
import type { ShippingProviderContact } from "../../api";
import { renderText, roleLabel } from "./roles";
import { MUI } from "./ui";

export const ContactsTable: React.FC<{
  contacts: ShippingProviderContact[];
  disabled: boolean;

  onSetPrimary: (contactId: number) => void | Promise<void>;
  onToggleContactActive: (c: ShippingProviderContact) => void | Promise<void>;
  onRemoveContact: (contactId: number) => void | Promise<void>;
}> = ({ contacts, disabled, onSetPrimary, onToggleContactActive, onRemoveContact }) => {
  return (
    <div className={MUI.tableWrap}>
      <table className={MUI.table}>
        <thead className={MUI.thead}>
          <tr className={MUI.theadTr}>
            <th className={MUI.th}>姓名</th>
            <th className={MUI.th}>电话</th>
            <th className={MUI.th}>邮箱</th>
            <th className={MUI.th}>角色</th>
            <th className={MUI.th}>主联系人</th>
            <th className={MUI.th}>状态</th>
            <th className={`${MUI.th} text-right`}>操作</th>
          </tr>
        </thead>

        <tbody>
          {(contacts ?? []).map((c) => (
            <tr key={c.id} className={MUI.tr}>
              <td className={MUI.td}>{renderText(c.name)}</td>
              <td className={MUI.tdMono}>{renderText(c.phone ?? null)}</td>
              <td className={MUI.tdMono}>{renderText(c.email ?? null)}</td>
              <td className={MUI.td}>{roleLabel(c.role ?? null)}</td>
              <td className={MUI.td}>{c.is_primary ? "是" : "否"}</td>
              <td className={MUI.td}>{c.active ? "启用" : "停用"}</td>
              <td className={MUI.tdRight}>
                <div className={MUI.actionsRow}>
                  <button type="button" className={MUI.btnXs} disabled={disabled} onClick={() => void onSetPrimary(c.id)}>
                    设为主联系人
                  </button>

                  <button type="button" className={MUI.btnXs} disabled={disabled} onClick={() => void onToggleContactActive(c)}>
                    {c.active ? "停用" : "启用"}
                  </button>

                  <button
                    type="button"
                    className={MUI.btnDangerXs}
                    disabled={disabled}
                    onClick={() => {
                      const ok = window.confirm("确定要删除该联系人吗？此操作不可撤销。");
                      if (!ok) return;
                      void onRemoveContact(c.id);
                    }}
                  >
                    删除
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {(contacts ?? []).length === 0 ? (
            <tr>
              <td className={MUI.emptyRow} colSpan={7}>
                暂无联系人
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
};

export default ContactsTable;
