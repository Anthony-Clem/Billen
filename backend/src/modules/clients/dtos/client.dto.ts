import { Expose, Type } from 'class-transformer';

class AddressDto {
  @Expose() line1!: string | null;
  @Expose() line2?: string | null;
  @Expose() city!: string | null;
  @Expose() state!: string | null;
  @Expose() zip!: string | null;
}

export class ClientDto {
  @Expose() id!: string;
  @Expose() userId!: string;
  @Expose() name!: string;
  @Expose() email!: string;
  @Expose() phone!: string | null;
  @Expose()
  @Type(() => AddressDto)
  address?: AddressDto;
  @Expose() createdAt!: Date;
  @Expose() updatedAt!: Date;
}
