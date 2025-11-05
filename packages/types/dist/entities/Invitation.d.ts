import type { InvitationStatus } from '../enums';
import type { ISODateString } from '../common';
export type Invitation = {
    id: string;
    bandId: string;
    email: string;
    invitedById: string;
    acceptedById?: string | null;
    token: string;
    status: InvitationStatus;
    expiresAt?: ISODateString | null;
    respondedAt?: ISODateString | null;
    createdAt: ISODateString;
    updatedAt: ISODateString;
};
//# sourceMappingURL=Invitation.d.ts.map