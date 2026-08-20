import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ApprovalFlowPage } from '../../src/pages/ApprovalFlowPage';
import { ApiError, ValidateOtpResponse } from '@mp/shared';
import { loadApprovalSession, saveApprovalSession } from '../../src/utils/approvalSessionStorage';

const validateApprovalLinkMock = jest.fn();
const validateOtpMock = jest.fn();
const approveRequestMock = jest.fn();
const rejectRequestMock = jest.fn();

jest.mock('../../src/services/approvalService', () => ({
  validateApprovalLink: (...args: unknown[]) => validateApprovalLinkMock(...args),
  validateOtp: (...args: unknown[]) => validateOtpMock(...args),
  approveRequest: (...args: unknown[]) => approveRequestMock(...args),
  rejectRequest: (...args: unknown[]) => rejectRequestMock(...args),
}));

const REQUEST_ID = '8f14e45f-ceea-4c1f-9c2a-1a2b3c4d5e6f';
const APPROVER_TOKEN = 'approver-token-abc';

function renderPage(search = `?solicitud_id=${REQUEST_ID}&approver_token=${APPROVER_TOKEN}`) {
  render(
    <MemoryRouter initialEntries={[`/approve${search}`]}>
      <ApprovalFlowPage />
    </MemoryRouter>
  );
}

const validateOtpResponse: ValidateOtpResponse = {
  sessionToken: 'session-token-123',
  sessionExpiresIn: 600,
  approvalId: `${REQUEST_ID}#A2`,
  request: {
    requestId: REQUEST_ID,
    title: 'Compra de laptops',
    description: 'Laptops para el equipo',
    amount: 1000,
    requesterName: 'Laura Martínez',
    createdAt: '2026-08-19T14:00:00.000Z',
  },
  approvals: [
    { approvalId: `${REQUEST_ID}#A1`, approverName: 'Juan Pérez', role: 'Gerente', status: 'PENDIENTE' },
    { approvalId: `${REQUEST_ID}#A2`, approverName: 'Ana Gómez', role: 'Finanzas', status: 'PENDIENTE' },
    { approvalId: `${REQUEST_ID}#A3`, approverName: 'Carlos Ruiz', role: 'Compras', status: 'PENDIENTE' },
  ],
};

async function fillAndSubmitOtp(code = '583921') {
  await waitFor(() => expect(screen.getByLabelText('Código de verificación')).toBeInTheDocument());
  fireEvent.change(screen.getByLabelText('Código de verificación'), { target: { value: code } });
  fireEvent.click(screen.getByRole('button', { name: 'Validar código' }));
}

describe('ApprovalFlowPage', () => {
  beforeEach(() => {
    validateApprovalLinkMock.mockReset();
    validateOtpMock.mockReset();
    approveRequestMock.mockReset();
    rejectRequestMock.mockReset();
    window.sessionStorage.clear();
  });

  it('muestra un mensaje claro y no continúa si faltan los parámetros de la URL', () => {
    renderPage('');

    expect(screen.getByRole('alert')).toHaveTextContent('El enlace no incluye los parámetros necesarios.');
    expect(validateApprovalLinkMock).not.toHaveBeenCalled();
  });

  it('muestra un mensaje claro si el token/enlace es inválido y no permite continuar', async () => {
    validateApprovalLinkMock.mockRejectedValue(new ApiError(404, 'INVALID_LINK', 'no matchea'));

    renderPage();

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('El enlace no es válido.'));
    expect(screen.queryByLabelText('Código de verificación')).not.toBeInTheDocument();
  });

  it('muestra un error genérico ante una falla 500 al validar el enlace', async () => {
    validateApprovalLinkMock.mockRejectedValue(new ApiError(500, 'INTERNAL_ERROR', 'boom'));

    renderPage();

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Ocurrió un error, intenta nuevamente.'));
  });

  it('muestra un error de red si la validación del enlace falla por conexión', async () => {
    validateApprovalLinkMock.mockRejectedValue(new ApiError(0, 'NETWORK_ERROR', 'sin conexión'));

    renderPage();

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('No se pudo conectar con el servidor.')
    );
  });

  it('muestra el formulario de OTP cuando el enlace es válido', async () => {
    validateApprovalLinkMock.mockResolvedValue({
      valid: true,
      approverName: 'Ana Gómez',
      requestTitle: 'Compra de laptops',
      approvalStatus: 'PENDIENTE',
      otpSent: true,
    });

    renderPage();

    await waitFor(() => expect(screen.getByText(/Hola Ana Gómez/)).toBeInTheDocument());
    expect(validateApprovalLinkMock).toHaveBeenCalledWith(REQUEST_ID, APPROVER_TOKEN);
  });

  it('muestra el error de OTP incorrecto y permite reintentar', async () => {
    validateApprovalLinkMock.mockResolvedValue({
      valid: true,
      approverName: 'Ana Gómez',
      requestTitle: 'Compra de laptops',
      approvalStatus: 'PENDIENTE',
      otpSent: true,
    });
    validateOtpMock.mockRejectedValue(new ApiError(401, 'INVALID_OTP', 'incorrecto'));

    renderPage();
    await fillAndSubmitOtp();

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Código incorrecto.'));
    expect(screen.getByLabelText('Código de verificación')).toBeInTheDocument();
  });

  it('muestra el error de OTP expirado y permite solicitar un nuevo código', async () => {
    validateApprovalLinkMock.mockResolvedValue({
      valid: true,
      approverName: 'Ana Gómez',
      requestTitle: 'Compra de laptops',
      approvalStatus: 'PENDIENTE',
      otpSent: true,
    });
    validateOtpMock.mockRejectedValue(new ApiError(410, 'OTP_EXPIRED', 'expirado'));

    renderPage();
    await fillAndSubmitOtp();

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('El código expiró, solicita uno nuevo.')
    );

    fireEvent.click(screen.getByRole('button', { name: 'Solicitar un nuevo código' }));

    await waitFor(() => expect(screen.getByLabelText('Código de verificación')).toBeInTheDocument());
    expect(validateApprovalLinkMock).toHaveBeenCalledTimes(2);
  });

  it('valida el OTP correctamente, guarda la sesión y muestra el detalle completo', async () => {
    validateApprovalLinkMock.mockResolvedValue({
      valid: true,
      approverName: 'Ana Gómez',
      requestTitle: 'Compra de laptops',
      approvalStatus: 'PENDIENTE',
      otpSent: true,
    });
    validateOtpMock.mockResolvedValue(validateOtpResponse);

    renderPage();
    await fillAndSubmitOtp();

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Compra de laptops' })).toBeInTheDocument());
    expect(screen.getByText('Laura Martínez')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Aprobar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Rechazar' })).toBeInTheDocument();

    expect(loadApprovalSession(REQUEST_ID, APPROVER_TOKEN)).toEqual(validateOtpResponse);
  });

  it('retoma la sesión guardada en sessionStorage sin volver a validar el enlace', async () => {
    saveApprovalSession(REQUEST_ID, APPROVER_TOKEN, validateOtpResponse);

    renderPage();

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Compra de laptops' })).toBeInTheDocument());
    expect(validateApprovalLinkMock).not.toHaveBeenCalled();
  });

  it('aprueba correctamente, bloquea los botones y muestra el resultado y el estado actualizado', async () => {
    saveApprovalSession(REQUEST_ID, APPROVER_TOKEN, validateOtpResponse);
    approveRequestMock.mockResolvedValue({
      approvalId: `${REQUEST_ID}#A2`,
      status: 'FIRMADO',
      signedAt: '2026-08-19T15:00:00.000Z',
      signature: 'Firmado digitalmente por Ana Gómez',
      requestStatus: 'PENDIENTE',
      signedCount: 2,
    });

    renderPage();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Aprobar' })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Aprobar' }));

    await waitFor(() => expect(screen.getByText('Aprobaste esta solicitud correctamente.')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Aprobar' })).not.toBeInTheDocument();
    expect(approveRequestMock).toHaveBeenCalledWith(`${REQUEST_ID}#A2`, 'session-token-123');
    expect(loadApprovalSession(REQUEST_ID, APPROVER_TOKEN)).toBeNull();
  });

  it('rechaza correctamente y muestra el resultado', async () => {
    saveApprovalSession(REQUEST_ID, APPROVER_TOKEN, validateOtpResponse);
    rejectRequestMock.mockResolvedValue({
      approvalId: `${REQUEST_ID}#A2`,
      status: 'RECHAZADO',
      signedAt: '2026-08-19T15:00:00.000Z',
      requestStatus: 'RECHAZADA',
    });

    renderPage();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Rechazar' })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Rechazar' }));

    await waitFor(() => expect(screen.getByText('Rechazaste esta solicitud.')).toBeInTheDocument());
  });

  it('muestra un error si la solicitud ya fue aprobada/rechazada previamente (409)', async () => {
    saveApprovalSession(REQUEST_ID, APPROVER_TOKEN, validateOtpResponse);
    approveRequestMock.mockRejectedValue(new ApiError(409, 'APPROVAL_ALREADY_CLOSED', 'ya cerrada'));

    renderPage();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Aprobar' })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Aprobar' }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Esta aprobación ya fue procesada.')
    );
  });

  it('si la sesión expiró (401) al aprobar, vuelve a la pantalla de OTP', async () => {
    saveApprovalSession(REQUEST_ID, APPROVER_TOKEN, validateOtpResponse);
    approveRequestMock.mockRejectedValue(new ApiError(401, 'INVALID_SESSION', 'expirada'));

    renderPage();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Aprobar' })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Aprobar' }));

    await waitFor(() => expect(screen.getByLabelText('Código de verificación')).toBeInTheDocument());
    expect(loadApprovalSession(REQUEST_ID, APPROVER_TOKEN)).toBeNull();
  });
});
