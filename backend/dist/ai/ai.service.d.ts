import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AdoptPlanDto, AiPlanDto } from './dto/ai.dto';
import { AiPlanResponse } from './types';
export declare class AiService {
    private prisma;
    private config;
    constructor(prisma: PrismaService, config: ConfigService);
    plan(userId: string, dto: AiPlanDto): Promise<AiPlanResponse>;
    private planWithDeepSeek;
    adopt(userId: string, dto: AdoptPlanDto): Promise<{
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
