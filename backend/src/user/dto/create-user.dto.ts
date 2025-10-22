import {
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
  ValidateIf,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  email: string;

  @ValidateIf((o: CreateUserDto) => !o.googleId)
  @IsStrongPassword()
  password?: string;

  @IsOptional()
  googleId?: string;
}
