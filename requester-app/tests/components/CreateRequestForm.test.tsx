import { render, screen, fireEvent } from '@testing-library/react';
import { CreateRequestForm } from '../../src/components/CreateRequestForm';

function fillValidForm() {
  fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Compra de laptops' } });
  fireEvent.change(screen.getByLabelText('Descripción'), { target: { value: 'Laptops para el equipo' } });
  fireEvent.change(screen.getByLabelText('Monto'), { target: { value: '1000' } });
  fireEvent.change(screen.getByLabelText('Nombre del solicitante'), { target: { value: 'Laura Martínez' } });

  const names = ['Juan Pérez', 'Ana Gómez', 'Carlos Ruiz'];
  const emails = ['juan@example.com', 'ana@example.com', 'carlos@example.com'];
  const roles = ['Gerente', 'Finanzas', 'Compras'];

  screen.getAllByLabelText('Nombre').forEach((input, i) => fireEvent.change(input, { target: { value: names[i] } }));
  screen.getAllByLabelText('Email').forEach((input, i) => fireEvent.change(input, { target: { value: emails[i] } }));
  screen.getAllByLabelText('Rol').forEach((input, i) => fireEvent.change(input, { target: { value: roles[i] } }));
}

describe('CreateRequestForm', () => {
  it('no llama a onSubmit y muestra errores si el formulario está vacío', () => {
    const onSubmit = jest.fn();
    render(<CreateRequestForm onSubmit={onSubmit} submitting={false} />);

    fireEvent.click(screen.getByRole('button', { name: 'Crear solicitud' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('El título es obligatorio')).toBeInTheDocument();
    expect(screen.getByText('El monto debe ser un número mayor a 0')).toBeInTheDocument();
  });

  it('llama a onSubmit con los valores cuando el formulario es válido', () => {
    const onSubmit = jest.fn();
    render(<CreateRequestForm onSubmit={onSubmit} submitting={false} />);

    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: 'Crear solicitud' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const submitted = onSubmit.mock.calls[0][0];
    expect(submitted.title).toBe('Compra de laptops');
    expect(submitted.approvers).toHaveLength(3);
    expect(submitted.approvers[1].email).toBe('ana@example.com');
  });

  it('muestra el error de emails duplicados y no envía el formulario', () => {
    const onSubmit = jest.fn();
    render(<CreateRequestForm onSubmit={onSubmit} submitting={false} />);

    fillValidForm();
    const emailInputs = screen.getAllByLabelText('Email');
    fireEvent.change(emailInputs[1], { target: { value: 'juan@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear solicitud' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Los tres aprobadores deben tener emails distintos')).toBeInTheDocument();
  });

  it('deshabilita el botón y muestra "Creando..." mientras submitting es true', () => {
    render(<CreateRequestForm onSubmit={jest.fn()} submitting />);

    const button = screen.getByRole('button', { name: 'Creando...' });
    expect(button).toBeDisabled();
  });
});
