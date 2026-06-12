import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: '请输入有效邮箱' })
  email!: string;

  @IsString()
  @MinLength(6, { message: '密码至少 6 位' })
  @MaxLength(32)
  password!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  nickname!: string;
}
