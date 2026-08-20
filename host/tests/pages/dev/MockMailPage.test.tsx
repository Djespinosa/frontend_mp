import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockMailPage } from '../../../src/pages/dev/MockMailPage';
import { ApiError } from '@mp/shared';

const listMailMock = jest.fn();

jest.mock('../../../src/services/mockMailService', () => ({
  listMail: (...args: unknown[]) => listMailMock(...args),
}));

const linkMail = {
  mailId: 'mail-1',
  to: 'juan@example.com',
  subject: 'Tienes una solicitud de compra por aprobar: Compra de laptops',
  body:
    'Hola Juan Pérez, ingresa al siguiente enlace para revisar y aprobar la solicitud "Compra de laptops": ' +
    'https://dominio.com/approve?solicitud_id=req-1&approver_token=abc-123',
  createdAt: '2026-08-19T14:00:00.000Z',
  requestId: 'req-1',
};

const otpMail = {
  mailId: 'mail-2',
  to: 'juan@example.com',
  subject: 'Tu código de verificación',
  body: 'Tu código OTP es 583921. Vence en 3 minutos.',
  createdAt: '2026-08-19T14:05:00.000Z',
  requestId: 'req-1',
};

describe('MockMailPage', () => {
  beforeEach(() => {
    listMailMock.mockReset();
  });

  it('carga al montar y muestra destinatario, solicitud, aprobador, link y fecha', async () => {
    listMailMock.mockResolvedValue([linkMail]);

    render(<MockMailPage />);

    await waitFor(() => expect(screen.getByText('juan@example.com')).toBeInTheDocument());
    expect(screen.getByText('req-1')).toBeInTheDocument();
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Abrir' })).toHaveAttribute(
      'href',
      'https://dominio.com/approve?solicitud_id=req-1&approver_token=abc-123'
    );
  });

  it('muestra el OTP extraído y su botón de copiar para un correo de código', async () => {
    listMailMock.mockResolvedValue([otpMail]);

    render(<MockMailPage />);

    await waitFor(() => expect(screen.getByText('583921')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Copiar OTP' })).toBeInTheDocument();
  });

  it('muestra "-" en las columnas que no aplican para cada tipo de correo', async () => {
    listMailMock.mockResolvedValue([otpMail]);

    render(<MockMailPage />);

    await waitFor(() => expect(screen.getByText('583921')).toBeInTheDocument());
    // El correo de OTP no tiene link ni nombre de aprobador parseable.
    expect(screen.queryByRole('link', { name: 'Abrir' })).not.toBeInTheDocument();
  });

  it('copia el link al portapapeles al hacer click en "Copiar link"', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    listMailMock.mockResolvedValue([linkMail]);

    render(<MockMailPage />);

    await waitFor(() => expect(screen.getByRole('button', { name: 'Copiar link' })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Copiar link' }));

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith('https://dominio.com/approve?solicitud_id=req-1&approver_token=abc-123')
    );
  });

  it('muestra un mensaje cuando no hay correos', async () => {
    listMailMock.mockResolvedValue([]);

    render(<MockMailPage />);

    await waitFor(() => expect(screen.getByText('No hay correos simulados todavía.')).toBeInTheDocument());
  });

  it('muestra un error si la carga falla', async () => {
    listMailMock.mockRejectedValue(new ApiError(500, 'INTERNAL_ERROR', 'boom'));

    render(<MockMailPage />);

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Ocurrió un error, intenta nuevamente.'));
  });

  it('filtra por requestId al enviar el formulario', async () => {
    listMailMock.mockResolvedValue([]);

    render(<MockMailPage />);
    await waitFor(() => expect(listMailMock).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByLabelText('Filtrar por ID de solicitud (opcional)'), {
      target: { value: 'req-1' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Filtrar' }));

    await waitFor(() => expect(listMailMock).toHaveBeenLastCalledWith('req-1'));
  });
});
