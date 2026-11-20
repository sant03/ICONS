import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from './token.service';

const PUBLIC_AUTH_PATHS = ['/auth/login', '/auth/refresh', '/auth/register', '/auth/roles', '/auth/password-reset/'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(TokenService).getAccessToken();
  const isPublic = PUBLIC_AUTH_PATHS.some((p) => req.url.includes(p));

  if (token && !isPublic) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req);
};
