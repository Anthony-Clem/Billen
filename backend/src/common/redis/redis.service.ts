import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createClient, type RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit {
  private client: RedisClientType | null = null;

  async onModuleInit() {
    const url = process.env.REDIS_URL;
    if (!url) {
      Logger.warn('REDIS_URL not set. Redis cache disabled (dev mode).');
      return;
    }
    try {
      this.client = createClient({ url }) as RedisClientType;
      this.client.on('error', (err) => Logger.error('RedisService error', err));
      await this.client.connect();
      Logger.log('RedisService connected');
    } catch (err) {
      Logger.error('RedisService failed to connect. Cache disabled.', err);
      this.client = null;
    }
  }

  async get(key: string): Promise<string | null> {
    return this.client?.get(key) ?? null;
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    await this.client?.set(key, value, { EX: ttlSeconds });
  }

  async del(key: string): Promise<void> {
    await this.client?.del(key);
  }
}
