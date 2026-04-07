// src/app/layout/Topbar.tsx
import React, { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  buildPageIndex,
  resolvePageByPath,
  useNavigationRuntime,
  useSessionRuntime,
} from "../../shared/runtime";
import { apiPost } from "../../lib/api";

type ChangePasswordErrorShape = {
  body?: { detail?: string };
  message?: string;
};

type Breadcrumb = { section: string; page: string };

export function Topbar() {
  const { user, logout } = useSessionRuntime();
  const { pages, routePrefixes } = useNavigationRuntime();
  const location = useLocation();

  const [showPwdModal, setShowPwdModal] = useState(false);
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [saving, setSaving] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);

  async function submitPasswordChange() {
    setPwdError(null);
    if (!oldPwd.trim() || !newPwd.trim()) {
      setPwdError("旧密码和新密码不能为空");
      return;
    }

    setSaving(true);
    try {
      await apiPost("/users/change-password", {
        old_password: oldPwd,
        new_password: newPwd,
      });
      alert("密码修改成功");
      setShowPwdModal(false);
      setOldPwd("");
      setNewPwd("");
    } catch (err: unknown) {
      const e = err as ChangePasswordErrorShape;
      const detail =
        e?.body?.detail ?? e?.message ?? "修改失败，请检查旧密码是否正确";
      setPwdError(detail);
    } finally {
      setSaving(false);
    }
  }

  const pageIndex = useMemo(() => buildPageIndex(pages), [pages]);

  const breadcrumb = useMemo<Breadcrumb>(() => {
    const resolved = resolvePageByPath(
      location.pathname,
      routePrefixes,
      pageIndex,
    );

    if (!resolved) {
      return { section: "首页", page: "概览" };
    }

    if (resolved.parentName) {
      return {
        section: resolved.parentName,
        page: resolved.pageName,
      };
    }

    return {
      section: resolved.pageName,
      page: "概览",
    };
  }, [location.pathname, routePrefixes, pageIndex]);

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-slate-900">
            {breadcrumb.section}
          </span>
          <span className="text-lg text-slate-400">/</span>
          <span className="text-lg text-slate-700">{breadcrumb.page}</span>
        </div>

        <div className="flex items-center gap-6 text-slate-800">
          <button title="通知">🔔</button>
          <button title="帮助">❔</button>

          <div className="group relative">
            <button className="flex items-center gap-1 font-semibold text-slate-900">
              <span>{user?.username ?? "未登录"}</span>
              <span className="text-sm">▼</span>
            </button>

            <div className="absolute right-0 z-20 mt-1 hidden rounded border bg-white shadow group-hover:block">
              <button
                className="block w-full px-4 py-2 hover:bg-slate-100"
                onClick={() => setShowPwdModal(true)}
              >
                修改密码
              </button>
              <button
                className="block w-full px-4 py-2 hover:bg-slate-100"
                onClick={logout}
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </header>

      {showPwdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-[420px] space-y-4 rounded-xl bg-white p-6">
            <h3 className="text-lg font-semibold">修改密码</h3>
            {pwdError && <div className="text-xs text-red-600">{pwdError}</div>}
            <input
              className="w-full border px-3 py-2"
              type="password"
              placeholder="旧密码"
              value={oldPwd}
              onChange={(e) => setOldPwd(e.target.value)}
            />
            <input
              className="w-full border px-3 py-2"
              type="password"
              placeholder="新密码"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowPwdModal(false)}>取消</button>
              <button onClick={submitPasswordChange}>
                {saving ? "保存中…" : "保存"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
