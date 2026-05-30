import { isAxiosError } from 'axios';

type ApiErrBody = {
  error?: string;
  message?: string;
  details?: { fieldErrors?: Record<string, string[] | undefined> };
};

export function apiErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (isAxiosError(err)) {
    const data = err.response?.data as ApiErrBody | undefined;
    if (data?.error && data?.details?.fieldErrors) {
      const parts = Object.entries(data.details.fieldErrors)
        .flatMap(([k, v]) => (v?.length ? [`${k}: ${v.join(', ')}`] : []))
        .join('; ');
      if (parts) return `${data.error} — ${parts}`;
    }
    if (data?.error) return data.error;
    if (data?.message) return data.message;
    if (err.message) return err.message;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
