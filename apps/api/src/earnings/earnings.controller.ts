import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import type { Earning, EarningSplit } from '@chordline/types';
import { JwtGuard } from '../auth/jwt.guard';
import { EarningsService } from './earnings.service';
import { CreateEarningDto, CreateEarningSplitDto } from './dto/create-earning.dto';
import { assertRequestWithUser } from '../shared/request.utils';

@Controller()
@UseGuards(JwtGuard)
export class EarningsController {
  constructor(private readonly earnings: EarningsService) {}

  @Get('v1/bands/:bandId/earnings')
  async list(@Param('bandId') bandId: string): Promise<Earning[]> {
    return this.earnings.listForBand(bandId);
  }

  @Post('v1/bands/:bandId/earnings')
  async create(
    @Param('bandId') bandId: string,
    @Req() req: unknown,
    @Body() dto: CreateEarningDto,
  ): Promise<Earning> {
    const userId = assertRequestWithUser(req);
    return this.earnings.create(bandId, userId, dto);
  }

  @Get('v1/earnings/:earningId/splits')
  async listSplits(@Param('earningId') earningId: string): Promise<EarningSplit[]> {
    return this.earnings.listSplits(earningId);
  }

  @Post('v1/earnings/:earningId/splits')
  async addSplit(
    @Param('earningId') earningId: string,
    @Body() dto: CreateEarningSplitDto,
  ): Promise<EarningSplit> {
    return this.earnings.addSplit(earningId, dto);
  }
}
