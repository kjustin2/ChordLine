export class CreateSetlistSongDto {
  title!: string;
  artist?: string;
  keySignature?: string;
  tempo?: number;
  position?: number;
  durationSec?: number;
  notes?: string;
}
