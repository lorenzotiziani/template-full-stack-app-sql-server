import { inject } from '@angular/core';
import {
  HttpHandlerFn,
  HttpRequest,
  HttpErrorResponse,
  HttpClient
} from '@angular/common/http';
import { JwtService } from '../services/jwt.service';
import { Router } from '@angular/router';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError, of } from 'rxjs';

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const jwtService = inject(JwtService);
  const router = inject(Router);
  const http = inject(HttpClient);

  const authTokens = jwtService.getToken();

  // Non intercettare login o refresh
  if (req.url.includes('/api/auth/login') || req.url.includes('/api/auth/refresh-token')) {
    return next(req);
  }

  // Se non esiste token, logout immediato
  if (!authTokens || !jwtService.areTokensValid()) {
    jwtService.removeToken();
    router.navigate(['/']);
    return throwError(() => new Error('Token non valido o assente'));
  }

  const clonedReq = req.clone({
    setHeaders: { Authorization: `Bearer ${authTokens.token}` }
  });

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Se ricevi un 401, tenta il refresh
      if (error.status === 401 && authTokens.refreshToken) {
        return http
          .post<{ token: string; refreshToken: string }>(
            'http://localhost:3000/api/auth/refresh-token',
            { refreshToken: authTokens.refreshToken }
          )
          .pipe(
            switchMap((newTokens) => {
              // Salva i nuovi token
              jwtService.setToken(newTokens.token, newTokens.refreshToken);

              // Ritenta la richiesta originale con il nuovo token
              const retryReq = req.clone({
                setHeaders: { Authorization: `Bearer ${newTokens.token}` }
              });
              return next(retryReq);
            }),
            catchError(() => {
              // Se anche il refresh fallisce → logout e redirect
              jwtService.removeToken();
              router.navigate(['/']);
              return throwError(() => new Error('Sessione scaduta'));
            })
          );
      }

      // Qualsiasi altro errore 403 o 401 → logout
      if (error.status === 403) {
        jwtService.removeToken();
        router.navigate(['/']);
      }

      return throwError(() => error);
    })
  );
}
