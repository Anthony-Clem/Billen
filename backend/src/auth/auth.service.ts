import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { LessThan, Repository } from 'typeorm';
import * as uuid from 'uuid';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshToken } from './entities/refresh-token.entity';
import { type Response } from 'express';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Profile } from 'passport-google-oauth20';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.userService.create(dto);
    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatching = await this.comparePasswords(
      user.password as string,
      dto.password,
    );

    if (!isMatching) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  async refresh(refreshToken: string | null, id: string, res: Response) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh Token not found');
    }

    console.log(id);

    const refreshTokenInDB = await this.refreshTokenRepository.findOne({
      where: {
        user: {
          id: id,
        },
        token: refreshToken,
      },
      relations: ['user'],
    });

    if (!refreshTokenInDB) {
      throw new UnauthorizedException('Invalid refreshToken');
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return this.generateTokens(refreshTokenInDB.user);
  }

  async validateGoogleUser(profile: Profile) {
    const emails = profile.emails;
    if (!emails) {
      throw new InternalServerErrorException('No email on google user');
    }

    const email = emails[0].value;

    const name = profile.displayName;
    const googleId = profile.id;

    let user = await this.userService.findByEmail(email);

    if (!user) {
      user = await this.userService.create({ email, name, googleId });
    }

    const tokens = await this.generateTokens(user);
    return { user, ...tokens };
  }

  private async generateTokens(user: User) {
    const accessToken = this.jwtService.sign({
      sub: user.id,
      name: user.name,
      email: user.email,
    });

    const refreshToken = uuid.v4();

    await this.refreshTokenRepository.save({
      token: refreshToken,
      user,
    });

    return { accessToken, refreshToken };
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private async comparePasswords(
    hash: string,
    password: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async clearExpiredRefreshTokens() {
    const tokens = await this.refreshTokenRepository.find({
      where: {
        expiresAt: LessThan(new Date()),
      },
    });

    if (tokens.length > 0) {
      await this.refreshTokenRepository.remove(tokens);
      console.log(`Cleared ${tokens.length} expired refresh tokens`);
    }
  }
}
