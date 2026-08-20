import { httpClient, EvidenceUrlResponse } from '@mp/shared';

export async function getEvidenceUrl(requestId: string): Promise<EvidenceUrlResponse> {
  const { data } = await httpClient.get<EvidenceUrlResponse>(
    `/solicitudes/${encodeURIComponent(requestId)}/evidencia.pdf`
  );
  return data;
}
