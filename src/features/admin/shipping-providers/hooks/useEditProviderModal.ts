// src/features/admin/shipping-providers/hooks/useEditProviderModal.ts
import { useEffect, useMemo, useState } from "react";
import {
  updateShippingProvider,
  createShippingProviderContact,
  updateShippingProviderContact,
  deleteShippingProviderContact,
  type ShippingProvider,
  type ShippingProviderContact,
} from "../api";
import type { EditProviderFormState } from "../modals/EditProviderModal";

type ApiErrorShape = { message?: string; detail?: string };

function getErrorMessage(err: unknown, fallback: string): string {
  const e = err as ApiErrorShape | undefined;
  return e?.message ?? e?.detail ?? fallback;
}

export function useEditProviderModal(args: {
  providers: ShippingProvider[];
  loadProviders: () => Promise<ShippingProvider[]>;
}) {
  const { providers, loadProviders } = args;

  // ===== Provider 编辑弹窗（modal state）=====
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [editSaving, setEditSaving] = useState(false);
  const [cSaving, setCSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [form, setForm] = useState<EditProviderFormState>({
    editName: "",
    editCode: "",
    editActive: true,
    editPriority: "100",
    cName: "",
    cPhone: "",
    cEmail: "",
    cWechat: "",
    cRole: "shipping",
    cPrimary: true,
  });

  const editingProvider = useMemo(
    () => (editId ? providers.find((p) => p.id === editId) ?? null : null),
    [providers, editId],
  );

  const busyModal = editSaving || cSaving;

  // 当 providers 变化时，校验 editId 是否还存在（保持原行为）
  useEffect(() => {
    if (editId && !providers.some((p) => p.id === editId)) {
      setEditOpen(false);
      setEditId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providers]);

  // ===== Modal actions =====
  function openEditProvider(p: ShippingProvider) {
    setEditError(null);
    setEditId(p.id);
    setEditOpen(true);

    setForm({
      editName: p.name ?? "",
      editCode: p.code ?? "",
      editActive: !!p.active,
      editPriority: String(p.priority ?? 100),
      cName: "",
      cPhone: "",
      cEmail: "",
      cWechat: "",
      cRole: "shipping",
      cPrimary: true,
    });
  }

  function closeEditProvider() {
    setEditOpen(false);
    setEditId(null);
    setEditError(null);
    setEditSaving(false);
    setCSaving(false);
  }

  function patchForm(patch: Partial<EditProviderFormState>) {
    setForm((prev: EditProviderFormState) => ({ ...prev, ...patch }));
  }

  async function saveEditProvider() {
    if (!editId) return;

    const n = form.editName.trim();
    if (!n) {
      setEditError("公司名称不能为空");
      return;
    }

    const pr = Number(form.editPriority);
    if (!Number.isFinite(pr) || pr < 0) {
      setEditError("优先级必须是 >= 0 的数字");
      return;
    }

    setEditSaving(true);
    setEditError(null);
    try {
      await updateShippingProvider(editId, {
        name: n,
        code: form.editCode.trim() || undefined,
        active: form.editActive,
        priority: pr,
      });
      await loadProviders();
    } catch (err) {
      setEditError(getErrorMessage(err, "保存物流公司失败"));
    } finally {
      setEditSaving(false);
    }
  }

  async function createContact() {
    if (!editId) return;

    const n = form.cName.trim();
    if (!n) {
      setEditError("联系人姓名不能为空");
      return;
    }

    setCSaving(true);
    setEditError(null);
    try {
      await createShippingProviderContact(editId, {
        name: n,
        phone: form.cPhone.trim() || null,
        email: form.cEmail.trim() || null,
        wechat: form.cWechat.trim() || null,
        role: (form.cRole || "other").trim() || "other",
        is_primary: !!form.cPrimary,
        active: true,
      });
      await loadProviders();
      patchForm({
        cName: "",
        cPhone: "",
        cEmail: "",
        cWechat: "",
        cRole: "shipping",
        cPrimary: false,
      });
    } catch (err) {
      setEditError(getErrorMessage(err, "新增联系人失败"));
    } finally {
      setCSaving(false);
    }
  }

  async function setPrimary(contactId: number) {
    setCSaving(true);
    try {
      await updateShippingProviderContact(contactId, { is_primary: true });
      await loadProviders();
    } catch (err) {
      setEditError(getErrorMessage(err, "设置主联系人失败"));
    } finally {
      setCSaving(false);
    }
  }

  async function toggleContactActive(c: ShippingProviderContact) {
    setCSaving(true);
    try {
      await updateShippingProviderContact(c.id, { active: !c.active });
      await loadProviders();
    } catch (err) {
      setEditError(getErrorMessage(err, "更新联系人状态失败"));
    } finally {
      setCSaving(false);
    }
  }

  async function removeContact(contactId: number) {
    setCSaving(true);
    try {
      await deleteShippingProviderContact(contactId);
      await loadProviders();
    } catch (err) {
      setEditError(getErrorMessage(err, "删除联系人失败"));
    } finally {
      setCSaving(false);
    }
  }

  return {
    editOpen,
    editingProvider,
    busyModal,
    editSaving,
    cSaving,
    editError,
    form,
    patchForm,
    openEditProvider,
    closeEditProvider,
    saveEditProvider,
    createContact,
    setPrimary,
    toggleContactActive,
    removeContact,
  };
}
