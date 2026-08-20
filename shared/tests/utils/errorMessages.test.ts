import { getErrorMessage } from '../../src/utils/errorMessages';
import { ApiError } from '../../src/types';

describe('getErrorMessage', () => {
  it('devuelve el mensaje amigable para un código conocido de ApiError', () => {
    expect(getErrorMessage(new ApiError(404, 'REQUEST_NOT_FOUND', 'raw'))).toBe('No se encontró la solicitud.');
  });

  it('devuelve el mensaje crudo del ApiError si el código no está mapeado', () => {
    expect(getErrorMessage(new ApiError(418, 'ALGO_RARO', 'mensaje del backend'))).toBe('mensaje del backend');
  });

  it('devuelve el mensaje de un Error genérico', () => {
    expect(getErrorMessage(new Error('fallo inesperado'))).toBe('fallo inesperado');
  });

  it('devuelve un mensaje genérico si el valor no es un Error', () => {
    expect(getErrorMessage('cualquier cosa')).toBe('Ocurrió un error, intenta nuevamente.');
    expect(getErrorMessage(undefined)).toBe('Ocurrió un error, intenta nuevamente.');
  });
});
