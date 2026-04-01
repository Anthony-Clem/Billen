import { UserService } from '@/modules/user/user.service';
import { RedisService } from '@/common/redis/redis.service';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { User } from '@/modules/user/entities/user.entity';

const USER_CACHE_TTL = 24 * 60 * 60; // 24 hours, matches session TTL

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly userService: UserService,
    private readonly redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = request.session.userId;

    if (!userId) {
      throw new UnauthorizedException('Not authenticated');
    }

    const cacheKey = `user:${userId}`;
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      request.currentUser = JSON.parse(cached) as User;
      return true;
    }

    const user = await this.userService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.redisService.set(cacheKey, JSON.stringify(user), USER_CACHE_TTL);
    request.currentUser = user;
    return true;
  }
}
