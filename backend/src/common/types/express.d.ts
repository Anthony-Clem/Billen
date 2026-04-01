import { User } from '@/modules/user/entities/user.entity';
import { InvitePayload } from './invite-payload';

declare global {
  namespace Express {
    interface Request {
      currentUser?: User | null;
      invitePayload?: InvitePayload | null;
    }
  }
}

export {};
