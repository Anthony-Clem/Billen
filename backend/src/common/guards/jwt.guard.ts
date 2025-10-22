import { AuthGuard as NestAuthGuard } from '@nestjs/passport';

export class JwtGuard extends NestAuthGuard('jwt') {
  constructor() {
    super();
  }
}
