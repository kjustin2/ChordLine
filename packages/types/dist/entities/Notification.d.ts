import type { NotificationType } from '../enums';
import type { ISODateString } from '../common';
export type Notification = {
    id: string;
    recipientId: string;
    type: NotificationType;
    title: string;
    body: string;
    payload?: Record<string, unknown> | null;
    readAt?: ISODateString | null;
    createdAt: ISODateString;
    updatedAt: ISODateString;
};
//# sourceMappingURL=Notification.d.ts.map