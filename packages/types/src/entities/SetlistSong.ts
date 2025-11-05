import type { ISODateString } from '../common';

export type SetlistSong = {
  id: string;
  setlistId: string;
  title: string;
  artist?: string | null;
  keySignature?: string | null;
  tempo?: number | null;
  position: number;
  durationSec?: number | null;
  notes?: string | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};
