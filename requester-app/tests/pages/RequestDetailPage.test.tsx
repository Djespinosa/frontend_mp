import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RequestDetailPage } from '../../src/pages/RequestDetailPage';
import { ApiError } from '@mp/shared';

const getRequestDetailMock = jest.fn();
const getEvidenceUrlMock = jest.fn();

jest.mock('../../src/services/requestService', () => ({
  getRequestDetail: (...args: unknown[]) => getRequestDetailMock(...args),
}));
jest.mock('../../src/services/evidenceService', () => ({
  getEvidenceUrl: (...args: unknown[]) => getEvidenceUrlMock(...args),
}));

function renderPage(id = 'req-1') {
  render(
    <MemoryRouter initialEntries={[`/requests/${id}`]}>
      <Routes>
        <Route path="/requests/:id" element={<RequestDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

const baseDetail = {
  requestId: 'req-1',
  title: 'Compra de laptops',
  description: 'Laptops para el equipo',
  amount: 1000,
  requesterName: 'Laura Martínez',
  createdAt: '2026-08-19T14:00:00.000Z',
  status: 'PENDIENTE',
  signedCount: 1,
  pdfKey: null,
  completedAt: null,
  approvals: [
    { approvalId: 'req-1#A1', approverName: 'Juan Pérez', role: 'Gerente', status: 'FIRMADO', signedAt: '2026-08-19T15:00:00.000Z' },
    { approvalId: 'req-1#A2', approverName: 'Ana Gómez', role: 'Finanzas', status: 'PENDIENTE', signedAt: null },
    { approvalId: 'req-1#A3', approverName: 'Carlos Ruiz', role: 'Compras', status: 'PENDIENTE', signedAt: null },
  ],
};

describe('RequestDetailPage', () => {
  beforeEach(() => {
    getRequestDetailMock.mockReset();
    getEvidenceUrlMock.mockReset();
  });

  it('muestra los datos completos y el estado de los tres aprobadores', async () => {
    getRequestDetailMock.mockResolvedValue(baseDetail);

    renderPage();

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Compra de laptops' })).toBeInTheDocument());
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('Ana Gómez')).toBeInTheDocument();
    expect(screen.getByText('Carlos Ruiz')).toBeInTheDocument();
    expect(screen.getByText('Firmado')).toBeInTheDocument();
    expect(screen.getAllByText('Pendiente').length).toBeGreaterThan(0);
    expect(getRequestDetailMock).toHaveBeenCalledWith('req-1');
  });

  it('NO muestra el botón de descargar PDF cuando la solicitud sigue PENDIENTE', async () => {
    getRequestDetailMock.mockResolvedValue(baseDetail);

    renderPage();

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Compra de laptops' })).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Descargar PDF' })).not.toBeInTheDocument();
  });

  it('NO muestra el botón de descargar PDF cuando la solicitud fue RECHAZADA', async () => {
    getRequestDetailMock.mockResolvedValue({ ...baseDetail, status: 'RECHAZADA' });

    renderPage();

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Compra de laptops' })).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Descargar PDF' })).not.toBeInTheDocument();
    expect(getEvidenceUrlMock).not.toHaveBeenCalled();
  });

  it('muestra el botón de descargar PDF y abre la URL prefirmada cuando la solicitud está COMPLETADA', async () => {
    getRequestDetailMock.mockResolvedValue({ ...baseDetail, status: 'COMPLETADA', pdfKey: 'evidences/req-1.pdf' });
    getEvidenceUrlMock.mockResolvedValue({ url: 'https://s3.example.com/signed', expiresIn: 300 });
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);

    renderPage();

    await waitFor(() => expect(screen.getByRole('button', { name: 'Descargar PDF' })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Descargar PDF' }));

    await waitFor(() => expect(openSpy).toHaveBeenCalledWith('https://s3.example.com/signed', '_blank', 'noreferrer'));

    openSpy.mockRestore();
  });

  it('muestra un error si la descarga de evidencia falla', async () => {
    getRequestDetailMock.mockResolvedValue({ ...baseDetail, status: 'COMPLETADA', pdfKey: 'evidences/req-1.pdf' });
    getEvidenceUrlMock.mockRejectedValue(new ApiError(409, 'EVIDENCE_NOT_READY', 'no lista'));

    renderPage();

    await waitFor(() => expect(screen.getByRole('button', { name: 'Descargar PDF' })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Descargar PDF' }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('La evidencia aún no está disponible.'));
  });

  it('muestra un error si la solicitud no existe', async () => {
    getRequestDetailMock.mockRejectedValue(new ApiError(404, 'REQUEST_NOT_FOUND', 'no existe'));

    renderPage();

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('No se encontró la solicitud.'));
  });
});
