// src/features/admin/users/types.ts

export type UserDTO = {
  id: number;
  username: string;
  role_id: number | null;              // 主角色（primary_role_id，对齐后端 UserOut.role_id）
  is_active: boolean;

  full_name?: string | null;
  phone?: string | null;
  email?: string | null;

  /**
   * 附加角色 ID 列表（额外角色）
   * - 由前端 useUsersPresenter 补齐（目前后端 list_users 尚未返回）
   * - 后端 updateUser / createUser 使用 extra_role_ids 传递
   */
  extra_roles?: number[];

  /**
   * 可选：完整角色信息（主要用于 /users/me，当前列表接口不一定提供）
   * 如果以后 list_users 也返回 roles[]，可以直接挂在这里复用。
   */
  roles?: { id: number; name: string }[];
};

export type RoleDTO = {
  id: number;
  name: string;
  description: string | null;
  permissions: PermissionDTO[];
};

export type PermissionDTO = {
  id: string;
  name: string;
  description: string | null;
};
