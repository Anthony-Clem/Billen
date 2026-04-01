import { Expose } from 'class-transformer';

interface AddressSnapshot {
  line1: string | null;
  line2?: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
}

export class ClientDto {
  @Expose() id!: string;
  @Expose() userId!: string;
  @Expose() name!: string;
  @Expose() email!: string;
  @Expose() phone!: string | null;
  @Expose() address?: AddressSnapshot;
  @Expose() createdAt!: Date;
  @Expose() updatedAt!: Date;
}
