import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { JwtGuard } from '../auth/jwt.guard';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [JwtGuard, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
