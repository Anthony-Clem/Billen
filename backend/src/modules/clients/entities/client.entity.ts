import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

class Address {
  @Column({ name: 'address_line1', nullable: true, type: 'text' })
  line1!: string | null;

  @Column({ name: 'address_line2', nullable: true, type: 'text' })
  line2?: string | null;

  @Column({ name: 'address_city', nullable: true, type: 'text' })
  city!: string | null;

  @Column({ name: 'address_state', nullable: true, type: 'text' })
  state!: string | null;

  @Column({ name: 'address_zip', nullable: true, type: 'text' })
  zip!: string | null;
}

@Entity({ name: 'clients' })
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column()
  name!: string;

  @Column({ unique: false })
  email!: string;

  @Column({ nullable: true, type: 'text' })
  phone!: string | null;

  @Column(() => Address)
  address?: Address;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
