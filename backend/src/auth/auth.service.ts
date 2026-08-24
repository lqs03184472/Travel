import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('邮箱或手机号至少填写一个');
    }
    const exists = await this.prisma.user.findFirst({
      where: {
        OR: [
          ...(dto.email ? [{ email: dto.email }] : []),
          ...(dto.phone ? [{ phone: dto.phone }] : []),
        ],
      },
    });
    if (exists) throw new ConflictException('该账号已注册，请直接登录');

    const hash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        password: hash,
        nickname:
          dto.nickname || dto.email?.split('@')[0] || dto.phone || '旅行者',
      },
    });
    return this.buildAuthResult(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.account }, { phone: dto.account }] },
    });
    if (!user?.password || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('账号或密码错误');
    }
    return this.buildAuthResult(user);
  }

  /** 游客模式：可浏览，可先创建行程，后续可升级为正式账号 */
  async guest() {
    const name = '游客' + Math.floor(1000 + Math.random() * 9000);
    const user = await this.prisma.user.create({
      data: { nickname: name, password: Math.random().toString(36).slice(2) },
    });
    return this.buildAuthResult(user, true);
  }

  private buildAuthResult(user: User, guest = false) {
    const token = this.jwt.sign({
      userId: user.id,
      email: user.email,
      nickname: user.nickname,
      guest,
    });
    const { password, ...safe } = user;
    return { token, user: safe };
  }
}
