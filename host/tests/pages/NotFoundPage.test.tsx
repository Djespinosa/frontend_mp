import { render, screen } from '@testing-library/react';
import { NotFoundPage } from '../../src/pages/NotFoundPage';

describe('NotFoundPage', () => {
  it('muestra el mensaje 404', () => {
    render(<NotFoundPage />);
    expect(screen.getByRole('heading', { name: '404 — Página no encontrada' })).toBeInTheDocument();
  });
});
