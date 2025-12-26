// src/features/admin/users/panels/users-panel/components/UsersTable.tsx

import React from "react";
import type { RoleDTO, UserDTO } from "../../../types";
import { UI } from "../ui";
import { roleName } from "../roleUtils";

export const UsersTable: React.FC<{
  users: UserDTO[];
  roles: RoleDTO[];
  loading: boolean;
  mutating: boolean;

  onEdit: (u: UserDTO) => void;
  onToggleActive: (u: UserDTO) => void | Promise<void>;
  onResetPassword: (u: UserDTO) => void | Promise<void>;
}> = ({ users, roles, loading, mutating, onEdit, onToggleActive, onResetPassword }) => {
  return (
    <section className={UI.listWrap}>
      {loading ? (
        <div className={UI.listLoading}>加载中…</div>
      ) : users.length === 0 ? (
        <div className={UI.listEmpty}>暂无用户。</div>
      ) : (
        <table className={UI.table}>
          <thead className={UI.thead}>
            <tr>
              <th className={`${UI.th} w-12`}>ID</th>
              <th className={UI.th}>用户名</th>
              <th className={UI.th}>姓名</th>
              <th className={UI.th}>电话</th>
              <th className={UI.th}>邮箱</th>
              <th className={UI.th}>主角色</th>
              <th className={UI.th}>附加角色</th>
              <th className={`${UI.th} w-28`}>状态</th>
              <th className={`${UI.th} w-40`}>操作</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id} className={UI.tr}>
                <td className={UI.td}>{u.id}</td>
                <td className={UI.td}>{u.username}</td>
                <td className={UI.td}>{u.full_name || "-"}</td>
                <td className={UI.td}>{u.phone || "-"}</td>
                <td className={UI.td}>{u.email || "-"}</td>
                <td className={UI.td}>{roleName(roles, u.role_id)}</td>

                <td className={UI.td}>
                  {(u.extra_roles || []).map((rid: number) => (
                    <span key={rid} className={UI.rolePill}>
                      {roleName(roles, rid)}
                    </span>
                  ))}
                </td>

                <td className={UI.td}>{u.is_active ? <span className={UI.statusOn}>启用</span> : <span className={UI.statusOff}>停用</span>}</td>

                <td className={UI.td}>
                  <div className={UI.actionsWrap}>
                    <button className={UI.btnSmall} disabled={mutating} onClick={() => onEdit(u)}>
                      编辑
                    </button>

                    <button className={UI.btnSmall} disabled={mutating} onClick={() => void onToggleActive(u)}>
                      {u.is_active ? "停用" : "启用"}
                    </button>

                    <button className={UI.btnWarn} disabled={mutating} onClick={() => void onResetPassword(u)}>
                      重置密码
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
};

export default UsersTable;
