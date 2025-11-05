import type { DecimalString, EarningSplitStatus } from '@chordline/types';

export class CreateEarningSplitDto {
  memberId!: string;
  amount!: DecimalString;
  status?: EarningSplitStatus;
  paidAt?: string;
}

export class CreateEarningDto {
  eventId?: string;
  totalAmount!: DecimalString;
  currency?: string;
  description?: string;
  paidAt?: string;
  splits?: CreateEarningSplitDto[];
}
