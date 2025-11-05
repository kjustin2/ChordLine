import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import type { User } from '@chordline/types';

@Controller('v1/users')
export class UsersController {
  @UseGuards(JwtGuard)
  @Get()
  list(): User[] {
    return [{ id: 'u_1', email: 'test@example.com' }];
  }
}
