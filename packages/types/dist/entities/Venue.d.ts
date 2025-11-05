import type { ISODateString } from '../common';
export type Venue = {
    id: string;
    bandId: string;
    name: string;
    description?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    country?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    placeId?: string | null;
    createdAt: ISODateString;
    updatedAt: ISODateString;
};
//# sourceMappingURL=Venue.d.ts.map