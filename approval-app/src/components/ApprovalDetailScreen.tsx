import {
  AsyncStatus,
  ApproveResponse,
  RejectResponse,
  ValidateOtpResponse,
  StatusBadge,
  ErrorMessage,
} from '@mp/shared';

interface ApprovalDetailScreenProps {
  response: ValidateOtpResponse;
  actionResult: ApproveResponse | RejectResponse | null;
  onApprove: () => void;
  onReject: () => void;
  approveStatus: AsyncStatus;
  rejectStatus: AsyncStatus;
  approveError: string | null;
  rejectError: string | null;
}

export function ApprovalDetailScreen({
  response,
  actionResult,
  onApprove,
  onReject,
  approveStatus,
  rejectStatus,
  approveError,
  rejectError,
}: ApprovalDetailScreenProps) {
  const isActing = approveStatus === 'loading' || rejectStatus === 'loading';

  return (
    <section>
      <h2>{response.request.title}</h2>
      <p>{response.request.description}</p>
      <dl>
        <dt>Monto</dt>
        <dd>{response.request.amount}</dd>
        <dt>Solicitante</dt>
        <dd>{response.request.requesterName}</dd>
        <dt>Fecha</dt>
        <dd>{new Date(response.request.createdAt).toLocaleString()}</dd>
      </dl>

      <h3>Aprobadores</h3>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Rol</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {response.approvals.map((approval) => (
            <tr key={approval.approvalId}>
              <td>{approval.approverName}</td>
              <td>{approval.role}</td>
              <td>
                <StatusBadge
                  status={
                    actionResult && approval.approvalId === actionResult.approvalId
                      ? actionResult.status
                      : approval.status
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {actionResult ? (
        <div>
          <p>
            {actionResult.status === 'FIRMADO' ? 'Aprobaste esta solicitud correctamente.' : 'Rechazaste esta solicitud.'}
          </p>
          <StatusBadge status={actionResult.requestStatus} />
        </div>
      ) : (
        <div>
          <button type="button" onClick={onApprove} disabled={isActing}>
            {approveStatus === 'loading' ? 'Aprobando...' : 'Aprobar'}
          </button>
          <button type="button" onClick={onReject} disabled={isActing}>
            {rejectStatus === 'loading' ? 'Rechazando...' : 'Rechazar'}
          </button>
          {approveError && <ErrorMessage message={approveError} />}
          {rejectError && <ErrorMessage message={rejectError} />}
        </div>
      )}
    </section>
  );
}
