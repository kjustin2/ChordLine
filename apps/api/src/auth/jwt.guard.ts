// src/auth/jwt.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { verifyToken } from '@clerk/backend';

@Injectable()
export class JwtGuard implements CanActivate {
  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : undefined;
    if (!token) throw new UnauthorizedException('Missing token');

    try {
      const claims = await verifyToken(token, {
        jwtKey: process.env.CLERK_JWT_KEY,
        authorizedParties: [(process.env.AUTHORIZED_CLERK_PARTY || '').trim()],
      });

      (req as any).user = {
        sub: claims.sub,
        email: (claims as any).email,
        org: (claims as any).org_id,
        role: (claims as any).role,
      };
      return true;
    } catch(e) {
      throw new UnauthorizedException(e.message || 'Invalid token');
    }
  }
}
