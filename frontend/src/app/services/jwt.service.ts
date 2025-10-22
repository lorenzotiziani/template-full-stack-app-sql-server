import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class JwtService {
  protected tokenStorageKey = 'authToken';
  protected refreshStorageKey = 'authRefreshToken';

  getPayload<T>() {
    const authTokens = this.getToken();
    if (!authTokens || !this.isJwt(authTokens.token)) {
      return null;
    }
    try {
      return jwtDecode<T>(authTokens.token);
    } catch (e) {
      console.error('Failed to decode access token', e);
      return null;
    }
  }

  areTokensValid(): boolean {
    const authTokens = this.getToken();
    if (!authTokens || !this.isJwt(authTokens.token)) {
        return false;
    }
    try {
        const decoded: any = jwtDecode(authTokens.token);
        return !decoded.exp || decoded.exp * 1000 > Date.now();
    } catch (e) {
        console.error('Invalid access token', e);
        return false;
    }
  }

  getToken(): { token: string, refreshToken: string } | null {
    const token = localStorage.getItem(this.tokenStorageKey);
    const refreshToken = localStorage.getItem(this.refreshStorageKey);

    if (!(token && refreshToken)) {
      this.removeToken();
      return null;
    }

    return { token, refreshToken };
  }

  setToken(token: string, refreshToken: string): void {
    localStorage.setItem(this.tokenStorageKey, token);
    localStorage.setItem(this.refreshStorageKey, refreshToken);
  }

  removeToken(): void {
    localStorage.removeItem(this.tokenStorageKey);
    localStorage.removeItem(this.refreshStorageKey);
  }

  private isJwt(token: string): boolean {
    return !!token && token.split('.').length === 3;
  }
}
