import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from './token.service';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = async () => {
  const tokens = inject(TokenService);
  const router = inject(Router);
  const auth = inject(AuthService);

  if (!tokens.isAuthenticated()) return router.createUrlTree(['/login']);

  if (!auth.currentUser()) {
    const user = await auth.loadCurrentUser();
    if (!user) return router.createUrlTree(['/login']);
  }

  return true;
};
