import { Injectable, NotFoundException } from '@nestjs/common';
import type { Earning, EarningSplit } from '@chordline/types';
import { Prisma } from '../../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEarningDto, CreateEarningSplitDto } from './dto/create-earning.dto';

@Injectable()
export class EarningsService {
  constructor(private readonly prisma: PrismaService) {}

  async listForBand(bandId: string): Promise<Earning[]> {
    const earnings = await this.prisma.earning.findMany({
      where: { bandId },
      orderBy: { createdAt: 'desc' },
    });

    return earnings.map(mapEarning);
  }

  async create(
    bandId: string,
    userId: string,
    dto: CreateEarningDto,
  ): Promise<Earning> {
    const created = await this.prisma.earning.create({
      data: {
        bandId,
        eventId: dto.eventId,
        recordedById: userId,
        totalAmount: new Prisma.Decimal(dto.totalAmount),
        currency: dto.currency ?? 'USD',
        description: dto.description,
        paidAt: dto.paidAt ? new Date(dto.paidAt) : undefined,
        splits: dto.splits
          ? {
              create: dto.splits.map((split) => ({
                memberId: split.memberId,
                amount: new Prisma.Decimal(split.amount),
                status: split.status ?? 'PENDING',
                paidAt: split.paidAt ? new Date(split.paidAt) : undefined,
              })),
            }
          : undefined,
      },
    });

    return mapEarning(created);
  }

  async listSplits(earningId: string): Promise<EarningSplit[]> {
    const splits = await this.prisma.earningSplit.findMany({
      where: { earningId },
      orderBy: { createdAt: 'asc' },
    });

    return splits.map(mapEarningSplit);
  }

  async addSplit(
    earningId: string,
    dto: CreateEarningSplitDto,
  ): Promise<EarningSplit> {
    const earning = await this.prisma.earning.findUnique({ where: { id: earningId } });
    if (!earning) {
      throw new NotFoundException('Earning not found');
    }

    const created = await this.prisma.earningSplit.create({
      data: {
        earningId,
        memberId: dto.memberId,
        amount: new Prisma.Decimal(dto.amount),
        status: dto.status ?? 'PENDING',
        paidAt: dto.paidAt ? new Date(dto.paidAt) : undefined,
      },
    });

    return mapEarningSplit(created);
  }
}

type EarningRecord = {
  id: string;
  bandId: string;
  eventId: string | null;
  recordedById: string;
  totalAmount: Prisma.Decimal;
  currency: string;
  description: string | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type EarningSplitRecord = {
  id: string;
  earningId: string;
  memberId: string;
  amount: Prisma.Decimal;
  status: EarningSplit['status'];
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const mapEarning = (earning: EarningRecord): Earning => ({
  id: earning.id,
  bandId: earning.bandId,
  eventId: earning.eventId ?? null,
  recordedById: earning.recordedById,
  totalAmount: earning.totalAmount.toFixed(2),
  currency: earning.currency,
  description: earning.description ?? null,
  paidAt: earning.paidAt ? earning.paidAt.toISOString() : null,
  createdAt: earning.createdAt.toISOString(),
  updatedAt: earning.updatedAt.toISOString(),
});

const mapEarningSplit = (split: EarningSplitRecord): EarningSplit => ({
  id: split.id,
  earningId: split.earningId,
  memberId: split.memberId,
  amount: split.amount.toFixed(2),
  status: split.status,
  paidAt: split.paidAt ? split.paidAt.toISOString() : null,
  createdAt: split.createdAt.toISOString(),
  updatedAt: split.updatedAt.toISOString(),
});
