import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTripDto, StepDto, UpdateTripDto } from './dto/trip.dto';

const tripInclude = {
  steps: { orderBy: [{ day: 'asc' }, { order: 'asc' }] },
} satisfies Prisma.TripInclude;

@Injectable()
export class TripsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateTripDto) {
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

  async listMine(userId: string) {
    const trips = await this.prisma.trip.findMany({
      where: { userId },
      include: tripInclude,
      orderBy: { updatedAt: 'desc' },
    });
    return trips.map((t) => this.withSummary(t));
  }

  async listPublic(keyword?: string) {
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

  async getOne(userId: string, tripId: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: { ...tripInclude, user: { select: { nickname: true } } },
    });
    if (!trip) throw new NotFoundException('行程不存在');
    if (trip.userId !== userId && !trip.isPublic) {
      throw new NotFoundException('行程不存在');
    }
    return this.withSummary(trip as any);
  }

  async update(userId: string, tripId: string, dto: UpdateTripDto) {
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

  async remove(userId: string, tripId: string) {
    await this.ensureOwner(userId, tripId);
    await this.prisma.trip.delete({ where: { id: tripId } });
    return { success: true };
  }

  /** 整体替换步骤（编辑器保存） */
  async saveSteps(userId: string, tripId: string, steps: StepDto[]) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip || trip.userId !== userId) {
      throw new NotFoundException('行程不存在');
    }
    const maxDay = steps.reduce((m, s) => Math.max(m, s.day || 1), 1);
    await this.prisma.$transaction([
      this.prisma.tripStep.deleteMany({ where: { tripId } }),
      // 天数取"用户设置天数"与"步骤最大天"的较大者，避免被步骤覆盖
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

  /** 复制行程到自己的账号 */
  async copy(userId: string, tripId: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: { steps: true },
    });
    if (!trip) throw new NotFoundException('行程不存在');
    if (trip.userId !== userId && !trip.isPublic) {
      throw new NotFoundException('行程不存在');
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
                details: (s.details as any) || {},
              })),
            }
          : undefined,
      },
      include: tripInclude,
    });
    return copy;
  }

  private async ensureOwner(userId: string, tripId: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip || trip.userId !== userId) {
      throw new NotFoundException('行程不存在');
    }
  }

  /** 计算汇总：总花费、总时长、每日安排、分项费用 */
  private withSummary(trip: any) {
    const steps: any[] = trip.steps || [];
    let totalCost = 0;
    const budget = { transport: 0, hotel: 0, ticket: 0, food: 0, other: 0 };
    for (const s of steps) {
      const c = s.cost || 0;
      totalCost += c;
      if (s.type.startsWith('transport')) budget.transport += c;
      else if (s.type === 'hotel') budget.hotel += c;
      else if (s.type === 'ticket') budget.ticket += c;
      else if (s.type === 'food') budget.food += c;
      else budget.other += c;
    }
    const byDay: Record<number, number> = {};
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
}
