import type { SetlistVisibility } from '@chordline/types';

export class CreateSetlistDto {
  title!: string;
  description?: string;
  visibility?: SetlistVisibility;
}
