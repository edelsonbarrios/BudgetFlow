import { CurrencyPipe } from '@angular/common';
import {Component, inject} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../../../core/auth/auth.service';

/** One slice of the preview donut. `start` and `percent` are out of 100. */
interface PreviewSlice {
  label: string;
  amount: number;
  percent: number;
  start: number;
  tone: 1 | 2 | 3 | 4 | 5;
}

/** One category row in the preview. `fill` is the bar width, capped at 100. */
interface PreviewCategory {
  name: string;
  spent: number;
  limit: number;
  percentUsed: number;
  fill: number;
  status: 'ok' | 'warning' | 'exceeded';
  note: string;
}

/**
 * The public landing page: calm hero, a dashboard preview, three feature blocks
 * and a closing call to action.
 *
 * The preview is built from plain HTML, CSS and SVG with made-up numbers.
 * It is a showcase only and does not call the backend.
 *
 * The page never imports the layout. The route configuration wraps it in
 * PublicLayoutComponent.
 */
@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
})
export class LandingPageComponent {
  readonly previewMonth = 'October';
  readonly previewBudget = 4000;
  readonly previewSpent = 2716;
  readonly previewLeft = this.previewBudget - this.previewSpent;
  readonly previewPercentUsed = Math.round((this.previewSpent / this.previewBudget) * 100);
  private authService = inject(AuthService);
  private router = inject(Router);

  /** Where the money went. Amounts add up to previewSpent. */
  readonly slices: PreviewSlice[] = [
    { label: 'Housing', amount: 1086, percent: 40, start: 0, tone: 1 },
    { label: 'Groceries', amount: 598, percent: 22, start: 40, tone: 2 },
    { label: 'Transport', amount: 380, percent: 14, start: 62, tone: 3 },
    { label: 'Fun', amount: 272, percent: 10, start: 76, tone: 4 },
    { label: 'Other', amount: 380, percent: 14, start: 86, tone: 5 },
  ];

  /** Spent vs limit per category, using the same OK / WARNING / EXCEEDED idea as the real summary. */
  readonly categories: PreviewCategory[] = [
    { name: 'Housing', spent: 1086, limit: 1400, percentUsed: 78, fill: 78, status: 'ok', note: 'On track' },
    { name: 'Groceries', spent: 598, limit: 650, percentUsed: 92, fill: 92, status: 'warning', note: 'Close to limit' },
    { name: 'Transport', spent: 380, limit: 500, percentUsed: 76, fill: 76, status: 'ok', note: 'On track' },
    { name: 'Fun', spent: 272, limit: 240, percentUsed: 113, fill: 100, status: 'exceeded', note: 'Over by $32' },
  ];

  getStartedClicked() {
    if(!this.authService.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }
    this.router.navigateByUrl('/app/budgets');
  }
}
