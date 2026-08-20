import MockAdapter from 'axios-mock-adapter';
import { httpClient } from '../../src/services/httpClient';
import { ApiError } from '../../src/types';

describe('httpClient', () => {
  const mock = new MockAdapter(httpClient);

  afterEach(() => mock.reset());

  it('usa la URL base configurada y envía JSON por defecto', () => {
    expect(httpClient.defaults.baseURL).toBeTruthy();
    expect(httpClient.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('normaliza un error HTTP con cuerpo {error:{code,message}} en un ApiError', async () => {
    mock.onGet('/solicitudes/no-existe').reply(404, { error: { code: 'REQUEST_NOT_FOUND', message: 'No existe' } });

    await expect(httpClient.get('/solicitudes/no-existe')).rejects.toMatchObject({
      status: 404,
      code: 'REQUEST_NOT_FOUND',
      message: 'No existe',
    });
  });

  it('el error rechazado es instancia de ApiError', async () => {
    mock.onGet('/mock-mail').reply(500, { error: { code: 'INTERNAL_ERROR', message: 'Boom' } });

    await expect(httpClient.get('/mock-mail')).rejects.toBeInstanceOf(ApiError);
  });

  it('propaga los detalles de validación cuando vienen en el error', async () => {
    mock.onPost('/solicitudes').reply(400, {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Datos inválidos',
        details: { fieldErrors: { title: ['Requerido'] } },
      },
    });

    await expect(httpClient.post('/solicitudes', {})).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      details: { fieldErrors: { title: ['Requerido'] } },
    });
  });

  it('normaliza un error sin respuesta (red caída) como NETWORK_ERROR', async () => {
    mock.onGet('/solicitudes').networkError();

    await expect(httpClient.get('/solicitudes')).rejects.toMatchObject({
      status: 0,
      code: 'NETWORK_ERROR',
    });
  });

  it('usa un code/message por defecto si el backend responde sin el formato esperado', async () => {
    mock.onGet('/solicitudes').reply(500, {});

    await expect(httpClient.get('/solicitudes')).rejects.toMatchObject({
      code: 'INTERNAL_ERROR',
      message: 'Ocurrió un error inesperado',
    });
  });
});
