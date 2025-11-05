import type { BandStatus } from '../enums';
import type { ISODateString } from '../common';

export type Band = {
  id: string;
  name: string;
  description?: string | null;
  genre?: string | null;
  createdById: string;
  status: BandStatus;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};
