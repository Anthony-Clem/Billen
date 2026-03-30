import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  findById(id: string) {
    return this.repository.findOne({
      where: {
        id,
      },
    });
  }

  findByEmail(email: string) {
    return this.repository.findOne({
      where: {
        email,
      },
    });
  }

  async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
    const user = this.repository.create({ ...data });

    return this.repository.save(user);
  }
}
