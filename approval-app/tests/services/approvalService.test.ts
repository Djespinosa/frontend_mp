import MockAdapter from 'axios-mock-adapter';
import { httpClient } from '@mp/shared';
import { approveRequest, rejectRequest, validateApprovalLink, validateOtp } from '../../src/services/approvalService';

const mock = new MockAdapter(httpClient);

afterEach(() => mock.reset());

describe('approvalService', () => {
  it('validateApprovalLink usa los query params solicitud_id y approver_token (snake_case, tal como el validador real del backend)', async () => {
    const response = {
      valid: true,
      approverName: 'Juan',
      requestTitle: 'Compra de laptops',
      approvalStatus: 'PENDIENTE',
      otpSent: true,
    };
    mock.onGet('/approvals/validate', { params: { solicitud_id: 'req-1', approver_token: 'tok-1' } }).reply(200, response);

    const result = await validateApprovalLink('req-1', 'tok-1');

    expect(result).toEqual(response);
  });

  it('validateOtp hace POST a /approvals/otp con el payload y devuelve el approvalId del aprobador autenticado', async () => {
    const payload = { solicitudId: 'req-1', approverToken: 'tok-1', otp: '583921' };
    const response = {
      sessionToken: 'st',
      sessionExpiresIn: 600,
      approvalId: 'req-1#A2',
      request: {},
      approvals: [],
    };
    mock.onPost('/approvals/otp', payload).reply(200, response);

    const result = await validateOtp(payload);

    expect(result).toEqual(response);
    expect(result.approvalId).toBe('req-1#A2');
  });

  it('approveRequest codifica el "#" del approvalId en la URL y envía el Bearer token', async () => {
    const response = {
      approvalId: 'req-1#A2',
      status: 'FIRMADO',
      signedAt: 'now',
      signature: 'sig',
      requestStatus: 'PENDIENTE',
      signedCount: 2,
    };
    let receivedAuthHeader: string | undefined;
    mock.onPost('/approvals/req-1%23A2/approve').reply((config) => {
      receivedAuthHeader = config.headers?.Authorization as string | undefined;
      return [200, response];
    });

    const result = await approveRequest('req-1#A2', 'session-token-123');

    expect(result).toEqual(response);
    expect(receivedAuthHeader).toBe('Bearer session-token-123');
  });

  it('rejectRequest codifica el "#" del approvalId en la URL y envía el Bearer token', async () => {
    const response = { approvalId: 'req-1#A2', status: 'RECHAZADO', signedAt: 'now', requestStatus: 'RECHAZADA' };
    let receivedAuthHeader: string | undefined;
    mock.onPost('/approvals/req-1%23A2/reject').reply((config) => {
      receivedAuthHeader = config.headers?.Authorization as string | undefined;
      return [200, response];
    });

    const result = await rejectRequest('req-1#A2', 'session-token-456');

    expect(result).toEqual(response);
    expect(receivedAuthHeader).toBe('Bearer session-token-456');
  });
});
