// src/features/admin/suppliers/hooks/useSuppliersPage.ts
//
// Suppliers 页面状态 / orchestration
// - 加载列表
// - 新建供应商
// - 启用/停用

import { useEffect, useState } from "react";
import { fetchSuppliers, createSupplier, updateSupplier, type Supplier } from "../api";

type ApiErrorShape = { message?: string };

function getErrorMessage(err: unknown, fallback: string): string {
  const e = err as ApiErrorShape | undefined;
  return e?.message ?? fallback;
}

export function useSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [onlyActive, setOnlyActive] = useState(true);
  const [search, setSearch] = useState("");

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [wechat, setWechat] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  async function loadSuppliers() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSuppliers({
        active: onlyActive ? true : undefined,
        q: search.trim() || undefined,
      });
      setSuppliers(data);
    } catch (err: unknown) {
      // 保留原行为：打印日志 + 设置错误 + 清空列表
      console.error("fetchSuppliers failed", err);
      setError(getErrorMessage(err, "加载供应商失败"));
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSuppliers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);

    const n = name.trim();
    if (!n) {
      setCreateError("公司名称必填");
      return;
    }

    setCreating(true);
    try {
      await createSupplier({
        name: n,
        code: code.trim() || undefined,
        contact_name: contactName.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        wechat: wechat.trim() || undefined,
        active: true,
      });

      setName("");
      setCode("");
      setContactName("");
      setPhone("");
      setEmail("");
      setWechat("");

      await loadSuppliers();
    } catch (err: unknown) {
      console.error("createSupplier failed", err);
      setCreateError(getErrorMessage(err, "创建供应商失败"));
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(s: Supplier) {
    try {
      const updated = await updateSupplier(s.id, { active: !s.active });
      setSuppliers((prev) => prev.map((x) => (x.id === s.id ? updated : x)));
    } catch (err: unknown) {
      // 保持原行为：只 log，不弹窗不打断
      console.error("updateSupplier failed", err);
    }
  }

  return {
    // list
    suppliers,
    loading,
    error,

    onlyActive,
    setOnlyActive,
    search,
    setSearch,

    loadSuppliers,
    toggleActive,

    // create
    name,
    setName,
    code,
    setCode,
    contactName,
    setContactName,
    phone,
    setPhone,
    email,
    setEmail,
    wechat,
    setWechat,
    creating,
    createError,
    handleCreate,
  };
}

export default useSuppliersPage;
