import type { SongIdeaStatus } from '../enums';
import type { ISODateString } from '../common';
export type SongIdea = {
    id: string;
    bandId: string;
    authorId: string;
    title: string;
    body: string;
    tags: string[];
    status: SongIdeaStatus;
    sharedAt?: ISODateString | null;
    createdAt: ISODateString;
    updatedAt: ISODateString;
};
//# sourceMappingURL=SongIdea.d.ts.map