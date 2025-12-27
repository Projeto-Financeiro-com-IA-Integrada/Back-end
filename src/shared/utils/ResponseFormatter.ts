export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: any;
}

export const ResponseFormatter = {
  success: <T>(data: T, message?: string): ApiResponse<T> => ({
    success: true,
    message,
    data,
  }),

  error: (error: string, errors?: any): ApiResponse => ({
    success: false,
    error,
    errors,
  }),

  created: <T>(data: T, message?: string): ApiResponse<T> => ({
    success: true,
    message,
    data,
  }),
};
