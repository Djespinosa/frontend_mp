import { httpClient, CreateRequestPayload, CreateRequestResponse, ListRequestsParams, ListRequestsResponse } from '@mp/shared';

export async function createRequest(payload: CreateRequestPayload): Promise<CreateRequestResponse> {
  const { data } = await httpClient.post<CreateRequestResponse>('/solicitudes', payload);
  return data;
}

export async function listRequests(params: ListRequestsParams = {}): Promise<ListRequestsResponse> {
  const { data } = await httpClient.get<ListRequestsResponse>('/solicitudes', { params });
  return data;
}

// getRequestDetail vive en @mp/shared: también lo usa approval-app para
// refrescar el estado de los otros aprobadores sin duplicar la llamada HTTP.
export { getRequestDetail } from '@mp/shared';
