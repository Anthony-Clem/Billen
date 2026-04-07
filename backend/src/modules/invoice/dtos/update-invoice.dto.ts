import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsDecimal,
  IsOptional,
  IsString,
} from 'class-validator';
import { LineItemDto } from './line-item.dto';

export class UpdateInvoiceDto {
  @IsString()
  @IsOptional()
  invoiceNumber?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsDecimal()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsDateString()
  @IsOptional()
  issueDate?: Date;

  @IsDateString()
  @IsOptional()
  dueDate?: Date;

  @IsArray()
  @IsOptional()
  @Type(() => LineItemDto)
  lineItems?: LineItemDto[];

  @IsString()
  @IsOptional()
  pdfUrl?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
