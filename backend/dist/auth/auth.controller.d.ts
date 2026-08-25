import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
}
