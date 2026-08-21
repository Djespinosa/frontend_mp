import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ApiError,
  ApproveResponse,
  RejectResponse,
  ValidateOtpResponse,
  ErrorMessage,
  LoadingIndicator,
  useAsync,
  getErrorMessage,
  getRequestDetail,
} from '@mp/shared';
import { ApprovalDetailScreen } from '../components/ApprovalDetailScreen';
import { OtpForm } from '../components/OtpForm';
import { approveRequest, rejectRequest, validateApprovalLink, validateOtp } from '../services/approvalService';
import { clearApprovalSession, loadApprovalSession, saveApprovalSession } from '../utils/approvalSessionStorage';

const POLL_INTERVAL_MS = 4000;

function isSessionExpiredError(error: unknown): boolean {
  return error instanceof ApiError && error.code === 'INVALID_SESSION';
}

export function ApprovalFlowPage() {
  const [searchParams] = useSearchParams();
  const solicitudId = searchParams.get('solicitud_id');
  const approverToken = searchParams.get('approver_token');

  const [sessionData, setSessionData] = useState<ValidateOtpResponse | null>(null);
  const [actionResult, setActionResult] = useState<ApproveResponse | RejectResponse | null>(null);

  const { run: runValidateLink, status: linkStatus, error: linkErrorRaw, data: linkData } = useAsync(
    validateApprovalLink
  );
  const { run: runValidateOtp, status: otpStatus, error: otpErrorRaw, reset: resetOtp } = useAsync(validateOtp);
  const { run: runApprove, status: approveStatus, error: approveErrorRaw } = useAsync(approveRequest);
  const { run: runReject, status: rejectStatus, error: rejectErrorRaw } = useAsync(rejectRequest);

  useEffect(() => {
    if (!solicitudId || !approverToken) {
      return;
    }

    const cached = loadApprovalSession(solicitudId, approverToken);
    if (cached) {
      setSessionData(cached);
      return;
    }

    runValidateLink(solicitudId, approverToken);
  }, [solicitudId, approverToken, runValidateLink]);

  // Si la sesión expira mientras se aprueba/rechaza, se vuelve a validar el
  // enlace (esto reemite un OTP fresco: el TTL de sesión es más largo que el
  // del OTP, así que el OTP original ya venció de todas formas) y se muestra
  // la pantalla de OTP para que el aprobador reautentique. Es necesario
  // revalidar el enlace incluso si la sesión se retomó desde sessionStorage,
  // caso en el que nunca se había llamado a validateApprovalLink en esta carga.
  useEffect(() => {
    if (isSessionExpiredError(approveErrorRaw) || isSessionExpiredError(rejectErrorRaw)) {
      setSessionData(null);
      if (solicitudId && approverToken) {
        clearApprovalSession(solicitudId, approverToken);
        runValidateLink(solicitudId, approverToken);
      }
    }
  }, [approveErrorRaw, rejectErrorRaw, solicitudId, approverToken, runValidateLink]);

  // Los otros aprobadores firman/rechazan desde otra pestaña, así que esta
  // pantalla refresca sola el estado de la tabla mientras no se haya actuado
  // todavía (una vez hay actionResult, la pantalla ya muestra el resultado final).
  const hasActiveSession = Boolean(sessionData) && !actionResult;

  useEffect(() => {
    if (!hasActiveSession || !solicitudId) return;

    const intervalId = setInterval(async () => {
      try {
        const detail = await getRequestDetail(solicitudId);
        setSessionData((prev) => (prev ? { ...prev, approvals: detail.approvals } : prev));
      } catch {
        // Refresco best-effort: un fallo puntual no debe interrumpir la pantalla de aprobación.
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [hasActiveSession, solicitudId]);

  async function handleOtpSubmit(otp: string) {
    if (!solicitudId || !approverToken) return;
    const result = await runValidateOtp({ solicitudId, approverToken, otp });
    if (result) {
      saveApprovalSession(solicitudId, approverToken, result);
      setSessionData(result);
    }
  }

  function handleRequestNewCode() {
    if (!solicitudId || !approverToken) return;
    resetOtp();
    runValidateLink(solicitudId, approverToken);
  }

  async function handleApprove() {
    if (!sessionData) return;
    const result = await runApprove(sessionData.approvalId, sessionData.sessionToken);
    if (result) {
      setActionResult(result);
      if (solicitudId && approverToken) clearApprovalSession(solicitudId, approverToken);
    }
  }

  async function handleReject() {
    if (!sessionData) return;
    const result = await runReject(sessionData.approvalId, sessionData.sessionToken);
    if (result) {
      setActionResult(result);
      if (solicitudId && approverToken) clearApprovalSession(solicitudId, approverToken);
    }
  }

  if (!solicitudId || !approverToken) {
    return <ErrorMessage message="El enlace no incluye los parámetros necesarios." />;
  }

  if (sessionData) {
    return (
      <ApprovalDetailScreen
        response={sessionData}
        actionResult={actionResult}
        onApprove={handleApprove}
        onReject={handleReject}
        approveStatus={approveStatus}
        rejectStatus={rejectStatus}
        approveError={approveStatus === 'error' ? getErrorMessage(approveErrorRaw) : null}
        rejectError={rejectStatus === 'error' ? getErrorMessage(rejectErrorRaw) : null}
      />
    );
  }

  if (linkStatus === 'idle' || linkStatus === 'loading') {
    return <LoadingIndicator label="Validando enlace..." />;
  }

  if (linkStatus === 'error') {
    return <ErrorMessage message={getErrorMessage(linkErrorRaw)} />;
  }

  return (
    <OtpForm
      approverName={linkData?.approverName}
      requestTitle={linkData?.requestTitle}
      onSubmit={handleOtpSubmit}
      submitting={otpStatus === 'loading'}
      error={otpStatus === 'error' ? getErrorMessage(otpErrorRaw) : null}
      onRequestNewCode={handleRequestNewCode}
    />
  );
}
