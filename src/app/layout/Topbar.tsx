// src/app/layout/Topbar.tsx
import React, { useState } from "react";
import { useAuth } from "../../shared/useAuth";
import { apiPost } from "../../lib/api";

type ChangePasswordErrorShape = {
  body?: { detail?: string };
  message?: string;
};

export function Topbar() {
  const { user, logout } = useAuth();

  // 修改密码弹窗状态
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
        e?.body?.detail ??
        e?.message ??
        "修改失败，请检查旧密码是否正确";
      setPwdError(detail);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <header className="h-16 border-b bg-white flex items-center px-6 justify-between text-lg shadow-sm">
        {/* 左侧：当前仓库占位 */}
        <div className="flex items-center gap-6 text-slate-800">
          <span className="text-xl font-semibold">仓库：WH1</span>
        </div>

        {/* 右侧：通知、帮助、用户 */}
        <div className="flex items-center gap-6 text-slate-800">
          <button className="hover:text-sky-600" title="通知">
            🔔
          </button>
          <button className="hover:text-sky-600" title="帮助">
            ❔
          </button>

          {/* 用户菜单 */}
          <div className="relative group">
            <button className="flex items-center gap-1 font-semibold text-slate-900 text-lg">
              <span>{user?.username ?? "未登录"}</span>
              <span className="text-sm">▼</span>
            </button>

            <div className="absolute right-0 mt-1 hidden group-hover:block bg-white border border-slate-200 rounded-lg shadow text-lg min-w-[160px] z-20">
              <button
                className="block w-full text-left px-4 py-2 hover:bg-slate-100"
                onClick={() => setShowPwdModal(true)}
              >
                修改密码
              </button>

              <button
                className="block w-full text-left px-4 py-2 hover:bg-slate-100"
                onClick={logout}
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ======== 修改密码弹窗 ======== */}
      {showPwdModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-[420px] shadow-xl space-y-4">
            <h3 className="text-lg font-semibold">修改密码</h3>

            {pwdError && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">
                {pwdError}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs text-slate-600">旧密码</label>
              <input
                type="password"
                className="border rounded-lg px-3 py-2 w-full text-sm"
                value={oldPwd}
                onChange={(e) => setOldPwd(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-600">新密码</label>
              <input
                type="password"
                className="border rounded-lg px-3 py-2 w-full text-sm"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
                onClick={() => setShowPwdModal(false)}
                disabled={saving}
              >
                取消
              </button>

              <button
                className="px-4 py-2 bg-slate-900 text-white text-sm rounded-lg disabled:opacity-60"
                onClick={submitPasswordChange}
                disabled={saving}
              >
                {saving ? "保存中…" : "保存"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
