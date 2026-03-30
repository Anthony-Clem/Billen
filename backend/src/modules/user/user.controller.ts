import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from './entities/user.entity';
import { Serialize } from '@/common/interceptors/serialize.interceptor';
import { UserDto } from './dtos/user.dto';
import { AuthGuard } from '@/common/guards/auth.guard';

@Controller('users')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @Serialize(UserDto)
  getMe(@CurrentUser() user: User): User {
    console.log(user);

    return user;
  }
}
