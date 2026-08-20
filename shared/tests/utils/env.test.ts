import { API_BASE_URL } from '../../src/utils/env';

describe('API_BASE_URL', () => {
  it('expone una URL base no vacía (por defecto o desde la variable de entorno)', () => {
    expect(typeof API_BASE_URL).toBe('string');
    expect(API_BASE_URL.length).toBeGreaterThan(0);
  });
});
