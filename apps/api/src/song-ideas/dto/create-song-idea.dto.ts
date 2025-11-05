import type { SongIdeaStatus } from '@chordline/types';

export class CreateSongIdeaDto {
  title!: string;
  body!: string;
  tags?: string[];
  status?: SongIdeaStatus;
}
