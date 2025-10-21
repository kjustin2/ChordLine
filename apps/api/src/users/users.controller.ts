import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('v1/users')
export class UsersController {
  @UseGuards(JwtGuard)
  @Get()
  list() {
    return [{ id: 'u_1', email: 'test@example.com' }];
  }
}
