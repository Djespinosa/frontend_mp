import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HomePage } from '../../src/pages/HomePage';

describe('HomePage', () => {
  it('muestra el mensaje de bienvenida y los links de navegación', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Bienvenido' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Crear solicitud' })).toHaveAttribute('href', '/requests/new');
    expect(screen.getByRole('link', { name: 'Ver mis solicitudes' })).toHaveAttribute('href', '/requests');
  });
});
