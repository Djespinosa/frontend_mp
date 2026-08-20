import { render, screen, fireEvent } from '@testing-library/react';
import { OtpForm } from '../../src/components/OtpForm';

describe('OtpForm', () => {
  it('muestra el saludo con el nombre del aprobador y el título de la solicitud', () => {
    render(
      <OtpForm
        approverName="Juan Pérez"
        requestTitle="Compra de laptops"
        onSubmit={jest.fn()}
        submitting={false}
        error={null}
        onRequestNewCode={jest.fn()}
      />
    );

    expect(screen.getByText(/Hola Juan Pérez/)).toBeInTheDocument();
    expect(screen.getByText(/Compra de laptops/)).toBeInTheDocument();
  });

  it('solo acepta dígitos y limita a 6 caracteres', () => {
    render(<OtpForm onSubmit={jest.fn()} submitting={false} error={null} onRequestNewCode={jest.fn()} />);

    const input = screen.getByLabelText('Código de verificación');
    fireEvent.change(input, { target: { value: 'ab12cd34ef' } });

    expect(input).toHaveValue('1234');
  });

  it('muestra un error de validación si se envía con menos de 6 dígitos', () => {
    const onSubmit = jest.fn();
    render(<OtpForm onSubmit={onSubmit} submitting={false} error={null} onRequestNewCode={jest.fn()} />);

    fireEvent.change(screen.getByLabelText('Código de verificación'), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Validar código' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('El código debe tener 6 dígitos')).toBeInTheDocument();
  });

  it('llama a onSubmit con el código cuando tiene 6 dígitos', () => {
    const onSubmit = jest.fn();
    render(<OtpForm onSubmit={onSubmit} submitting={false} error={null} onRequestNewCode={jest.fn()} />);

    fireEvent.change(screen.getByLabelText('Código de verificación'), { target: { value: '583921' } });
    fireEvent.click(screen.getByRole('button', { name: 'Validar código' }));

    expect(onSubmit).toHaveBeenCalledWith('583921');
  });

  it('muestra el error recibido por props (por ejemplo, OTP incorrecto o expirado)', () => {
    render(
      <OtpForm onSubmit={jest.fn()} submitting={false} error="El código OTP expiró" onRequestNewCode={jest.fn()} />
    );

    expect(screen.getByText('El código OTP expiró')).toBeInTheDocument();
  });

  it('deshabilita los botones mientras submitting es true', () => {
    render(<OtpForm onSubmit={jest.fn()} submitting error={null} onRequestNewCode={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Validando...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Solicitar un nuevo código' })).toBeDisabled();
  });

  it('llama a onRequestNewCode al hacer click en "Solicitar un nuevo código"', () => {
    const onRequestNewCode = jest.fn();
    render(<OtpForm onSubmit={jest.fn()} submitting={false} error={null} onRequestNewCode={onRequestNewCode} />);

    fireEvent.click(screen.getByRole('button', { name: 'Solicitar un nuevo código' }));

    expect(onRequestNewCode).toHaveBeenCalledTimes(1);
  });
});
