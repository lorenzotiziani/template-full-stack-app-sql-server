import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, distinctUntilChanged, map, of, ReplaySubject, tap } from 'rxjs';
import { JwtService } from './jwt.service';
import { User } from '../entities/User';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  protected http = inject(HttpClient);
  protected jwtSrv = inject(JwtService);
  protected router = inject(Router);

  protected _currentUser$ = new ReplaySubject<User | null>(1);
  currentUser$ = this._currentUser$.asObservable();

  isAuthenticated$ = this.currentUser$
                      .pipe(
                        map(user => !!user),
                        distinctUntilChanged()
                      );

  constructor() {
      const authTokens = this.jwtSrv.getToken();
      if (!authTokens) {
          this.logout();
          return;
      }
      
      // If tokens exist but are expired, try to refresh
      if (!this.jwtSrv.areTokensValid()) {
          this.refresh().subscribe({
              error: () => this.logout()
          });
      } else {
          const user = this.jwtSrv.getPayload<User>();
          this._currentUser$.next(user);
      }
  }

  login(email: string, password: string) {
    return this.http.post<any>('http://localhost:3000/api/auth/login', { email, password })
      .pipe(
        tap(res => {
          if (!res.success) {
            throw new Error(res.error || 'Login failed');
          }
        }),
        tap(res => this.jwtSrv.setToken(res.data.accessToken, res.data.refreshToken)),
        tap(res => this._currentUser$.next(res.data.user)),
        map(res => res.data.user)
      );
  }


  refresh() {
    const authTokens = this.jwtSrv.getToken();
    if (!authTokens) {
      throw new Error('Missing refresh token');
    }
    return this.http.post<{token: string, refreshToken: string}>('http://localhost:3000/api/auth/refresh', {refreshToken: authTokens.refreshToken})
      .pipe(
        tap(res => this.jwtSrv.setToken(res.token, res.refreshToken)),
        tap(_ => {
          const user = this.jwtSrv.getPayload<User>();
          this._currentUser$.next(user);
        })
      );
  }

  fetchUser() {
    return this.http.get<User>('http://localhost:3000/api/users/profile')
      .pipe(
        catchError(_ => {
          return of(null);
        }),
        tap(user => this._currentUser$.next(user))
      );
  }

  logout() {
    this.jwtSrv.removeToken();
    this._currentUser$.next(null);
    this.router.navigate(['/']);
    
  }
  add(newUser:AuthService){
    return this.http.post<any>('http://localhost:3000/api/auth/register',newUser);
  }

}