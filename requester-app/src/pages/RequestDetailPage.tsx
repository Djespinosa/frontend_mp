import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ErrorMessage, LoadingIndicator, StatusBadge, useAsync, getErrorMessage } from '@mp/shared';
import { getRequestDetail } from '../services/requestService';
import { getEvidenceUrl } from '../services/evidenceService';

const POLL_INTERVAL_MS = 4000;
const TERMINAL_STATUSES = ['COMPLETADA', 'RECHAZADA'];

export function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { status, data, error, run } = useAsync(getRequestDetail);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (id) {
      run(id);
    }
  }, [id, run]);

  // Los aprobadores firman/rechazan desde otra pestaña, así que esta vista se
  // refresca sola mientras la solicitud siga PENDIENTE, en vez de exigir
  // pulsar "Actualizar" para ver cada aprobación.
  useEffect(() => {
    if (!id || (status === 'success' && TERMINAL_STATUSES.includes(data?.status ?? ''))) {
      return;
    }
    const intervalId = setInterval(() => run(id), POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [id, status, data?.status, run]);

  async function handleDownload() {
    if (!id) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      const { url } = await getEvidenceUrl(id);
      window.open(url, '_blank', 'noreferrer');
    } catch (err) {
      setDownloadError(getErrorMessage(err));
    } finally {
      setDownloading(false);
    }
  }

  if (status === 'idle' || status === 'loading') {
    return <LoadingIndicator label="Cargando solicitud..." />;
  }

  if (status === 'error' || !data) {
    return <ErrorMessage message={getErrorMessage(error)} />;
  }

  return (
    <section>
      <h2>{data.title}</h2>
      <StatusBadge status={data.status} />
      <button type="button" onClick={() => id && run(id)}>
        Actualizar
      </button>

      <p>{data.description}</p>
      <dl>
        <dt>Monto</dt>
        <dd>{data.amount}</dd>
        <dt>Solicitante</dt>
        <dd>{data.requesterName}</dd>
        <dt>Fecha de creación</dt>
        <dd>{new Date(data.createdAt).toLocaleString()}</dd>
      </dl>

      <h3>Aprobadores</h3>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Fecha de firma/rechazo</th>
          </tr>
        </thead>
        <tbody>
          {data.approvals.map((approval) => (
            <tr key={approval.approvalId}>
              <td>{approval.approverName}</td>
              <td>{approval.role}</td>
              <td>
                <StatusBadge status={approval.status} />
              </td>
              <td>{approval.signedAt ? new Date(approval.signedAt).toLocaleString() : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {data.status === 'COMPLETADA' && (
        <div>
          <button type="button" onClick={handleDownload} disabled={downloading}>
            {downloading ? 'Generando enlace...' : 'Descargar PDF'}
          </button>
          {downloadError && <ErrorMessage message={downloadError} />}
        </div>
      )}
    </section>
  );
}
