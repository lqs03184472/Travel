import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
export declare class AuthService {
    private prisma;
    private jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    register(dto: RegisterDto): Promise<{
        token: string;
        user: {
            email: string | null;
            phone: string | null;
            nickname: string | null;
            id: string;
            avatar: string | null;
            aiCount: number;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    login(dto: LoginDto): Promise<{
        token: string;
        user: {
            email: string | null;
            phone: string | null;
            nickname: string | null;
            id: string;
            avatar: string | null;
            aiCount: number;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    guest(): Promise<{
        token: string;
        user: {
            email: string | null;
            phone: string | null;
            nickname: string | null;
            id: string;
            avatar: string | null;
            aiCount: number;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    private buildAuthResult;
}
