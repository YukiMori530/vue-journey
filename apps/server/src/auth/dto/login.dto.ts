import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: '请输入有效邮箱' })
  email!: string;

  @IsString()
  @MinLength(6, { message: '密码至少 6 位' })
  password!: string;
}
