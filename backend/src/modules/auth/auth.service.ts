import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dtos/register.dto';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { LoginDto } from './dtos/login.dto';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async register({
    name,
    email,
    password,
    confirmPassword,
  }: RegisterDto): Promise<User> {
    // check if passwords match
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords must match');
    }

    // search for existing user w/ email
    const existingUser = await this.userService.findByEmail(email);
    // throw 409 if in use
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // create & return user
    return this.userService.create({
      name,
      email,
      password: hashedPassword,
      googleId: null,
    });
  }

  async login({ email, password }: LoginDto): Promise<User> {
    // search for user w/ email
    const user = await this.userService.findByEmail(email);
    // if no user | no password due to google login | incorrect password throw 401
    if (
      !user ||
      !user.password ||
      !(await bcrypt.compare(password, user.password))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }
}
