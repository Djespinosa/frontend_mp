import { render, screen, fireEvent } from '@testing-library/react';
import { ApproverFieldset } from '../../src/components/ApproverFieldset';

describe('ApproverFieldset', () => {
  const value = { name: 'Juan Pérez', email: 'juan@example.com', role: 'Gerente' };

  it('renderiza los valores actuales y el índice', () => {
    render(<ApproverFieldset index={0} value={value} onChange={jest.fn()} />);

    expect(screen.getByText('Aprobador 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre')).toHaveValue('Juan Pérez');
    expect(screen.getByLabelText('Email')).toHaveValue('juan@example.com');
    expect(screen.getByLabelText('Rol')).toHaveValue('Gerente');
  });

  it('llama a onChange con el valor actualizado al escribir', () => {
    const onChange = jest.fn();
    render(<ApproverFieldset index={0} value={value} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Otro Nombre' } });

    expect(onChange).toHaveBeenCalledWith({ ...value, name: 'Otro Nombre' });
  });

  it('muestra los errores por campo cuando se proveen', () => {
    render(
      <ApproverFieldset
        index={1}
        value={{ name: '', email: '', role: '' }}
        errors={{ name: 'El nombre es obligatorio', email: 'El email es obligatorio', role: 'El rol es obligatorio' }}
        onChange={jest.fn()}
      />
    );

    expect(screen.getByText('El nombre es obligatorio')).toBeInTheDocument();
    expect(screen.getByText('El email es obligatorio')).toBeInTheDocument();
    expect(screen.getByText('El rol es obligatorio')).toBeInTheDocument();
  });
});
