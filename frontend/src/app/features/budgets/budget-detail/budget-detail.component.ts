import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Budget } from '../dtos/budget';
import { BudgetCategory } from '../dtos/budget-category';
import { BudgetService } from '../budget-service/budget.service';
import { BudgetCategoryDialogComponent } from '../budget-category-dialog/budget-category-dialog.component';
import {
  CURRENCY_CODE,
  allocatedPercent,
  allocatedTotal,
  leftToAssign,
  monthLabel,
} from '../budget-helpers/budget-helpers';

/**
 * One whole budget: income, totals, and every category with an Edit button.
 * Adding and editing a category happens in BudgetCategoryDialogComponent.
 *
 * The budget id comes from the address (/app/budgets/:id).
 * The page owns its own width. It sits inside the app shell, and the route
 * configuration places it there.
 */
@Component({
  selector: 'app-budget-detail',
  standalone: true,
  imports: [CurrencyPipe, RouterLink, BudgetCategoryDialogComponent],
  templateUrl: './budget-detail.component.html',
  styleUrls: ['./budget-detail.component.scss'],
})
export class BudgetDetailComponent implements OnInit {
  private readonly budgetService = inject(BudgetService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly currencyCode = CURRENCY_CODE;
  readonly skeletonRows = [1, 2];

  // ---- State ----
  readonly budget = signal<Budget | null>(null);
  readonly loading = signal(true);
  /** True when the id in the address is not a number, or the backend answers 404. */
  readonly notFound = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  // ---- Values worked out from the budget (they update by themselves) ----
  readonly title = computed(() => {
    const budget = this.budget();
    return budget ? monthLabel(budget) : '';
  });
  readonly allocated = computed(() => {
    const budget = this.budget();
    return budget ? allocatedTotal(budget) : 0;
  });
  readonly left = computed(() => {
    const budget = this.budget();
    return budget ? leftToAssign(budget) : 0;
  });
  readonly isOver = computed(() => this.left() < 0);
  /** "Over by" shows a positive number, so we take the absolute value. */
  readonly leftShown = computed(() => Math.abs(this.left()));
  readonly percent = computed(() => {
    const budget = this.budget();
    return budget ? allocatedPercent(budget) : 0;
  });
  /** Bar width, capped at 100 so an over-allocated bar never spills out. */
  readonly barFill = computed(() => Math.min(this.percent(), 100));

  private budgetId = 0;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      this.notFound.set(true);
      this.loading.set(false);
      return;
    }
    this.budgetId = id;
    this.load(true);
  }

  /**
   * Loads the budget. The first load shows the skeleton. Later loads (after a save)
   * keep the page on screen, so it does not jump.
   */
  load(showSkeleton = true): void {
    if (showSkeleton) {
      this.loading.set(true);
    }
    this.loadError.set(null);

    this.budgetService
      .getBudgetById(this.budgetId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (budget) => {
          this.budget.set(budget);
          this.loading.set(false);
        },
        error: (error: unknown) => {
          if (error instanceof HttpErrorResponse && error.status === 404) {
            this.notFound.set(true);
          } else {
            this.loadError.set('We could not load this budget. Please try again.');
          }
          this.loading.set(false);
        },
      });
  }

  /** Runs when the dialog saved a category. */
  onCategorySaved(category: BudgetCategory): void {
    this.successMessage.set(`${category.name} saved, nice.`);
    this.load(false);
  }

  /** Whole-number percent of the income that this category takes. */
  incomeShare(category: BudgetCategory): number {
    const budget = this.budget();
    if (budget === null || budget.totalIncome <= 0) {
      return 0;
    }
    return Math.round((category.allocatedAmount / budget.totalIncome) * 100);
  }
}
