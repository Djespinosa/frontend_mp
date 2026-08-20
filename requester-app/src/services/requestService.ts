import {
  httpClient,
  CreateRequestPayload,
  CreateRequestResponse,
  ListRequestsParams,
  ListRequestsResponse,
  RequestDetail,
} from '@mp/shared';

export async function createRequest(payload: CreateRequestPayload): Promise<CreateRequestResponse> {
  const { data } = await httpClient.post<CreateRequestResponse>('/solicitudes', payload);
  return data;
}

export async function listRequests(params: ListRequestsParams = {}): Promise<ListRequestsResponse> {
  const { data } = await httpClient.get<ListRequestsResponse>('/solicitudes', { params });
  return data;
}

export async function getRequestDetail(requestId: string): Promise<RequestDetail> {
  const { data } = await httpClient.get<RequestDetail>(`/solicitudes/${encodeURIComponent(requestId)}`);
  return data;
}
