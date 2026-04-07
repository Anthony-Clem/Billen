import { IsDecimal, IsNotEmpty, IsString } from 'class-validator';

export class LineItemDto {
  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsDecimal()
  unitPrice!: number;

  @IsDecimal()
  quantity!: number;

  @IsDecimal()
  total!: number;
}
