// src/features/shipment/domain/shipmentStatus.ts

export type ShipmentStatus =
  | "IN_TRANSIT"
  | "DELIVERED"
  | "LOST"
  | "RETURNED";

export const SHIPMENT_STATUS_LABEL: Record<ShipmentStatus, string> = {
  IN_TRANSIT: "运输中",
  DELIVERED: "已签收",
  LOST: "丢失",
  RETURNED: "已退回",
};

export const SHIPMENT_TERMINAL_STATUSES: ShipmentStatus[] = [
  "DELIVERED",
  "LOST",
  "RETURNED",
];

export function normalizeShipmentStatus(
  status: string | null | undefined,
): ShipmentStatus | null {
  if (!status) return null;
  const key = status.toUpperCase();
  if (
    key === "IN_TRANSIT" ||
    key === "DELIVERED" ||
    key === "LOST" ||
    key === "RETURNED"
  ) {
    return key;
  }
  return null;
}

export function getShipmentStatusLabel(
  status: string | null | undefined,
): string {
  const normalized = normalizeShipmentStatus(status);
  if (!normalized) return status || "未知";
  return SHIPMENT_STATUS_LABEL[normalized];
}

export function getShipmentStatusBadgeClass(
  status: string | null | undefined,
): string {
  const normalized = normalizeShipmentStatus(status);
  switch (normalized) {
    case "DELIVERED":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "IN_TRANSIT":
      return "bg-sky-100 text-sky-700 border-sky-200";
    case "LOST":
      return "bg-rose-100 text-rose-700 border-rose-200";
    case "RETURNED":
      return "bg-amber-100 text-amber-700 border-amber-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

export function isShipmentTerminalStatus(
  status: string | null | undefined,
): boolean {
  const normalized = normalizeShipmentStatus(status);
  if (!normalized) return false;
  return SHIPMENT_TERMINAL_STATUSES.includes(normalized);
}

export function getAllowedNextShipmentStatuses(
  currentStatus: string | null | undefined,
): ShipmentStatus[] {
  const normalized = normalizeShipmentStatus(currentStatus);
  if (normalized === "IN_TRANSIT") {
    return ["DELIVERED", "LOST", "RETURNED"];
  }
  return [];
}

export function isShipmentDelivered(
  status: string | null | undefined,
): boolean {
  return normalizeShipmentStatus(status) === "DELIVERED";
}
