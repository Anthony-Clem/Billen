import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column({ name: 'status' })
  status!: string;

  @Column({ name: 'amount', type: 'decimal' })
  amount!: number;

  @Column({ name: 'currency' })
  currency!: string;

  @Column({ name: 'issue_date', type: 'date' })
  issueDate!: Date;

  @Column({ name: 'due_date', type: 'date' })
  dueDate!: Date;

  @Column({ name: 'line_items', type: 'json' })
  lineItems!: Record<string, unknown>[];

  @Column({ name: 'pdf_url', nullable: true })
  pdfUrl!: string | null;

  @Column({ name: 'notes', nullable: true })
  notes!: string | null;

  @Column({ name: 'created_at', type: 'datetime' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'datetime' })
  updatedAt!: Date;
}
