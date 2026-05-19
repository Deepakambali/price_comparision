const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function getFunctionUrl(functionName: string, params?: URLSearchParams): string {
  if (!SUPABASE_URL) {
    throw new Error('Missing VITE_SUPABASE_URL. Add it to the project root .env file and restart Vite.');
  }

  const query = params?.toString();
  return `${SUPABASE_URL}/functions/v1/${functionName}${query ? `?${query}` : ''}`;
}

export function getSupabaseHeaders(): HeadersInit {
  if (!SUPABASE_ANON_KEY) {
    throw new Error('Missing VITE_SUPABASE_ANON_KEY. Add it to the project root .env file and restart Vite.');
  }

  return {
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  };
}

export async function readJsonResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    throw new Error(`${fallbackMessage}: server returned ${contentType || 'non-JSON content'}`);
  }

  const data = await response.json();

  if (!response.ok) {
    const message = typeof data?.error === 'string' ? data.error : fallbackMessage;
    throw new Error(message);
  }

  return data as T;
}
