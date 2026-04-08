// src/features/admin/users/types.ts

export type UserDTO = {
  id: number;
  username: string;
  is_active: boolean;

  full_name?: string | null;
  phone?: string | null;
  email?: string | null;

  /**
   * 后端用户直配权限列表
   */
  permissions: string[];
};

export type PermissionDTO = {
  id: number;
  name: string;
};
