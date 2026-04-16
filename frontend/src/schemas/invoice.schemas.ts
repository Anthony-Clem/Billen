import { z } from 'zod';

export const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.coerce.number().positive('Must be greater than 0'),
  unitPrice: z.coerce.number().min(0, 'Must be 0 or more'),
});

export const invoiceDetailsSchema = z.object({
  clientId: z.string().min(1, 'Select a client'),
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  issueDate: z.string().min(1, 'Issue date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  currency: z.string().min(1, 'Currency is required'),
  notes: z.string().optional(),
});

export const updateInvoiceSchema = z.object({
  invoiceNumber: z.string().min(1, 'Invoice number is required').optional(),
  issueDate: z.string().optional(),
  dueDate: z.string().optional(),
  currency: z.string().min(1, 'Currency is required').optional(),
  notes: z.string().optional(),
});
