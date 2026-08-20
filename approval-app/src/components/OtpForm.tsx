import { ChangeEvent, FormEvent, useState } from 'react';

interface OtpFormProps {
  approverName?: string;
  requestTitle?: string;
  onSubmit: (otp: string) => void;
  submitting: boolean;
  error: string | null;
  onRequestNewCode: () => void;
}

export function OtpForm({ approverName, requestTitle, onSubmit, submitting, error, onRequestNewCode }: OtpFormProps) {
  const [otp, setOtp] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const digitsOnly = event.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(digitsOnly);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (otp.length !== 6) {
      setValidationError('El código debe tener 6 dígitos');
      return;
    }
    setValidationError(null);
    onSubmit(otp);
  }

  return (
    <section>
      <h2>Verifica tu identidad</h2>
      {approverName && (
        <p>
          Hola {approverName}, ingresa el código de verificación enviado a tu correo
          {requestTitle ? ` para revisar la solicitud "${requestTitle}"` : ''}.
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="otp">Código de verificación</label>
        <input id="otp" type="text" inputMode="numeric" maxLength={6} value={otp} onChange={handleChange} />
        {validationError && <p role="alert">{validationError}</p>}
        {error && <p role="alert">{error}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Validando...' : 'Validar código'}
        </button>
      </form>

      <button type="button" onClick={onRequestNewCode} disabled={submitting}>
        Solicitar un nuevo código
      </button>
    </section>
  );
}
