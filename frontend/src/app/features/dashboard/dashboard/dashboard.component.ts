import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import {DashboardService} from '../../budgets/dashboard-service/dashboard.service';
import {BudgetAlert} from '../../budgets/dtos/budget-alert';
import { BudgetSummary } from '../../budgets/dtos/budget-summary';
import { CURRENCY_CODE, MONTH_NAMES } from '../../budgets/budget-helpers/budget-helpers';

/**
 * How one month is going: what is left to spend, and how each category is doing.
 * Every number and every status (OK, WARNING, EXCEEDED) comes from the backend.
 * This page only shows them. It never works out a percent or a status itself.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly destroyRef = inject(DestroyRef);

  readonly currencyCode = CURRENCY_CODE;
  readonly skeletonRows = [1, 2, 3];

  private readonly now = new Date();

  // ---- The month being viewed (starts with this month) ----
  readonly year = signal(this.now.getFullYear());
  readonly month = signal(this.now.getMonth() + 1);

  // ---- State ----
  readonly summary = signal<BudgetSummary | null>(null);
  readonly loading = signal(true);
  /** True when the backend answers 404: this month has no budget yet. */
  readonly notFound = signal(false);
  readonly loadError = signal<string | null>(null);

  /**
   * False for the first load, so the category rows appear slowly one by one.
   * True for every later load (changing the month), so the same sequence plays
   * much faster and does not make you wait.
   */
  readonly quickReplay = signal(false);

  private firstLoadDone = false;
  private loadSubscription?: Subscription;

  // ---- Values read from the month and the summary (they update by themselves) ----
  readonly monthLabel = computed(() => `${MONTH_NAMES[this.month() - 1]} ${this.year()}`);
  readonly isCurrentMonth = computed(
    () => this.year() === this.now.getFullYear() && this.month() === this.now.getMonth() + 1,
  );
  /** True when more was spent than the income. */
  readonly leftIsNegative = computed(() => (this.summary()?.leftToSpend ?? 0) < 0);
  /** "Over income by" shows a positive number, so we take the absolute value. */
  readonly leftShown = computed(() => Math.abs(this.summary()?.leftToSpend ?? 0));
  /** True when the categories add up to more than the income. The backend decides this. */
  readonly isOverAllocated = computed(() => (this.summary()?.overAllocatedAmount ?? 0) > 0);
  /** Width of the overall bar, capped at 100 so it never spills out. */
  readonly barFill = computed(() => {
    const summary = this.summary();
    if (summary === null) {
      return 0;
    }
    // Income of 0 with spending: the backend reports 0 percent but EXCEEDED. Show a full bar.
    if (summary.alert === 'EXCEEDED' && summary.percentUsed <= 0) {
      return 100;
    }
    return this.barWidth(summary.percentUsed);
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    // Cancel the request that is still running. Without this, clicking the month
    // buttons quickly lets an older, slower answer arrive last and replace the newer one.
    this.loadSubscription?.unsubscribe();

    this.quickReplay.set(this.firstLoadDone);
    this.loading.set(true);
    this.notFound.set(false);
    this.loadError.set(null);

    this.loadSubscription = this.dashboardService
      .getBudgetSummary(this.month(), this.year())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (summary) => {
          this.summary.set(summary);
          this.loading.set(false);
          this.firstLoadDone = true;
        },
        error: (error: unknown) => {
          this.summary.set(null);
          if (error instanceof HttpErrorResponse && error.status === 404) {
            this.notFound.set(true);
          } else {
            this.loadError.set('We could not load the dashboard. Please try again.');
          }
          this.loading.set(false);
          this.firstLoadDone = true;
        },
      });
  }

  // ===========================================================================
  // Month buttons
  // ===========================================================================

  /** Moves one month back (-1) or forward (+1). January back goes to December of the year before. */
  stepMonth(delta: number): void {
    let month = this.month() + delta;
    let year = this.year();

    if (month < 1) {
      month = 12;
      year -= 1;
    } else if (month > 12) {
      month = 1;
      year += 1;
    }
    if (year < 1) {
      return;
    }

    this.month.set(month);
    this.year.set(year);
    this.load();
  }

  goToCurrentMonth(): void {
    this.month.set(this.now.getMonth() + 1);
    this.year.set(this.now.getFullYear());
    this.load();
  }

  // ===========================================================================
  // Small helpers used by the template
  // ===========================================================================

  /** Shown next to the color, so color is never the only clue. */
  statusText(alert: BudgetAlert): string {
    switch (alert) {
      case 'EXCEEDED':
        return 'Over limit';
      case 'WARNING':
        return 'Close to limit';
      default:
        return 'On track';
    }
  }

  /** The short line under the big number. */
  summaryMessage(alert: BudgetAlert): string {
    switch (alert) {
      case 'EXCEEDED':
        return 'Over budget this month.';
      case 'WARNING':
        return 'Getting close to your limit.';
      default:
        return "You're under budget, nice.";
    }
  }

  /** Bar width, between 0 and 100, so a bar never spills out. */
  barWidth(percent: number): number {
    return Math.min(Math.max(percent, 0), 100);
  }

  /** Overspent categories have a negative remaining amount. We show it as a positive "over". */
  absolute(amount: number): number {
    return Math.abs(amount);
  }
}
