const API_BASE = '/api/v1';

export type ClientAddress = {
  line1: string | null;
  line2?: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
};

export type Client = {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  address?: ClientAddress;
  createdAt: string;
  updatedAt: string;
};

export type CreateClientInput = {
  name: string;
  email: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressCity?: string;
  addressState?: string;
  addressZip?: string;
};

export type OnboardInput = {
  token: string;
  name: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressCity?: string;
  addressState?: string;
  addressZip?: string;
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

export function getClients(): Promise<Client[]> {
  return request<Client[]>('/clients');
}

export function getClient(id: string): Promise<Client> {
  return request<Client>(`/clients/${id}`);
}

export function createClient(data: CreateClientInput): Promise<Client> {
  return request<Client>('/clients', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateClient(
  id: string,
  data: Partial<CreateClientInput>,
): Promise<Client> {
  return request<Client>(`/clients/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteClient(id: string): Promise<void> {
  return request<void>(`/clients/${id}`, { method: 'DELETE' });
}

export function sendInvite(email: string): Promise<void> {
  return request<void>('/clients/invite', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export function onboard(data: OnboardInput): Promise<Client> {
  return request<Client>('/clients/onboard', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
