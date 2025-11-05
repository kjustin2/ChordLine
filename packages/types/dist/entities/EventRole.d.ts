import type { ISODateString, DecimalString } from '../common';
export type EventRole = {
    id: string;
    eventId: string;
    memberId: string;
    role: string;
    compensation?: DecimalString | null;
    isConfirmed: boolean;
    notes?: string | null;
    createdAt: ISODateString;
    updatedAt: ISODateString;
};
//# sourceMappingURL=EventRole.d.ts.map