import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import type { Venue } from '@chordline/types';
import { JwtGuard } from '../auth/jwt.guard';
import { VenuesService } from './venues.service';
import { CreateVenueDto } from './dto/create-venue.dto';

@Controller('v1/bands/:bandId/venues')
@UseGuards(JwtGuard)
export class VenuesController {
  constructor(private readonly venues: VenuesService) {}

  @Get()
  async list(@Param('bandId') bandId: string): Promise<Venue[]> {
    return this.venues.listForBand(bandId);
  }

  @Post()
  async create(
    @Param('bandId') bandId: string,
    @Body() dto: CreateVenueDto,
  ): Promise<Venue> {
    return this.venues.create(bandId, dto);
  }
}
