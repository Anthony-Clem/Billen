import session from 'express-session';
import { createClient } from 'redis';
import { RedisStore } from 'connect-redis';
import { Logger } from '@nestjs/common';

export async function createSessionOptions(): Promise<session.SessionOptions> {
  const sessionOptions: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'session_secret',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    },
  };

  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    Logger.warn('REDIS_URL not set. Using MemoryStore (dev only).');
    return sessionOptions;
  }

  try {
    const redisClient = createClient({ url: redisUrl });
    redisClient.on('error', (err) => Logger.error('Redis Client Error', err));
    await redisClient.connect();

    sessionOptions.store = new RedisStore({
      client: redisClient,
      prefix: 'sess:',
    });

    Logger.log('Redis session store enabled');
  } catch (err) {
    Logger.error(
      'Failed to connect to Redis. Falling back to MemoryStore.',
      err,
    );
  }

  return sessionOptions;
}
