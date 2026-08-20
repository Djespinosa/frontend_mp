import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../../src/components/StatusBadge';

describe('StatusBadge', () => {
  it.each([
    ['PENDIENTE', 'Pendiente'],
    ['COMPLETADA', 'Completada'],
    ['RECHAZADA', 'Rechazada'],
    ['FIRMADO', 'Firmado'],
    ['RECHAZADO', 'Rechazado'],
  ])('traduce %s a "%s"', (status, label) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('muestra el status crudo si no está en el mapa de etiquetas', () => {
    render(<StatusBadge status="ALGO_DESCONOCIDO" />);
    expect(screen.getByText('ALGO_DESCONOCIDO')).toBeInTheDocument();
  });
});
