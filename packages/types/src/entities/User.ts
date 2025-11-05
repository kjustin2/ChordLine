export type User = {
  id: string;
  clerkUserId?: string | null;
  email: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  instrument?: string | null;
  primaryGenre?: string | null;
  city?: string | null;
  country?: string | null;
  createdAt: string;
  updatedAt: string;
};
