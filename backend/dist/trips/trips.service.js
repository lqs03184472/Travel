"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const tripInclude = {
    steps: { orderBy: [{ day: 'asc' }, { order: 'asc' }] },
};
let TripsService = class TripsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        const days = dto.days || 1;
        const trip = await this.prisma.trip.create({
            data: {
                userId,
                title: dto.title,
                destination: dto.destination,
                startDate: dto.startDate ? new Date(dto.startDate) : null,
                endDate: dto.endDate ? new Date(dto.endDate) : null,
                days,
                budget: dto.budget,
                isPublic: dto.isPublic || false,
                source: dto.source || 'manual',
                steps: dto.steps?.length
                    ? {
                        create: dto.steps.map((s, i) => ({
                            type: s.type,
                            title: s.title,
                            day: s.day || 1,
                            order: s.order ?? i,
                            startTime: s.startTime,
                            endTime: s.endTime,
                            durationMin: s.durationMin,
                            cost: s.cost,
                            details: s.details || {},
                        })),
                    }
                    : undefined,
            },
            include: tripInclude,
        });
        return trip;
    }
    async listMine(userId) {
        const trips = await this.prisma.trip.findMany({
            where: { userId },
            include: tripInclude,
            orderBy: { updatedAt: 'desc' },
        });
        return trips.map((t) => this.withSummary(t));
    }
    async listPublic(keyword) {
        const trips = await this.prisma.trip.findMany({
            where: {
                isPublic: true,
                ...(keyword
                    ? { title: { contains: keyword } }
                    : {}),
            },
            include: { steps: true, user: { select: { nickname: true } } },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        return trips.map((t) => this.withSummary(t));
    }
    async getOne(userId, tripId) {
        const trip = await this.prisma.trip.findUnique({
            where: { id: tripId },
            include: { ...tripInclude, user: { select: { nickname: true } } },
        });
        if (!trip)
            throw new common_1.NotFoundException('行程不存在');
        if (trip.userId !== userId && !trip.isPublic) {
            throw new common_1.NotFoundException('行程不存在');
        }
        return this.withSummary(trip);
    }
    async update(userId, tripId, dto) {
        await this.ensureOwner(userId, tripId);
        return this.prisma.trip.update({
            where: { id: tripId },
            data: {
                title: dto.title,
                destination: dto.destination,
                startDate: dto.startDate ? new Date(dto.startDate) : undefined,
                endDate: dto.endDate ? new Date(dto.endDate) : undefined,
                days: dto.days,
                budget: dto.budget,
                isPublic: dto.isPublic,
            },
            include: tripInclude,
        });
    }
    async remove(userId, tripId) {
        await this.ensureOwner(userId, tripId);
        await this.prisma.trip.delete({ where: { id: tripId } });
        return { success: true };
    }
    async saveSteps(userId, tripId, steps) {
        const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
        if (!trip || trip.userId !== userId) {
            throw new common_1.NotFoundException('行程不存在');
        }
        const maxDay = steps.reduce((m, s) => Math.max(m, s.day || 1), 1);
        await this.prisma.$transaction([
            this.prisma.tripStep.deleteMany({ where: { tripId } }),
            this.prisma.trip.update({
                where: { id: tripId },
                data: { days: Math.max(trip.days || 1, maxDay) },
            }),
        ]);
        if (steps.length) {
            await this.prisma.tripStep.createMany({
                data: steps.map((s, i) => ({
                    tripId,
                    type: s.type,
                    title: s.title,
                    day: s.day || 1,
                    order: s.order ?? i,
                    startTime: s.startTime,
                    endTime: s.endTime,
                    durationMin: s.durationMin,
                    cost: s.cost,
                    details: s.details || {},
                })),
            });
        }
        return this.prisma.trip.findUnique({
            where: { id: tripId },
            include: tripInclude,
        });
    }
    async copy(userId, tripId) {
        const trip = await this.prisma.trip.findUnique({
            where: { id: tripId },
            include: { steps: true },
        });
        if (!trip)
            throw new common_1.NotFoundException('行程不存在');
        if (trip.userId !== userId && !trip.isPublic) {
            throw new common_1.NotFoundException('行程不存在');
        }
        const copy = await this.prisma.trip.create({
            data: {
                userId,
                title: `${trip.title}（副本）`,
                destination: trip.destination,
                days: trip.days,
                budget: trip.budget,
                source: trip.source,
                steps: trip.steps.length
                    ? {
                        create: trip.steps.map((s, i) => ({
                            type: s.type,
                            title: s.title,
                            day: s.day,
                            order: i,
                            startTime: s.startTime,
                            endTime: s.endTime,
                            durationMin: s.durationMin,
                            cost: s.cost,
                            details: s.details || {},
                        })),
                    }
                    : undefined,
            },
            include: tripInclude,
        });
        return copy;
    }
    async ensureOwner(userId, tripId) {
        const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
        if (!trip || trip.userId !== userId) {
            throw new common_1.NotFoundException('行程不存在');
        }
    }
    withSummary(trip) {
        const steps = trip.steps || [];
        let totalCost = 0;
        const budget = { transport: 0, hotel: 0, ticket: 0, food: 0, other: 0 };
        for (const s of steps) {
            const c = s.cost || 0;
            totalCost += c;
            if (s.type.startsWith('transport'))
                budget.transport += c;
            else if (s.type === 'hotel')
                budget.hotel += c;
            else if (s.type === 'ticket')
                budget.ticket += c;
            else if (s.type === 'food')
                budget.food += c;
            else
                budget.other += c;
        }
        const byDay = {};
        for (const s of steps) {
            const d = s.day || 1;
            byDay[d] = (byDay[d] || 0) + 1;
        }
        return {
            ...trip,
            summary: {
                totalCost: Math.round(totalCost),
                stepCount: steps.length,
                dayCount: Object.keys(byDay).length || trip.days,
                budget,
            },
        };
    }
};
exports.TripsService = TripsService;
exports.TripsService = TripsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TripsService);
//# sourceMappingURL=trips.service.js.map