import { render, screen, waitFor } from '@testing-library/react';
import { App } from '../src/App';

// Los remotes reales (requesterApp/RequesterApp, approvalApp/ApprovalApp) solo
// existen como módulos virtuales que arma Module Federation en runtime — no
// resuelven en Jest. Se mockean con `virtual: true` únicamente para probar que
// el wiring de lazy-loading del host no rompe; el contenido real de cada
// remote se prueba en su propio paquete.
jest.mock(
  'requesterApp/RequesterApp',
  () => ({ RequesterApp: () => <p>Remote requesterApp montado</p> }),
  { virtual: true }
);
jest.mock(
  'approvalApp/ApprovalApp',
  () => ({ ApprovalApp: () => <p>Remote approvalApp montado</p> }),
  { virtual: true }
);

describe('App', () => {
  it('renderiza el layout y la página de inicio en la ruta raíz', () => {
    window.history.pushState({}, '', '/');
    render(<App />);

    expect(screen.getByText('Michael Page — Aprobación de Compras')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Bienvenido' })).toBeInTheDocument();
  });

  it('renderiza la página 404 en una ruta desconocida', () => {
    window.history.pushState({}, '', '/ruta-que-no-existe');
    render(<App />);

    expect(screen.getByRole('heading', { name: '404 — Página no encontrada' })).toBeInTheDocument();
  });

  it('carga perezosamente el remote requesterApp bajo /requests', async () => {
    window.history.pushState({}, '', '/requests');
    render(<App />);

    await waitFor(() => expect(screen.getByText('Remote requesterApp montado')).toBeInTheDocument());
  });

  it('carga perezosamente el remote approvalApp bajo /approve', async () => {
    window.history.pushState({}, '', '/approve');
    render(<App />);

    await waitFor(() => expect(screen.getByText('Remote approvalApp montado')).toBeInTheDocument());
  });
});
