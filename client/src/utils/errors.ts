type AxiosLikeError = {
  response?: { status?: number; data?: { error?: string; details?: string; message?: string } };
  message?: string;
};

export function getAxiosErrorPayload(error: unknown): {
  status: number;
  error?: string;
  details?: string;
  message?: string;
} {
  if (typeof error !== 'object' || error === null) {
    return { status: 0 };
  }
  const e = error as AxiosLikeError;
  const status = Number(e.response?.status || 0);
  const data = e.response?.data;
  return {
    status,
    error: data?.error,
    details: data?.details,
    message: data?.message ?? e.message,
  };
}
