import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '../utils/env';
import { ApiError, ApiErrorBody } from '../types/apiError';

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    if (error.response) {
      const body = error.response.data;
      const code = body?.error?.code ?? 'INTERNAL_ERROR';
      const message = body?.error?.message ?? 'Ocurrió un error inesperado';
      return Promise.reject(new ApiError(error.response.status, code, message, body?.error?.details));
    }

    return Promise.reject(new ApiError(0, 'NETWORK_ERROR', 'No se pudo conectar con el servidor'));
  }
);
