import MockAdapter from 'axios-mock-adapter';
import { httpClient, CreateRequestPayload } from '@mp/shared';
import { createRequest, getRequestDetail, listRequests } from '../../src/services/requestService';

const mock = new MockAdapter(httpClient);

afterEach(() => mock.reset());

describe('requestService', () => {
  it('createRequest hace POST a /solicitudes con el payload y devuelve la respuesta', async () => {
    const payload: CreateRequestPayload = {
      title: 'Compra de laptops',
      description: 'desc',
      amount: 1000,
      requester: { name: 'Laura' },
      approvers: [
        { name: 'Juan', email: 'juan@example.com', role: 'Gerente' },
        { name: 'Ana', email: 'ana@example.com', role: 'Finanzas' },
        { name: 'Carlos', email: 'carlos@example.com', role: 'Compras' },
      ],
    };
    const response = { requestId: 'req-1', status: 'PENDIENTE', createdAt: 'now', approvals: [] };
    mock.onPost('/solicitudes', payload).reply(201, response);

    const result = await createRequest(payload);

    expect(result).toEqual(response);
  });

  it('listRequests hace GET a /solicitudes con limit/cursor como query params', async () => {
    const response = { items: [], nextCursor: null };
    mock.onGet('/solicitudes', { params: { limit: 10, cursor: 'abc' } }).reply(200, response);

    const result = await listRequests({ limit: 10, cursor: 'abc' });

    expect(result).toEqual(response);
  });

  it('listRequests funciona sin parámetros', async () => {
    const response = { items: [], nextCursor: null };
    mock.onGet('/solicitudes', { params: {} }).reply(200, response);

    const result = await listRequests();

    expect(result).toEqual(response);
  });

  it('getRequestDetail codifica el id en la URL', async () => {
    const response = { requestId: 'req-1', approvals: [] };
    mock.onGet('/solicitudes/req-1').reply(200, response);

    const result = await getRequestDetail('req-1');

    expect(result).toEqual(response);
  });
});
