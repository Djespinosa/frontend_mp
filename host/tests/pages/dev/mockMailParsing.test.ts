import { extractApprovalLink, extractApproverName, extractOtp } from '../../../src/pages/dev/mockMailParsing';

const linkMailBody =
  'Hola Juan Pérez, ingresa al siguiente enlace para revisar y aprobar la solicitud "Compra de laptops": ' +
  'https://dominio.com/approve?solicitud_id=req-1&approver_token=abc-123';

const otpMailBody = 'Tu código OTP es 583921. Vence en 3 minutos.';

describe('extractApprovalLink', () => {
  it('extrae la URL de un correo de invitación', () => {
    expect(extractApprovalLink(linkMailBody)).toBe(
      'https://dominio.com/approve?solicitud_id=req-1&approver_token=abc-123'
    );
  });

  it('devuelve null si el cuerpo no contiene una URL', () => {
    expect(extractApprovalLink(otpMailBody)).toBeNull();
  });
});

describe('extractOtp', () => {
  it('extrae el código de 6 dígitos de un correo de OTP', () => {
    expect(extractOtp(otpMailBody)).toBe('583921');
  });

  it('devuelve null si el cuerpo no contiene un OTP', () => {
    expect(extractOtp(linkMailBody)).toBeNull();
  });
});

describe('extractApproverName', () => {
  it('extrae el nombre del saludo de un correo de invitación', () => {
    expect(extractApproverName(linkMailBody)).toBe('Juan Pérez');
  });

  it('devuelve null si el cuerpo no empieza con el saludo esperado', () => {
    expect(extractApproverName(otpMailBody)).toBeNull();
  });
});
