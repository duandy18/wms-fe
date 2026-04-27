import { poiRequest } from "./http";
import type {
  MockAuthorizeInput,
  MockAuthorizeResult,
  MockClearInput,
  MockClearResult,
  MockIngestInput,
  MockIngestResult,
} from "../contracts/mock";

export async function mockAuthorizePlatformStore(
  storeId: number,
  input: MockAuthorizeInput,
): Promise<MockAuthorizeResult> {
  return poiRequest<MockAuthorizeResult>(
    `/oms/platform-order-ingestion/mock/stores/${storeId}/authorize`,
    {
      method: "POST",
      body: input,
      ctx: "POST /oms/platform-order-ingestion/mock/stores/{store_id}/authorize",
    },
  );
}

export async function mockIngestPlatformOrders(
  storeId: number,
  input: MockIngestInput,
): Promise<MockIngestResult> {
  return poiRequest<MockIngestResult>(
    `/oms/platform-order-ingestion/mock/stores/${storeId}/orders/ingest`,
    {
      method: "POST",
      body: input,
      ctx: "POST /oms/platform-order-ingestion/mock/stores/{store_id}/orders/ingest",
    },
  );
}

export async function mockClearPlatformOrders(
  storeId: number,
  input: MockClearInput,
): Promise<MockClearResult> {
  return poiRequest<MockClearResult>(
    `/oms/platform-order-ingestion/mock/stores/${storeId}/orders`,
    {
      method: "DELETE",
      body: input,
      ctx: "DELETE /oms/platform-order-ingestion/mock/stores/{store_id}/orders",
    },
  );
}
