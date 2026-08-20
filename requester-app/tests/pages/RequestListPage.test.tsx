import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RequestListPage } from '../../src/pages/RequestListPage';
import { ApiError } from '@mp/shared';

const listRequestsMock = jest.fn();

jest.mock('../../src/services/requestService', () => ({
  listRequests: (...args: unknown[]) => listRequestsMock(...args),
}));

function renderPage() {
  render(
    <MemoryRouter>
      <RequestListPage />
    </MemoryRouter>
  );
}

describe('RequestListPage', () => {
  beforeEach(() => listRequestsMock.mockReset());

  it('muestra el loading y luego la tabla con las solicitudes', async () => {
    listRequestsMock.mockResolvedValue({
      items: [
        {
          requestId: 'req-1',
          title: 'Compra de laptops',
          amount: 1000,
          requesterName: 'Laura',
          createdAt: '2026-08-19T14:00:00.000Z',
          status: 'PENDIENTE',
          signedCount: 0,
        },
      ],
      nextCursor: null,
    });

    renderPage();

    expect(screen.getByRole('status')).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText('Compra de laptops')).toBeInTheDocument());
    expect(screen.getByRole('link', { name: 'req-1' })).toHaveAttribute('href', '/requests/req-1');
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });

  it('muestra un mensaje cuando no hay solicitudes', async () => {
    listRequestsMock.mockResolvedValue({ items: [], nextCursor: null });

    renderPage();

    await waitFor(() => expect(screen.getByText('No hay solicitudes registradas todavía.')).toBeInTheDocument());
  });

  it('muestra el error si la carga falla', async () => {
    listRequestsMock.mockRejectedValue(new ApiError(500, 'INTERNAL_ERROR', 'boom'));

    renderPage();

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Ocurrió un error, intenta nuevamente.'));
  });
});
