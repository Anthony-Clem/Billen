import { User } from '@/modules/user/entities/user.entity';

declare global {
  namespace Express {
    interface Request {
      currentUser?: User | null;
    }
  }
}

export {};
