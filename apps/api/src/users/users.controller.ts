import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { User } from '@chordline/types';
import { JwtGuard } from '../auth/jwt.guard';
import { UsersService } from './users.service';
import { assertRequestWithUser } from '../shared/request.utils';

@Controller('v1/users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @UseGuards(JwtGuard)
  @Get('me')
  async me(@Req() req: unknown): Promise<User> {
    const userId = assertRequestWithUser(req);
    return this.users.getOrCreateUser({
      id: userId,
      email: (req as { user?: { email?: string } }).user?.email ?? null,
      displayName: (req as { user?: { name?: string } }).user?.name ?? null,
    });
  }
}
