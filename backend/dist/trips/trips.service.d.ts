import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTripDto, StepDto, UpdateTripDto } from './dto/trip.dto';
export declare class TripsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateTripDto): Promise<{
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
    listMine(userId: string): Promise<any[]>;
    listPublic(keyword?: string): Promise<any[]>;
    getOne(userId: string, tripId: string): Promise<any>;
    update(userId: string, tripId: string, dto: UpdateTripDto): Promise<{
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
    remove(userId: string, tripId: string): Promise<{
        success: boolean;
    }>;
    saveSteps(userId: string, tripId: string, steps: StepDto[]): Promise<({
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
    }) | null>;
    copy(userId: string, tripId: string): Promise<{
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
    private ensureOwner;
    private withSummary;
}
