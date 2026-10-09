import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const isApi = req.url.startsWith(environment.apiUrl);
  const isLogin = req.url.includes('/api/auth/login');

  const request = isApi && auth.token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${auth.token}` } })
    : req;

  return next(request).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && isApi && !isLogin) {
        auth.logout();
      }
      return throwError(() => err);
    })
  );
};
