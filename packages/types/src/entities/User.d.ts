export type User = {
    id: string;
    email?: string;
} & Record<string, unknown>;
