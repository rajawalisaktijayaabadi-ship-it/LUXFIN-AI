import { logger } from '../services/loggerService';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

export class ApiClient {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    try {
      logger.debug('API', `Sending request to ${url}`, options.body);

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const contentType = response.headers.get('content-type');
      let data: any = {};

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      }

      if (!response.ok) {
        const errorMsg = data.error || data.message || `Server returned HTTP ${response.status}`;
        logger.error('API', `Request failed: ${url}`, errorMsg);
        return {
          success: false,
          error: errorMsg,
          statusCode: response.status,
        };
      }

      logger.debug('API', `Request succeeded: ${url}`, data);
      return {
        success: true,
        data: data.parsed || data.result || data.receipt || data.reply || data,
        statusCode: response.status,
      };
    } catch (err: any) {
      const errorMsg = err.message || 'Koneksi jaringan terputus';
      logger.error('API', `Network/Client error on ${url}`, err);
      return {
        success: false,
        error: errorMsg,
        statusCode: 0,
      };
    }
  }

  static get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  static post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }
}
