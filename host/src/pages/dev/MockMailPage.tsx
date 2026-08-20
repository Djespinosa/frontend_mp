import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { ErrorMessage, LoadingIndicator, getErrorMessage, useAsync } from '@mp/shared';
import { listMail } from '../../services/mockMailService';
import { extractApprovalLink, extractApproverName, extractOtp } from './mockMailParsing';

async function copyToClipboard(value: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    // Sin permisos de portapapeles (por ejemplo, HTTP sin TLS): el valor
    // sigue visible en la tabla para copiarlo a mano.
  }
}

export function MockMailPage() {
  const [requestIdFilter, setRequestIdFilter] = useState('');
  const { status, data, error, run } = useAsync(listMail);

  useEffect(() => {
    run();
  }, [run]);

  function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    run(requestIdFilter.trim() || undefined);
  }

  return (
    <section>
      <h2>Mock Mail (solo demostración)</h2>
      <p>
        Bandeja simulada de correos (enlaces de aprobación y códigos OTP). Esta vista es exclusivamente para
        facilitar la demo manual del flujo; no forma parte del panel del solicitante.
      </p>

      <form onSubmit={handleFilterSubmit}>
        <label htmlFor="requestIdFilter">Filtrar por ID de solicitud (opcional)</label>
        <input
          id="requestIdFilter"
          type="text"
          value={requestIdFilter}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setRequestIdFilter(event.target.value)}
        />
        <button type="submit">Filtrar</button>
      </form>

      {(status === 'idle' || status === 'loading') && <LoadingIndicator label="Cargando correos..." />}
      {status === 'error' && <ErrorMessage message={getErrorMessage(error)} />}

      {status === 'success' && data && (
        <>
          {data.length === 0 ? (
            <p>No hay correos simulados todavía.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Destinatario</th>
                  <th>Solicitud</th>
                  <th>Aprobador</th>
                  <th>Link de aprobación</th>
                  <th>OTP</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {data.map((mail) => {
                  const link = extractApprovalLink(mail.body);
                  const otp = extractOtp(mail.body);
                  const approverName = extractApproverName(mail.body);

                  return (
                    <tr key={mail.mailId}>
                      <td>{mail.to}</td>
                      <td>{mail.requestId}</td>
                      <td>{approverName ?? '-'}</td>
                      <td>
                        {link ? (
                          <>
                            <a href={link} target="_blank" rel="noreferrer">
                              Abrir
                            </a>{' '}
                            <button type="button" onClick={() => copyToClipboard(link)}>
                              Copiar link
                            </button>
                          </>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        {otp ? (
                          <>
                            {otp}{' '}
                            <button type="button" onClick={() => copyToClipboard(otp)}>
                              Copiar OTP
                            </button>
                          </>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>{new Date(mail.createdAt).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </>
      )}
    </section>
  );
}
