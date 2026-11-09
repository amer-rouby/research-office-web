import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import type { Role } from '@core/api/api-types';
import { AuthSessionStore } from './auth-session.store';
import { ROLE_HOME } from './auth.service';

/** Lets the route load only for a signed-in user holding one of the roles. */
export function requireRole(...roles: Role[]): CanMatchFn {
  return (_route, segments) => {
    const router = inject(Router);
    const user = inject(AuthSessionStore).user();
    if (!user) {
      const returnUrl = '/' + segments.map((s) => s.path).join('/');
      return router.createUrlTree(['/login'], { queryParams: { returnUrl } });
    }
    return roles.includes(user.role) ? true : router.parseUrl(ROLE_HOME[user.role]);
  };
}
