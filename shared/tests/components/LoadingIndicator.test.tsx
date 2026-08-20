import { render, screen } from '@testing-library/react';
import { LoadingIndicator } from '../../src/components/LoadingIndicator';

describe('LoadingIndicator', () => {
  it('muestra el label por defecto', () => {
    render(<LoadingIndicator />);
    expect(screen.getByRole('status')).toHaveTextContent('Cargando...');
  });

  it('muestra un label personalizado', () => {
    render(<LoadingIndicator label="Cargando solicitudes..." />);
    expect(screen.getByRole('status')).toHaveTextContent('Cargando solicitudes...');
  });
});
