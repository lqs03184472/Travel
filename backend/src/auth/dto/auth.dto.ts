import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @MinLength(6, { message: '密码至少 6 位' })
  password: string;

  @IsOptional()
  @IsString()
  nickname?: string;
}

export class LoginDto {
  @IsString()
  account: string; // 邮箱或手机号

  @IsString()
  password: string;
}
