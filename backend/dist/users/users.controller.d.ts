import type { JwtUser } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
declare class UpdateProfileDto {
    nickname?: string;
    avatar?: string;
}
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getProfile(user: JwtUser): Promise<{
        tripCount: number;
        favoriteCount: number;
        email: string | null;
        phone: string | null;
        nickname: string | null;
        id: string;
        avatar: string | null;
        aiCount: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateProfile(user: JwtUser, dto: UpdateProfileDto): Promise<{
        email: string | null;
        phone: string | null;
        nickname: string | null;
        id: string;
        avatar: string | null;
        aiCount: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getStats(user: JwtUser): Promise<{
        tripCount: number;
        totalCost: number;
        totalDays: number;
        totalKm: number;
        aiCount: number;
    }>;
    listFavorites(user: JwtUser): Promise<({
        steps: {
            id: string;
            createdAt: Date;
            day: number;
            title: string;
            tripId: string;
            order: number;
            type: string;
            startTime: string | null;
            endTime: string | null;
            durationMin: number | null;
            cost: number | null;
            details: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        days: number;
        title: string;
        destination: string;
        startDate: Date | null;
        endDate: Date | null;
        budget: number | null;
        isPublic: boolean;
        source: string;
    })[]>;
    toggleFavorite(user: JwtUser, tripId: string): Promise<{
        favorited: boolean;
    }>;
    removeFavorite(user: JwtUser, tripId: string): Promise<{
        favorited: boolean;
    }>;
}
export {};
