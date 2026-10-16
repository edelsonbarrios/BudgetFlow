import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import {environment} from '../../shared/environments/environment';

export interface AuthResponse {
  token: string;
  email: string;
  name: string;
  pictureUrl: string | null;
}

const TOKEN_KEY = 'budgetflow_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  readonly user = signal<AuthResponse | null>(null);

  loginWithGoogle(idToken: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/google`, { idToken })
      .pipe(
        tap((response) => {
          localStorage.setItem(TOKEN_KEY, response.token);
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
    this.user.set(null);
  }
}
