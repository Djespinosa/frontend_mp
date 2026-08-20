import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ErrorMessage, LoadingIndicator, StatusBadge, useAsync, getErrorMessage } from '@mp/shared';
import { listRequests } from '../services/requestService';

export function RequestListPage() {
  const { status, data, error, run } = useAsync(listRequests);

  useEffect(() => {
    run();
  }, [run]);

  return (
    <section>
      <h2>Mis solicitudes</h2>
      <Link to="/requests/new">Crear nueva solicitud</Link>

      {(status === 'idle' || status === 'loading') && <LoadingIndicator label="Cargando solicitudes..." />}
      {status === 'error' && <ErrorMessage message={getErrorMessage(error)} />}

      {status === 'success' && data && (
        <>
          {data.items.length === 0 ? (
            <p>No hay solicitudes registradas todavía.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Título</th>
                  <th>Monto</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.requestId}>
                    <td>
                      <Link to={`/requests/${item.requestId}`}>{item.requestId}</Link>
                    </td>
                    <td>{item.title}</td>
                    <td>{item.amount}</td>
                    <td>{new Date(item.createdAt).toLocaleString()}</td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </section>
  );
}
