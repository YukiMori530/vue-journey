import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { AuthPayload, AuthUser } from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthPayload> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('该邮箱已注册');
    }

    const password = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password,
        nickname: dto.nickname.trim(),
      },
    });

    return this.buildAuthPayload(user);
  }

  async login(dto: LoginDto): Promise<AuthPayload> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    const matched = await bcrypt.compare(dto.password, user.password);
    if (!matched) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    return this.buildAuthPayload(user);
  }

  async findById(id: number): Promise<AuthUser | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      return null;
    }
    return this.toAuthUser(user);
  }

  private buildAuthPayload(user: {
    id: number;
    email: string;
    nickname: string;
  }): AuthPayload {
    const authUser = this.toAuthUser(user);
    const token = this.jwtService.sign(
      { sub: authUser.id, email: authUser.email },
      {
        secret: this.configService.get<string>('JWT_SECRET') ?? 'tuhui-dev-secret',
        expiresIn: '7d',
      },
    );

    return { token, user: authUser };
  }

  private toAuthUser(user: {
    id: number;
    email: string;
    nickname: string;
  }): AuthUser {
    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
    };
  }
}
