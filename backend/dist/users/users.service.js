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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('用户不存在');
        const { password, ...safe } = user;
        const [tripCount, favoriteCount] = await Promise.all([
            this.prisma.trip.count({ where: { userId } }),
            this.prisma.favorite.count({ where: { userId } }),
        ]);
        return { ...safe, tripCount, favoriteCount };
    }
    async updateProfile(userId, data) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data,
        });
        const { password, ...safe } = user;
        return safe;
    }
    async getStats(userId) {
        const trips = await this.prisma.trip.findMany({
            where: { userId },
            include: { steps: true },
        });
        const tripCount = trips.length;
        let totalCost = 0;
        let totalKm = 0;
        for (const trip of trips) {
            for (const step of trip.steps) {
                totalCost += step.cost || 0;
                const distance = step.details?.distance;
                if (typeof distance === 'number')
                    totalKm += distance;
            }
        }
        const totalDays = trips.reduce((s, t) => s + (t.days || 1), 0);
        return {
            tripCount,
            totalCost: Math.round(totalCost),
            totalDays,
            totalKm: Math.round(totalKm),
            aiCount: (await this.prisma.user.findUnique({ where: { id: userId } }))?.aiCount || 0,
        };
    }
    async listFavorites(userId) {
        const favs = await this.prisma.favorite.findMany({
            where: { userId },
            include: { trip: { include: { steps: true } } },
            orderBy: { id: 'desc' },
        });
        return favs.map((f) => f.trip);
    }
    async toggleFavorite(userId, tripId) {
        const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
        if (!trip)
            throw new common_1.NotFoundException('行程不存在');
        const exists = await this.prisma.favorite.findUnique({
            where: { userId_tripId: { userId, tripId } },
        });
        if (exists) {
            await this.prisma.favorite.delete({ where: { id: exists.id } });
            return { favorited: false };
        }
        await this.prisma.favorite.create({ data: { userId, tripId } });
        return { favorited: true };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map