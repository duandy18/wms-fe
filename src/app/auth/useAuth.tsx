// src/app/auth/useAuth.tsx
//
// 统一 auth 实现：直接复用 shared/useAuth.tsx，避免出现两个版本的 useAuth。

/* eslint-disable react-refresh/only-export-components */

export { AuthProvider, useAuth } from "../../shared/useAuth";
