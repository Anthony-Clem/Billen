import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

class Address {
  @Column({ nullable: true, type: 'text' })
  line1!: string | null;

  @Column({ nullable: true, type: 'text' })
  line2?: string | null;

  @Column({ nullable: true, type: 'text' })
  city!: string | null;

  @Column({ nullable: true, type: 'text' })
  state!: string | null;

  @Column({ nullable: true, type: 'text' })
  zip!: string | null;
}

@Entity({
  name: 'users',
})
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ name: 'google_id', nullable: true, type: 'text' })
  googleId!: string | null;

  @Column(() => Address)
  address?: Address;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
