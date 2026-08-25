import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<{
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
    updateProfile(userId: string, data: {
        nickname?: string;
        avatar?: string;
    }): Promise<{
        email: string | null;
        phone: string | null;
        nickname: string | null;
        id: string;
        avatar: string | null;
        aiCount: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getStats(userId: string): Promise<{
        tripCount: number;
        totalCost: number;
        totalDays: number;
        totalKm: number;
        aiCount: number;
    }>;
    listFavorites(userId: string): Promise<({
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
    toggleFavorite(userId: string, tripId: string): Promise<{
        favorited: boolean;
    }>;
}
