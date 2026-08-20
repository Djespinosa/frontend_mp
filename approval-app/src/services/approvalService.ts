import {
  httpClient,
  ApprovalOtpPayload,
  ApproveResponse,
  RejectResponse,
  ValidateLinkResponse,
  ValidateOtpResponse,
} from '@mp/shared';

export async function validateApprovalLink(solicitudId: string, approverToken: string): Promise<ValidateLinkResponse> {
  const { data } = await httpClient.get<ValidateLinkResponse>('/approvals/validate', {
    params: { solicitud_id: solicitudId, approver_token: approverToken },
  });
  return data;
}

export async function validateOtp(payload: ApprovalOtpPayload): Promise<ValidateOtpResponse> {
  const { data } = await httpClient.post<ValidateOtpResponse>('/approvals/otp', payload);
  return data;
}

// approvalId es un string compuesto ("{uuid}#A1") que contiene un "#" literal.
// Sin encodeURIComponent, el navegador interpretaría todo lo posterior al "#"
// como fragmento y lo recortaría de la petición real.
export async function approveRequest(approvalId: string, sessionToken: string): Promise<ApproveResponse> {
  const { data } = await httpClient.post<ApproveResponse>(
    `/approvals/${encodeURIComponent(approvalId)}/approve`,
    undefined,
    { headers: { Authorization: `Bearer ${sessionToken}` } }
  );
  return data;
}

export async function rejectRequest(approvalId: string, sessionToken: string): Promise<RejectResponse> {
  const { data } = await httpClient.post<RejectResponse>(
    `/approvals/${encodeURIComponent(approvalId)}/reject`,
    undefined,
    { headers: { Authorization: `Bearer ${sessionToken}` } }
  );
  return data;
}
