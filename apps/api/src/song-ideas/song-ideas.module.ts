import { Module } from '@nestjs/common';
import { SongIdeasController } from './song-ideas.controller';
import { SongIdeasService } from './song-ideas.service';

@Module({
  controllers: [SongIdeasController],
  providers: [SongIdeasService],
})
export class SongIdeasModule {}
