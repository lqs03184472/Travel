import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

export interface JwtUser {
  userId: string;
  email?: string | null;
  nickname?: string | null;
  guest?: boolean;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const auth = request.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
      throw new UnauthorizedException('请先登录');
    }
    try {
      request['user'] = await this.jwtService.verifyAsync<JwtUser>(auth.slice(7));
    } catch {
      throw new UnauthorizedException('登录已过期，请重新登录');
    }
    return true;
  }
}
