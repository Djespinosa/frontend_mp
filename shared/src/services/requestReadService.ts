import { httpClient } from './httpClient';
import { RequestDetail } from '../types';

export async function getRequestDetail(requestId: string): Promise<RequestDetail> {
  const { data } = await httpClient.get<RequestDetail>(`/solicitudes/${encodeURIComponent(requestId)}`);
  return data;
}
