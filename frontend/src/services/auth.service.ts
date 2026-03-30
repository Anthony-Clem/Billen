const API_BASE = '/api/v1';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  const json = (await res.json()) as Record<string, unknown>;

  if (!res.ok) {
    const raw = json['message'];
    const message = Array.isArray(raw)
      ? raw.join(', ')
      : typeof raw === 'string'
        ? raw
        : 'An error occurred';
    throw new Error(message);
  }

  return json['data'] as T;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  return request<AuthUser>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(
  name: string,
  email: string,
  password: string,
  confirmPassword: string,
): Promise<AuthUser> {
  return request<AuthUser>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, confirmPassword }),
  });
}

export async function logout(): Promise<void> {
  await request<null>('/auth/logout', { method: 'POST' });
}

export async function getMe(): Promise<AuthUser | null> {
  try {
    return await request<AuthUser>('/auth/me');
  } catch {
    return null;
  }
}
