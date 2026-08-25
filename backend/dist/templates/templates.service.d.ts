import { OnModuleInit } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class TemplatesService implements OnModuleInit {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    list(): Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        days: number;
        title: string;
        destination: string;
        steps: Prisma.JsonValue;
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
        steps: Prisma.JsonValue;
        description: string | null;
        tags: string;
        coverColor: string;
        isOfficial: boolean;
    }>;
    apply(userId: string, templateId: string): Promise<{
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
            details: Prisma.JsonValue | null;
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
