import { Body, Controller, Post, Session } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { type SessionData } from 'express-session';
import { LoginDto } from './dtos/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Session() session: SessionData,
  ): Promise<{ message: string }> {
    const user = await this.authService.register(dto);
    session.userId = user.id;
    return { message: 'User registered successfully' };
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Session() session: SessionData,
  ): Promise<{ message: string }> {
    const user = await this.authService.login(dto);
    session.userId = user.id;
    return { message: 'User logged in successfully' };
  }

  @Post('logout')
  logout(@Session() session: SessionData) {
    session.userId = null;
  }
}
