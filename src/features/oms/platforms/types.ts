// src/features/oms/platforms/types.ts

export type PlatformAuthSource = "NONE" | "MANUAL" | "OAUTH";

export interface PlatformAuthStatus {
  store_id: number;
  platform: string;
  shop_id: string;
  auth_source: PlatformAuthSource;
  expires_at: string | null;
  mall_id: string | null;
}

export interface PlatformIntegrationListItem {
  store_id: number;
  platform: string;
  shop_id: string;
  store_name: string;
  active: boolean;
  shop_type: "TEST" | "PROD" | string;
  auth_source: PlatformAuthSource;
  expires_at: string | null;
  mall_id: string | null;
}

export interface PlatformIntegrationSummary {
  store_id: number;
  platform: string;
  shop_id: string;
  store_name: string;
  active: boolean;
  shop_type: "TEST" | "PROD" | string;
}

export interface PlatformIntegrationContact {
  email: string | null;
  contact_name: string | null;
  contact_phone: string | null;
}

export interface PlatformIntegrationAuth {
  auth_source: PlatformAuthSource;
  expires_at: string | null;
}

export interface PlatformIntegrationIdentity {
  mall_id: string | null;
  confirmed: boolean;
}

export interface PlatformIntegrationPullStatus {
  ready: boolean;
  message: string;
}

export interface PlatformIntegrationDetail {
  summary: PlatformIntegrationSummary;
  contact: PlatformIntegrationContact;
  auth: PlatformIntegrationAuth;
  identity: PlatformIntegrationIdentity;
  pull_status: PlatformIntegrationPullStatus;
}

export interface SavePlatformCredentialInput {
  platform: string;
  shopId: string;
  accessToken: string;
}
