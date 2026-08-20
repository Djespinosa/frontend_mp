import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Layout } from '../../src/components/Layout';

describe('Layout', () => {
  it('renderiza el encabezado, el pie, el link de Mock Mail y el contenido hijo', () => {
    render(
      <MemoryRouter>
        <Layout>
          <p>Contenido de prueba</p>
        </Layout>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Michael Page — Aprobación de Compras');
    expect(screen.getByText('Contenido de prueba')).toBeInTheDocument();
    expect(screen.getByText('Prueba técnica Fullstack Senior')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Mock Mail (demo)' })).toHaveAttribute('href', '/dev/mock-mail');
  });
});
