import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { InvoiceStatus } from '../enums/invoice-status.enum';

export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

@Entity({ name: 'invoices' })
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'user_id' })
  userId!: string;

  @Index()
  @Column({ name: 'client_id' })
  clientId!: string;

  @Column({ name: 'invoice_number' })
  invoiceNumber!: string;

  @Column({ name: 'status', type: 'varchar', default: InvoiceStatus.DRAFT })
  status!: InvoiceStatus;

  @Column({ name: 'amount', type: 'decimal' })
  amount!: number;

  @Column({ name: 'currency' })
  currency!: string;

  @Column({ name: 'issue_date', type: 'date' })
  issueDate!: Date;

  @Column({ name: 'due_date', type: 'date' })
  dueDate!: Date;

  @Column({ name: 'line_items', type: 'json' })
  lineItems!: LineItem[];

  @Column({ name: 'pdf_url', nullable: true, type: 'text' })
  pdfUrl!: string | null;

  @Column({ name: 'notes', nullable: true, type: 'text' })
  notes!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
