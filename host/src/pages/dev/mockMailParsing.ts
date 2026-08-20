/**
 * El backend NO devuelve approverName/link/otp como campos separados en
 * GET /mock-mail (ver MockMailSummary): van embebidos como texto libre en
 * `body`, exactamente con el formato que arma mockMailBuilder.ts en el
 * backend. Estos parsers son deliberadamente solo para esta vista de
 * demostración — nunca deben usarse para lógica de negocio real.
 */

const APPROVAL_LINK_REGEX = /https?:\/\/\S+/;
const OTP_REGEX = /OTP es (\d{6})/;
const APPROVER_NAME_REGEX = /^Hola ([^,]+),/;

export function extractApprovalLink(body: string): string | null {
  const match = body.match(APPROVAL_LINK_REGEX);
  return match ? match[0] : null;
}

export function extractOtp(body: string): string | null {
  const match = body.match(OTP_REGEX);
  return match ? match[1] : null;
}

export function extractApproverName(body: string): string | null {
  const match = body.match(APPROVER_NAME_REGEX);
  return match ? match[1] : null;
}
