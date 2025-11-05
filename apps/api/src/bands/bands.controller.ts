import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Band } from '@chordline/types';
import { JwtGuard } from '../auth/jwt.guard';
import { BandsService } from './bands.service';
import { CreateBandDto } from './dto/create-band.dto';
import { assertRequestWithUser } from '../shared/request.utils';

@Controller('v1/bands')
@UseGuards(JwtGuard)
export class BandsController {
  constructor(private readonly bands: BandsService) {}

  @Get()
  async list(@Req() req: unknown): Promise<Band[]> {
    const userId = assertRequestWithUser(req);
    return this.bands.listForUser(userId);
  }

  @Post()
  async create(
    @Req() req: unknown,
    @Body() dto: CreateBandDto,
  ): Promise<Band> {
    const userId = assertRequestWithUser(req);
    return this.bands.create(userId, dto);
  }
}
