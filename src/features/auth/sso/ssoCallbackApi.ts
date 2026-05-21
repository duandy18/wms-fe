import { apiPost } from "../../../lib/api";

export interface WmsSsoExchangeIn {
  code: string;
  state: string;
}

export interface WmsSsoExchangeOut {
  access_token: string;
  token_type: string;
  expires_in: number;
  redirect_path: string;
}

export async function exchangeWmsSsoAuthorizationCode(
  payload: WmsSsoExchangeIn,
): Promise<WmsSsoExchangeOut> {
  return apiPost<WmsSsoExchangeOut>("/system/sso/v1/exchange", payload);
}
