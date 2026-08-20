import { render, screen } from '@testing-library/react';
import { ApprovalDetailScreen } from '../../src/components/ApprovalDetailScreen';
import { ValidateOtpResponse } from '@mp/shared';

const response: ValidateOtpResponse = {
  sessionToken: 'st',
  sessionExpiresIn: 600,
  approvalId: 'req-1#A1',
  request: {
    requestId: 'req-1',
    title: 'Compra de laptops',
    description: 'Laptops para el equipo',
    amount: 1000,
    requesterName: 'Laura Martínez',
    createdAt: '2026-08-19T14:00:00.000Z',
  },
  approvals: [
    { approvalId: 'req-1#A1', approverName: 'Juan Pérez', role: 'Gerente', status: 'PENDIENTE' },
    { approvalId: 'req-1#A2', approverName: 'Ana Gómez', role: 'Finanzas', status: 'PENDIENTE' },
    { approvalId: 'req-1#A3', approverName: 'Carlos Ruiz', role: 'Compras', status: 'FIRMADO' },
  ],
};

describe('ApprovalDetailScreen', () => {
  it('muestra los datos completos de la solicitud y los tres aprobadores', () => {
    render(
      <ApprovalDetailScreen
        response={response}
        actionResult={null}
        onApprove={jest.fn()}
        onReject={jest.fn()}
        approveStatus="idle"
        rejectStatus="idle"
        approveError={null}
        rejectError={null}
      />
    );

    expect(screen.getByRole('heading', { name: 'Compra de laptops' })).toBeInTheDocument();
    expect(screen.getByText('Laptops para el equipo')).toBeInTheDocument();
    expect(screen.getByText('1000')).toBeInTheDocument();
    expect(screen.getByText('Laura Martínez')).toBeInTheDocument();
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('Ana Gómez')).toBeInTheDocument();
    expect(screen.getByText('Carlos Ruiz')).toBeInTheDocument();
  });

  it('muestra los botones Aprobar y Rechazar cuando no hay resultado de acción', () => {
    render(
      <ApprovalDetailScreen
        response={response}
        actionResult={null}
        onApprove={jest.fn()}
        onReject={jest.fn()}
        approveStatus="idle"
        rejectStatus="idle"
        approveError={null}
        rejectError={null}
      />
    );

    expect(screen.getByRole('button', { name: 'Aprobar' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Rechazar' })).toBeEnabled();
  });

  it('deshabilita ambos botones mientras se está aprobando o rechazando', () => {
    render(
      <ApprovalDetailScreen
        response={response}
        actionResult={null}
        onApprove={jest.fn()}
        onReject={jest.fn()}
        approveStatus="loading"
        rejectStatus="idle"
        approveError={null}
        rejectError={null}
      />
    );

    expect(screen.getByRole('button', { name: 'Aprobando...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Rechazar' })).toBeDisabled();
  });

  it('tras un resultado de aprobación, oculta los botones y muestra el resultado', () => {
    render(
      <ApprovalDetailScreen
        response={response}
        actionResult={{
          approvalId: 'req-1#A1',
          status: 'FIRMADO',
          signedAt: '2026-08-19T15:00:00.000Z',
          signature: 'Firmado digitalmente por Juan Pérez',
          requestStatus: 'PENDIENTE',
          signedCount: 2,
        }}
        onApprove={jest.fn()}
        onReject={jest.fn()}
        approveStatus="success"
        rejectStatus="idle"
        approveError={null}
        rejectError={null}
      />
    );

    expect(screen.queryByRole('button', { name: 'Aprobar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Rechazar' })).not.toBeInTheDocument();
    expect(screen.getByText('Aprobaste esta solicitud correctamente.')).toBeInTheDocument();
  });

  it('tras un resultado de rechazo, muestra el mensaje de rechazo y el estado RECHAZADA', () => {
    render(
      <ApprovalDetailScreen
        response={response}
        actionResult={{
          approvalId: 'req-1#A1',
          status: 'RECHAZADO',
          signedAt: '2026-08-19T15:00:00.000Z',
          requestStatus: 'RECHAZADA',
        }}
        onApprove={jest.fn()}
        onReject={jest.fn()}
        approveStatus="idle"
        rejectStatus="success"
        approveError={null}
        rejectError={null}
      />
    );

    expect(screen.getByText('Rechazaste esta solicitud.')).toBeInTheDocument();
    expect(screen.getByText('Rechazada')).toBeInTheDocument();
  });

  it('muestra los mensajes de error de aprobar/rechazar cuando existen', () => {
    render(
      <ApprovalDetailScreen
        response={response}
        actionResult={null}
        onApprove={jest.fn()}
        onReject={jest.fn()}
        approveStatus="error"
        rejectStatus="idle"
        approveError="Esta aprobación ya fue procesada."
        rejectError={null}
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Esta aprobación ya fue procesada.');
  });
});
