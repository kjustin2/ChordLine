import type { DecimalString, ISODateString } from '../common';
export type Earning = {
    id: string;
    bandId: string;
    eventId?: string | null;
    recordedById: string;
    totalAmount: DecimalString;
    currency: string;
    description?: string | null;
    paidAt?: ISODateString | null;
    createdAt: ISODateString;
    updatedAt: ISODateString;
};
//# sourceMappingURL=Earning.d.ts.map