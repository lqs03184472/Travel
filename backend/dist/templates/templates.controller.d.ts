import type { JwtUser } from '../auth/jwt-auth.guard';
import { TemplatesService } from './templates.service';
export declare class TemplatesController {
    private templatesService;
    constructor(templatesService: TemplatesService);
    list(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        days: number;
        title: string;
        destination: string;
        steps: import("@prisma/client/runtime/library").JsonValue;
        description: string | null;
        tags: string;
        coverColor: string;
        isOfficial: boolean;
    }[]>;
    getOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        days: number;
        title: string;
        destination: string;
        steps: import("@prisma/client/runtime/library").JsonValue;
        description: string | null;
        tags: string;
        coverColor: string;
        isOfficial: boolean;
    }>;
    apply(user: JwtUser, id: string): Promise<{
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
    }>;
}
