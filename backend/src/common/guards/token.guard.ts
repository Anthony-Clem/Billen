import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { type Request } from 'express';
import { RedisService } from '../redis/redis.service';
import { OnboardDto } from '@/modules/clients/dtos/onboard.dto';
import { InvitePayload } from '../types/invite-payload';

interface OnboardRequest extends Request {
  body: OnboardDto;
  query: { token?: string };
}

export class TokenGuard implements CanActivate {
  constructor(private readonly redisService: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<OnboardRequest>();
    const token = request.body?.token ?? request.query?.token;

    if (!token) throw new BadRequestException('No token provided');

    const raw = await this.redisService.get(`invite:${token}`);
    if (!raw) throw new BadRequestException('Invalid token');

    const payload = JSON.parse(raw) as InvitePayload;
    if (Date.now() > payload.expiresAt) {
      await this.redisService.del(`invite:${token}`);
      throw new BadRequestException('Invite token has expired');
    }

    request.invitePayload = payload;
    return true;
  }
}
