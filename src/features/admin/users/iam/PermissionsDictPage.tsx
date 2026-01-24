// src/features/admin/users/iam/PermissionsDictPage.tsx
import React from "react";
import { UsersAdminPage } from "../UsersAdminPage";

/**
 * IAM / 权限字典
 */
const PermissionsDictPage: React.FC = () => {
  return <UsersAdminPage initialTab="perms" />;
};

export default PermissionsDictPage;
