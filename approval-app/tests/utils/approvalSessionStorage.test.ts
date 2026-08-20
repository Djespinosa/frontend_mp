import {
  clearApprovalSession,
  loadApprovalSession,
  saveApprovalSession,
} from '../../src/utils/approvalSessionStorage';
import { ValidateOtpResponse } from '@mp/shared';

const response: ValidateOtpResponse = {
  sessionToken: 'session-token-123',
  sessionExpiresIn: 600,
  approvalId: 'req-1#A1',
  request: {
    requestId: 'req-1',
    title: 'Compra de laptops',
    description: 'desc',
    amount: 1000,
    requesterName: 'Laura',
    createdAt: '2026-08-19T14:00:00.000Z',
  },
  approvals: [],
};

describe('approvalSessionStorage', () => {
  beforeEach(() => window.sessionStorage.clear());

  it('devuelve null si no hay nada guardado', () => {
    expect(loadApprovalSession('req-1', 'tok-1')).toBeNull();
  });

  it('guarda y recupera la sesión para el requestId+approverToken correctos', () => {
    saveApprovalSession('req-1', 'tok-1', response);

    expect(loadApprovalSession('req-1', 'tok-1')).toEqual(response);
  });

  it('no mezcla sesiones de distintos approverToken para el mismo requestId', () => {
    saveApprovalSession('req-1', 'tok-1', response);

    expect(loadApprovalSession('req-1', 'tok-2')).toBeNull();
  });

  it('devuelve null y limpia la entrada si la sesión ya expiró', () => {
    jest.spyOn(Date, 'now').mockReturnValue(1_000_000);
    saveApprovalSession('req-1', 'tok-1', response); // expira en 1_000_000 + 600_000

    jest.spyOn(Date, 'now').mockReturnValue(1_000_000 + 600_001);
    expect(loadApprovalSession('req-1', 'tok-1')).toBeNull();

    jest.spyOn(Date, 'now').mockReturnValue(1_000_000); // aunque "vuelva" el tiempo, ya se limpió
    expect(loadApprovalSession('req-1', 'tok-1')).toBeNull();

    jest.restoreAllMocks();
  });

  it('clearApprovalSession elimina la entrada explícitamente', () => {
    saveApprovalSession('req-1', 'tok-1', response);
    clearApprovalSession('req-1', 'tok-1');

    expect(loadApprovalSession('req-1', 'tok-1')).toBeNull();
  });
});
