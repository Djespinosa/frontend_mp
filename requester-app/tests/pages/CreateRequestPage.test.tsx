import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { CreateRequestPage } from '../../src/pages/CreateRequestPage';
import { ApiError } from '@mp/shared';

const createRequestMock = jest.fn();

jest.mock('../../src/services/requestService', () => ({
  createRequest: (...args: unknown[]) => createRequestMock(...args),
}));

function renderPage() {
  render(
    <MemoryRouter initialEntries={['/requests/new']}>
      <Routes>
        <Route path="/requests/new" element={<CreateRequestPage />} />
        <Route path="/requests/:id" element={<p>Detalle de la solicitud creada</p>} />
      </Routes>
    </MemoryRouter>
  );
}

function fillValidForm() {
  fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Compra de laptops' } });
  fireEvent.change(screen.getByLabelText('Descripción'), { target: { value: 'Laptops para el equipo' } });
  fireEvent.change(screen.getByLabelText('Monto'), { target: { value: '1000' } });
  fireEvent.change(screen.getByLabelText('Nombre del solicitante'), { target: { value: 'Laura Martínez' } });

  const names = ['Juan Pérez', 'Ana Gómez', 'Carlos Ruiz'];
  const emails = ['juan@example.com', 'ana@example.com', 'carlos@example.com'];
  const roles = ['Gerente', 'Finanzas', 'Compras'];

  screen.getAllByLabelText('Nombre').forEach((input, i) => fireEvent.change(input, { target: { value: names[i] } }));
  screen.getAllByLabelText('Email').forEach((input, i) => fireEvent.change(input, { target: { value: emails[i] } }));
  screen.getAllByLabelText('Rol').forEach((input, i) => fireEvent.change(input, { target: { value: roles[i] } }));
}

describe('CreateRequestPage', () => {
  beforeEach(() => createRequestMock.mockReset());

  it('crea la solicitud y navega al detalle cuando la respuesta es exitosa', async () => {
    createRequestMock.mockResolvedValue({
      requestId: 'req-1',
      status: 'PENDIENTE',
      createdAt: '2026-08-19T14:00:00.000Z',
      approvals: [],
    });

    renderPage();
    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: 'Crear solicitud' }));

    await waitFor(() => expect(screen.getByText('Detalle de la solicitud creada')).toBeInTheDocument());
    expect(createRequestMock).toHaveBeenCalledTimes(1);
  });

  it('muestra un mensaje de error y no navega si el backend responde con error', async () => {
    createRequestMock.mockRejectedValue(new ApiError(400, 'VALIDATION_ERROR', 'Datos inválidos'));

    renderPage();
    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: 'Crear solicitud' }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Revisa los datos ingresados.'));
    expect(screen.queryByText('Detalle de la solicitud creada')).not.toBeInTheDocument();
  });
});
