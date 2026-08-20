import MockAdapter from 'axios-mock-adapter';
import { httpClient } from '@mp/shared';
import { getEvidenceUrl } from '../../src/services/evidenceService';

const mock = new MockAdapter(httpClient);

afterEach(() => mock.reset());

describe('evidenceService.getEvidenceUrl', () => {
  it('hace GET a /solicitudes/{id}/evidencia.pdf y devuelve la URL prefirmada', async () => {
    const response = { url: 'https://s3.example.com/signed', expiresIn: 300 };
    mock.onGet('/solicitudes/req-1/evidencia.pdf').reply(200, response);

    const result = await getEvidenceUrl('req-1');

    expect(result).toEqual(response);
  });
});
