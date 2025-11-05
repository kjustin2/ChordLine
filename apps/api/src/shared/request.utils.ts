export type AuthenticatedRequestUser = {
  sub: string;
};

export function assertRequestWithUser(req: unknown): string {
  const user = (req as { user?: AuthenticatedRequestUser } | undefined)?.user;
  if (!user || typeof user.sub !== 'string') {
    throw new Error('Authenticated request context missing user');
  }
  return user.sub;
}
