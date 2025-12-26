// src/features/admin/shipping-providers/hooks/useEditProviderModal.ts
import { useEffect, useMemo, useRef, useState } from "react";
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

const EMPTY_FORM: EditProviderFormState = {
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
};

export function useEditProviderModal(args: {
  providers: ShippingProvider[];
  loadProviders: () => Promise<ShippingProvider[]>;
}) {
  const { providers, loadProviders } = args;

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  function safe<T>(fn: () => T): T | undefined {
    if (!mountedRef.current) return undefined;
    return fn();
  }

  // ===== Provider 编辑弹窗（modal state）=====
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [editSaving, setEditSaving] = useState(false);
  const [cSaving, setCSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [form, setForm] = useState<EditProviderFormState>(EMPTY_FORM);

  const editingProvider = useMemo(
    () => (editId ? providers.find((p) => p.id === editId) ?? null : null),
    [providers, editId],
  );

  const busyModal = editSaving || cSaving;

  // 当 providers 变化时，校验 editId 是否还存在（保持原行为）
  useEffect(() => {
    if (editId && !providers.some((p) => p.id === editId)) {
      safe(() => setEditOpen(false));
      safe(() => setEditId(null));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providers]);

  // ===== Modal actions =====
  function openEditProvider(p: ShippingProvider) {
    safe(() => setEditError(null));
    safe(() => setEditId(p.id));
    safe(() => setEditOpen(true));

    safe(() =>
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
      }),
    );
  }

  function closeEditProvider() {
    safe(() => setEditOpen(false));
    safe(() => setEditId(null));
    safe(() => setEditError(null));
    safe(() => setEditSaving(false));
    safe(() => setCSaving(false));
    safe(() => setForm(EMPTY_FORM));
  }

  function patchForm(patch: Partial<EditProviderFormState>) {
    safe(() => setForm((prev) => ({ ...prev, ...patch })));
  }

  async function saveEditProvider() {
    if (!editId) return;
    if (busyModal) return;

    const n = form.editName.trim();
    if (!n) {
      safe(() => setEditError("公司名称不能为空"));
      return;
    }

    const pr = Number(form.editPriority);
    if (!Number.isFinite(pr) || pr < 0) {
      safe(() => setEditError("优先级必须是 >= 0 的数字"));
      return;
    }

    safe(() => setEditSaving(true));
    safe(() => setEditError(null));
    try {
      await updateShippingProvider(editId, {
        name: n,
        code: form.editCode.trim() || undefined,
        active: form.editActive,
        priority: pr,
      });
      await loadProviders();
    } catch (err) {
      safe(() => setEditError(getErrorMessage(err, "保存物流公司失败")));
    } finally {
      safe(() => setEditSaving(false));
    }
  }

  async function createContact() {
    if (!editId) return;
    if (busyModal) return;

    const n = form.cName.trim();
    if (!n) {
      safe(() => setEditError("联系人姓名不能为空"));
      return;
    }

    safe(() => setCSaving(true));
    safe(() => setEditError(null));
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
      safe(() => setEditError(getErrorMessage(err, "新增联系人失败")));
    } finally {
      safe(() => setCSaving(false));
    }
  }

  async function setPrimary(contactId: number) {
    if (busyModal) return;

    safe(() => setCSaving(true));
    safe(() => setEditError(null));
    try {
      await updateShippingProviderContact(contactId, { is_primary: true });
      await loadProviders();
    } catch (err) {
      safe(() => setEditError(getErrorMessage(err, "设置主联系人失败")));
    } finally {
      safe(() => setCSaving(false));
    }
  }

  async function toggleContactActive(c: ShippingProviderContact) {
    if (busyModal) return;

    safe(() => setCSaving(true));
    safe(() => setEditError(null));
    try {
      await updateShippingProviderContact(c.id, { active: !c.active });
      await loadProviders();
    } catch (err) {
      safe(() => setEditError(getErrorMessage(err, "更新联系人状态失败")));
    } finally {
      safe(() => setCSaving(false));
    }
  }

  async function removeContact(contactId: number) {
    if (busyModal) return;

    safe(() => setCSaving(true));
    safe(() => setEditError(null));
    try {
      await deleteShippingProviderContact(contactId);
      await loadProviders();
    } catch (err) {
      safe(() => setEditError(getErrorMessage(err, "删除联系人失败")));
    } finally {
      safe(() => setCSaving(false));
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
