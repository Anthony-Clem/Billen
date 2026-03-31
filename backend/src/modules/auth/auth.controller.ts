import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Session,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { type SessionData } from 'express-session';
import { LoginDto } from './dtos/login.dto';
import { SessionGuard } from '@/common/guards/auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '../user/entities/user.entity';
import { UserDto } from '../user/dtos/user.dto';
import { plainToInstance } from 'class-transformer';

type ApiResponse<T> = { data: T; message: string; statusCode: number };

interface DestroyableSession extends SessionData {
  destroy(callback: (err: unknown) => void): void;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Session() session: SessionData,
  ): Promise<ApiResponse<UserDto>> {
    const user = await this.authService.register(dto);
    session.userId = user.id;
    return {
      data: plainToInstance(UserDto, user, { excludeExtraneousValues: true }),
      message: 'User registered successfully',
      statusCode: HttpStatus.CREATED,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Session() session: SessionData,
  ): Promise<ApiResponse<UserDto>> {
    const user = await this.authService.login(dto);
    session.userId = user.id;
    return {
      data: plainToInstance(UserDto, user, { excludeExtraneousValues: true }),
      message: 'User logged in successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Session() session: DestroyableSession): Promise<ApiResponse<null>> {
    return new Promise((resolve, reject) => {
      session.destroy((err: unknown) => {
        if (err) return reject(err);
        resolve({ data: null, message: 'Logged out successfully', statusCode: HttpStatus.OK });
      });
    });
  }

  @Get('me')
  @UseGuards(SessionGuard)
  getMe(@CurrentUser() user: User): ApiResponse<UserDto> {
    return {
      data: plainToInstance(UserDto, user, { excludeExtraneousValues: true }),
      message: 'User fetched successfully',
      statusCode: HttpStatus.OK,
    };
  }
}
