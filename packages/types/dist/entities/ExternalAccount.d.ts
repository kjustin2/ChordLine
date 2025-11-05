import type { ExternalAccountProvider } from '../enums';
import type { ISODateString } from '../common';
export type ExternalAccount = {
    id: string;
    bandId?: string | null;
    userId?: string | null;
    provider: ExternalAccountProvider;
    externalId: string;
    accessToken?: string | null;
    refreshToken?: string | null;
    expiresAt?: ISODateString | null;
    metadata?: Record<string, unknown> | null;
    createdAt: ISODateString;
    updatedAt: ISODateString;
};
//# sourceMappingURL=ExternalAccount.d.ts.map