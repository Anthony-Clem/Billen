import { IsEmail, IsStrongPassword } from 'class-validator';
import { Match } from 'src/common/decorators/match.decorator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;

  @Match('password', { message: 'Passwords do not match' })
  confirmPassword: string;
}
