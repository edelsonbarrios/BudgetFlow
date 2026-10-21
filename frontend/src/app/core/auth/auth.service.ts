import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import {USER} from '../../shared/environments/environment';
import {environment} from '../../../environments/environment';
import {TOKEN_KEY, USER_EMAIL, USER_NAME} from '../../shared/environments/environment';

export interface AuthResponse {
  token: string;
  email: string;
  name: string;
  pictureUrl: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  readonly user = signal<AuthResponse | null>(null);

  loginWithGoogle(idToken: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/api/auth/google`, { idToken })
      .pipe(
        tap((response) => {
          localStorage.setItem(TOKEN_KEY, response.token);
          localStorage.setItem(USER, JSON.stringify(response));
          this.user.set(response);
        })
      );
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER);
    localStorage.removeItem(USER_NAME);
    localStorage.removeItem(USER_EMAIL);
    this.user.set(null);
  }

  getStoredUser() : AuthResponse | null {
    const rawUser = localStorage.getItem(USER);

    if(rawUser == null) {
      return null;
    }

    try {
      return JSON.parse(rawUser) as AuthResponse;
    }catch {
      return null;
    }
  }
}
