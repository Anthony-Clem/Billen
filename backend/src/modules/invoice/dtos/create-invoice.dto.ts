import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsDecimal,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { LineItemDto } from './line-item.dto';

export class CreateInvoiceDto {
  @IsUUID()
  @IsNotEmpty()
  clientId!: string;

  @IsString()
  @IsNotEmpty()
  invoiceNumber!: string;

  @IsDecimal()
  amount!: number;

  @IsString()
  @IsNotEmpty()
  currency!: string;

  @IsDateString()
  issueDate!: string;

  @IsDateString()
  dueDate!: string;

  @IsArray()
  @Type(() => LineItemDto)
  lineItems!: LineItemDto[];

  @IsString()
  @IsOptional()
  notes?: string;
}
