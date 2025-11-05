import type { SetlistVisibility } from '../enums';
import type { ISODateString } from '../common';

export type Setlist = {
  id: string;
  bandId: string;
  createdById: string;
  title: string;
  description?: string | null;
  visibility: SetlistVisibility;
  archivedAt?: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};
