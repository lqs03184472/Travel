import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');
    const { password, ...safe } = user;
    const [tripCount, favoriteCount] = await Promise.all([
      this.prisma.trip.count({ where: { userId } }),
      this.prisma.favorite.count({ where: { userId } }),
    ]);
    return { ...safe, tripCount, favoriteCount };
  }

  async updateProfile(userId: string, data: { nickname?: string; avatar?: string }) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
    });
    const { password, ...safe } = user;
    return safe;
  }

  /** 出行统计：累计出行次数、总花费、总天数、总里程 */
  async getStats(userId: string) {
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
        const distance = (step.details as any)?.distance;
        if (typeof distance === 'number') totalKm += distance;
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

  async listFavorites(userId: string) {
    const favs = await this.prisma.favorite.findMany({
      where: { userId },
      include: { trip: { include: { steps: true } } },
      orderBy: { id: 'desc' },
    });
    return favs.map((f) => f.trip);
  }

  async toggleFavorite(userId: string, tripId: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new NotFoundException('行程不存在');
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
}
