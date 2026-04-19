const API_BASE = '/api/v1';

export type InvoiceStatus = 'draft' | 'sent' | 'overdue';

export type LineItemInput = {
  description: string;
  quantity: number;
  unitPrice: number;
};

export type LineItem = LineItemInput & { total: number };

export type Invoice = {
  id: string;
  userId: string;
  clientId: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  amount: number;
  currency: string;
  issueDate: string;
  dueDate: string;
  lineItems: LineItem[];
  pdfUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateInvoiceInput = {
  clientId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  issueDate: string;
  dueDate: string;
  lineItems: LineItemInput[];
  notes?: string;
};

export type UpdateInvoiceInput = {
  invoiceNumber?: string;
  currency?: string;
  issueDate?: string;
  dueDate?: string;
  lineItems?: LineItemInput[];
  notes?: string;
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

export function getInvoices(): Promise<Invoice[]> {
  return request<Invoice[]>('/invoices');
}

export function getInvoice(id: string): Promise<Invoice> {
  return request<Invoice>(`/invoices/${id}`);
}

export function getInvoicesByClient(clientId: string): Promise<Invoice[]> {
  return request<Invoice[]>(`/invoices/client/${clientId}`);
}

export function createInvoice(data: CreateInvoiceInput): Promise<Invoice> {
  return request<Invoice>('/invoices', {
    method: 'POST',
    body: JSON.stringify({
      ...data,
      amount: parseFloat(String(data.amount)),
      lineItems: data.lineItems.map((item) => ({
        ...item,
        quantity: Number(item.quantity),
        unitPrice: parseFloat(String(item.unitPrice)),
        total: Number(item.quantity) * parseFloat(String(item.unitPrice)),
      })),
    }),
  });
}

export function updateInvoice(id: string, data: UpdateInvoiceInput): Promise<Invoice> {
  return request<Invoice>(`/invoices/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteInvoice(id: string): Promise<void> {
  return request<void>(`/invoices/${id}`, { method: 'DELETE' });
}

export function sendInvoice(id: string): Promise<Invoice> {
  return request<Invoice>(`/invoices/${id}/send`, { method: 'POST' });
}
