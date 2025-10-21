import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { JwtGuard } from '../auth/jwt.guard';

@Module({
  controllers: [UsersController],
  providers: [JwtGuard],
})
export class UsersModule {}
