// src/features/admin/warehouses/detail/useWarehouseDetailModel.ts
import { useEffect, useMemo, useState } from "react";
import { fetchWarehouseDetail, updateWarehouse } from "../api";
import type { WarehouseListItem } from "../types";

type UnknownRecord = Record<string, unknown>;

function isRecord(v: unknown): v is UnknownRecord {
  return typeof v === "object" && v !== null;
}

function toHumanError(e: unknown, fallback: string): string {
  if (!e) return fallback;
  if (typeof e === "string") return e;
  if (e instanceof Error && e.message) return e.message;
  if (isRecord(e) && typeof e.message === "string") return e.message;
  return fallback;
}

export function useWarehouseDetailModel(args: { warehouseId: number; canWrite: boolean }) {
  const { warehouseId, canWrite } = args;

  const [detail, setDetail] = useState<WarehouseListItem | null>(null);
  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // form fields
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [active, setActive] = useState(true);

  const [address, setAddress] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [areaSqm, setAreaSqm] = useState<string>("");

  const dirtyKey = useMemo(
    () => [name, code, active, address, contactName, contactPhone, areaSqm].join("|"),
    [name, code, active, address, contactName, contactPhone, areaSqm],
  );

  // load
  useEffect(() => {
    if (!warehouseId) return;

    setLoading(true);
    setError(null);
    setSaveOk(false);

    fetchWarehouseDetail(warehouseId)
      .then((data) => {
        setDetail(data);

        setName(data.name);
        setCode(data.code || "");
        setActive(data.active);

        setAddress(data.address || "");
        setContactName(data.contact_name || "");
        setContactPhone(data.contact_phone || "");
        setAreaSqm(
          typeof data.area_sqm === "number" && !Number.isNaN(data.area_sqm) ? String(data.area_sqm) : "",
        );
      })
      .catch((err: unknown) => {
        setError(toHumanError(err, "加载仓库失败"));
        setDetail(null);
      })
      .finally(() => setLoading(false));
  }, [warehouseId]);

  // hide ok when editing
  useEffect(() => {
    if (!saveOk) return;
    setSaveOk(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirtyKey]);

  async function save() {
    if (!detail) return;
    if (!canWrite) return;

    const trimmedName = name.trim();
    const trimmedCode = code.trim();

    if (!trimmedName) {
      setError("仓库名称不能为空");
      return;
    }
    if (!trimmedCode) {
      setError("仓库编码不能为空（必填）");
      return;
    }

    setSaving(true);
    setSaveOk(false);
    setError(null);

    try {
      const parsedArea = areaSqm.trim() === "" ? null : Number(areaSqm.trim());
      if (parsedArea !== null && (!Number.isFinite(parsedArea) || parsedArea < 0)) {
        setError("仓库面积必须是 >= 0 的数字");
        setSaving(false);
        return;
      }

      const updated = await updateWarehouse(detail.id, {
        name: trimmedName,
        code: trimmedCode,
        active,
        address: address.trim() ? address.trim() : null,
        contact_name: contactName.trim() ? contactName.trim() : null,
        contact_phone: contactPhone.trim() ? contactPhone.trim() : null,
        area_sqm: parsedArea,
      });

      setDetail(updated);
      setSaveOk(true);
    } catch (err: unknown) {
      setError(toHumanError(err, "保存失败"));
    } finally {
      setSaving(false);
    }
  }

  return {
    // data
    detail,
    loading,
    error,

    // status
    saving,
    saveOk,

    // form
    name,
    setName,
    code,
    setCode,
    active,
    setActive,
    address,
    setAddress,
    contactName,
    setContactName,
    contactPhone,
    setContactPhone,
    areaSqm,
    setAreaSqm,

    // actions
    setError,
    setSaveOk,
    save,
  };
}
