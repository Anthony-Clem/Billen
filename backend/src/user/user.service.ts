import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { plainToInstance } from 'class-transformer';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const user = await this.userRepository.save(
      this.userRepository.create({
        ...dto,
        password: dto.password
          ? await this.authService.hashPassword(dto.password)
          : null,
      }),
    );

    return plainToInstance(UserResponseDto, user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    let user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.name = dto.name;

    user = await this.userRepository.save(user);

    return plainToInstance(UserResponseDto, user);
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }
}
