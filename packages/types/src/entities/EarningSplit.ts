import type { DecimalString, ISODateString } from '../common';
import type { EarningSplitStatus } from '../enums';

export type EarningSplit = {
  id: string;
  earningId: string;
  memberId: string;
  amount: DecimalString;
  status: EarningSplitStatus;
  paidAt?: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};
