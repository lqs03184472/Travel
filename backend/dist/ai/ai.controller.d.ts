import type { JwtUser } from '../auth/jwt-auth.guard';
import { AdoptPlanDto, AiPlanDto } from './dto/ai.dto';
import { AiService } from './ai.service';
export declare class AiController {
    private aiService;
    constructor(aiService: AiService);
    plan(user: JwtUser, dto: AiPlanDto): Promise<import("./types").AiPlanResponse>;
    adopt(user: JwtUser, dto: AdoptPlanDto): Promise<{
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
