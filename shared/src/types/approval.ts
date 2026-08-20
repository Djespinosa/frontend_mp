import { ApprovalStatus, RequestStatus } from './domain';

export interface ValidateLinkResponse {
  valid: true;
  approverName: string;
  requestTitle: string;
  approvalStatus: ApprovalStatus;
  otpSent: boolean;
}

/** Payload de POST /approvals/otp. Nombres de campo tal como los exige el validador real del backend. */
export interface ApprovalOtpPayload {
  solicitudId: string;
  approverToken: string;
  otp: string;
}

export interface ValidateOtpApprovalSummary {
  approvalId: string;
  approverName: string;
  role: string;
  status: ApprovalStatus;
}

export interface ValidateOtpResponse {
  sessionToken: string;
  sessionExpiresIn: number;
  /** approvalId del aprobador autenticado (el dueño del approverToken/OTP usados). */
  approvalId: string;
  request: {
    requestId: string;
    title: string;
    description: string;
    amount: number;
    requesterName: string;
    createdAt: string;
  };
  approvals: ValidateOtpApprovalSummary[];
}

/**
 * Estado de sesión del aprobador que vive en el cliente (Context/sessionStorage),
 * no es una respuesta directa del backend: combina approverToken (de la URL)
 * con lo recibido en ValidateOtpResponse. sessionExpiresAt se calcula como
 * Date.now() + sessionExpiresIn*1000 en el momento en que se recibe la respuesta.
 */
export interface ApprovalSession {
  requestId: string;
  approverToken: string;
  approvalId: string;
  sessionToken: string;
  sessionExpiresAt: number;
}

export interface ApproveResponse {
  approvalId: string;
  status: 'FIRMADO';
  signedAt: string;
  signature: string;
  requestStatus: RequestStatus;
  signedCount: number;
}

export interface RejectResponse {
  approvalId: string;
  status: 'RECHAZADO';
  signedAt: string;
  requestStatus: RequestStatus;
}
