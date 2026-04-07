import { Expose, Type } from 'class-transformer';

export class LineItemDto {
  @Expose()
  description!: string;

  @Expose()
  unitPrice!: number;

  @Expose()
  quantity!: number;

  @Expose()
  total!: number;
}

export class InvoiceDto {
  @Expose()
  id!: string;

  @Expose()
  userId!: string;

  @Expose()
  clientId!: string;

  @Expose()
  invoiceNumber!: string;

  @Expose()
  status!: string;

  @Expose()
  amount!: number;

  @Expose()
  currency!: string;

  @Expose()
  issueDate!: Date;

  @Expose()
  dueDate!: Date;

  @Expose()
  @Type(() => LineItemDto)
  lineItems!: LineItemDto[];

  @Expose()
  pdfUrl!: string | null;

  @Expose()
  notes!: string | null;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}
