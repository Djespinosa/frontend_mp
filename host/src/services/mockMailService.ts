import { httpClient, MockMailMessage } from '@mp/shared';

export async function listMail(requestId?: string): Promise<MockMailMessage[]> {
  const { data } = await httpClient.get<MockMailMessage[]>('/mock-mail', {
    params: requestId ? { requestId } : undefined,
  });
  return data;
}
