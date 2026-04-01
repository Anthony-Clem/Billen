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
import { plainToInstance } from 'class-transformer';
import { type SessionData } from 'express-session';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { SessionGuard } from '@/common/guards/auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '../user/entities/user.entity';
import { UserDto } from '../user/dtos/user.dto';
import { RedisService } from '@/common/redis/redis.service';
import type { ApiResponse } from '@/common/types/api-response';

interface DestroyableSession extends SessionData {
  destroy(callback: (err: unknown) => void): void;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly redisService: RedisService,
  ) {}

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
  async logout(
    @Session() session: DestroyableSession,
  ): Promise<ApiResponse<null>> {
    const userId = session.userId;
    await new Promise<void>((resolve, reject) => {
      session.destroy((err) => {
        if (err)
          return reject(
            err instanceof Error ? err : new Error(JSON.stringify(err)),
          );
        resolve();
      });
    });
    if (userId) {
      await this.redisService.del(`user:${userId}`);
    }
    return {
      data: null,
      message: 'Logged out successfully',
      statusCode: HttpStatus.OK,
    };
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
