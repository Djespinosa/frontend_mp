import { render, screen } from '@testing-library/react';
import { ErrorMessage } from '../../src/components/ErrorMessage';

describe('ErrorMessage', () => {
  it('muestra el mensaje recibido con rol alert', () => {
    render(<ErrorMessage message="Ocurrió un error" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Ocurrió un error');
  });
});
