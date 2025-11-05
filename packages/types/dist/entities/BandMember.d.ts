import type { BandMemberRole, BandMemberStatus } from '../enums';
import type { ISODateString } from '../common';
export type BandMember = {
    id: string;
    bandId: string;
    userId: string;
    role: BandMemberRole;
    status: BandMemberStatus;
    joinedAt: ISODateString;
    leftAt?: ISODateString | null;
    createdAt: ISODateString;
    updatedAt: ISODateString;
};
//# sourceMappingURL=BandMember.d.ts.map