import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dtos/create-client.dto';
import { UpdateClientDto } from './dtos/update-client.dto';
import { InviteDto } from './dtos/invite.dto';
import { OnboardDto } from './dtos/onboard.dto';
import { RedisService } from '@/common/redis/redis.service';
import { EmailService } from '@/common/email/email.service';

const INVITE_TTL_SECONDS = 48 * 60 * 60;

interface InvitePayload {
  userId: string;
  clientEmail: string;
  expiresAt: number;
}

function buildAddress(dto: {
  addressLine1?: string;
  addressLine2?: string;
  addressCity?: string;
  addressState?: string;
  addressZip?: string;
}) {
  return {
    line1: dto.addressLine1 ?? null,
    line2: dto.addressLine2 ?? null,
    city: dto.addressCity ?? null,
    state: dto.addressState ?? null,
    zip: dto.addressZip ?? null,
  };
}

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private readonly repository: Repository<Client>,
    private readonly redisService: RedisService,
    private readonly emailService: EmailService,
  ) {}

  findAll(userId: string): Promise<Client[]> {
    return this.repository.find({ where: { userId } });
  }

  async findOne(id: string, userId: string): Promise<Client> {
    const client = await this.repository.findOne({ where: { id, userId } });
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  async create(userId: string, dto: CreateClientDto): Promise<Client> {
    const client = this.repository.create({
      userId,
      name: dto.name,
      email: dto.email,
      phone: dto.phone ?? null,
      address: buildAddress(dto),
    });
    return this.repository.save(client);
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateClientDto,
  ): Promise<Client> {
    const client = await this.findOne(id, userId);
    if (dto.name !== undefined) client.name = dto.name;
    if (dto.email !== undefined) client.email = dto.email;
    if (dto.phone !== undefined) client.phone = dto.phone ?? null;
    if (
      dto.addressLine1 !== undefined ||
      dto.addressLine2 !== undefined ||
      dto.addressCity !== undefined ||
      dto.addressState !== undefined ||
      dto.addressZip !== undefined
    ) {
      client.address = {
        ...client.address,
        ...buildAddress(dto),
      };
    }
    return this.repository.save(client);
  }

  async remove(id: string, userId: string): Promise<void> {
    const client = await this.findOne(id, userId);
    await this.repository.remove(client);
  }

  async sendInvite(userId: string, { email }: InviteDto): Promise<void> {
    const token = randomBytes(32).toString('hex');
    const expiresAt = Date.now() + INVITE_TTL_SECONDS * 1000;
    const payload: InvitePayload = { userId, clientEmail: email, expiresAt };

    await this.redisService.set(
      `invite:${token}`,
      JSON.stringify(payload),
      INVITE_TTL_SECONDS,
    );

    const frontendUrl =
      process.env.FRONTEND_URL ?? 'http://localhost:5173';
    const onboardingUrl = `${frontendUrl}/onboard?token=${token}&expires=${expiresAt}`;

    await this.emailService.sendOnboardingInvite(email, onboardingUrl);
  }

  async onboard(dto: OnboardDto): Promise<Client> {
    const raw = await this.redisService.get(`invite:${dto.token}`);
    if (!raw) throw new BadRequestException('Invalid or expired invite token');

    const payload = JSON.parse(raw) as InvitePayload;
    if (Date.now() > payload.expiresAt) {
      await this.redisService.del(`invite:${dto.token}`);
      throw new BadRequestException('Invite token has expired');
    }

    const client = this.repository.create({
      userId: payload.userId,
      email: payload.clientEmail,
      name: dto.name,
      phone: dto.phone ?? null,
      address: buildAddress(dto),
    });
    const saved = await this.repository.save(client);
    await this.redisService.del(`invite:${dto.token}`);
    return saved;
  }
}
