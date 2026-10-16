import { Component, ElementRef, NgZone, OnInit, ViewChild, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../shared/environments/environment';
import { AuthService } from '../../core/auth/auth.service';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);

  @ViewChild('googleButton', { static: true }) googleButton!: ElementRef<HTMLDivElement>;

  readonly errorMessage = signal<string | null>(null);
  /** True until Google's button has rendered. */
  readonly loadingButton = signal(true);
  /** True while our backend is verifying the Google token. */
  readonly signingIn = signal(false);

  readonly highlights = [
    'One limit per category, so you always know what is left',
    'A gentle nudge before you overspend',
    'Your data stays yours: sign-in only shares your name, email and photo'
  ];

  async ngOnInit(): Promise<void> {
    // Already signed in? Skip the login page.
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/app/dashboard']);
      return;
    }

    try {
      await this.loadGoogleScript();
    } catch {
      this.loadingButton.set(false);
      this.errorMessage.set('Could not load Google sign-in. Check your connection and refresh.');
      return;
    }

    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: { credential: string }) => this.handleCredential(response.credential)
    });

    google.accounts.id.renderButton(this.googleButton.nativeElement, {
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'pill',
      width: 320
    });

    this.loadingButton.set(false);
  }

  private handleCredential(idToken: string): void {
    // Google calls this outside Angular's zone, so we re-enter it
    this.ngZone.run(() => {
      this.errorMessage.set(null);
      this.signingIn.set(true);

      this.authService.loginWithGoogle(idToken).subscribe({
        next: () => this.router.navigate(['/app/dashboard']),
        error: () => {
          this.signingIn.set(false);
          this.errorMessage.set('Sign-in failed. Please try again.');
        }
      });
    });
  }

  private loadGoogleScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).google?.accounts?.id) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Could not load Google script'));
      document.head.appendChild(script);
    });
  }
}
