import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';

import { Budget } from '../dtos/budget';
import { BudgetCategory } from '../dtos/budget-category';
import { Expense } from '../dtos/expense';
import { ExpenseService } from '../expense-service/expense.service';
import { CURRENCY_CODE, monthLabel } from '../budget-helpers/budget-helpers';

const PAGE_SIZE = 10;

/** What this dialog sends up when the user clicks "Add expense". */
export interface AddExpenseRequest {
  budget: Budget;
  category: BudgetCategory;
}

/**
 * The popup that lists every expense of one budget category, newest first, a page at a time.
 *
 * How to use it (from a parent template):
 *
 *   <app-expense-list-dialog #expenseList (addRequested)="expenseDialog.open($event.budget, $event.category)" />
 *   <button (click)="expenseList.open(budget, category)">Expenses</button>
 *
 * The dialog does not add expenses itself. It tells the parent that the user wants to add one
 * (addRequested), and the parent opens the form. When the form saved an expense, the parent
 * calls reload() so the new expense shows at the top of the list.
 */
@Component({
  selector: 'app-expense-list-dialog',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './expense-list-dialog.component.html',
  styleUrls: ['./expense-list-dialog.component.scss'],
})
export class ExpenseListDialogComponent {
  private readonly expenseService = inject(ExpenseService);
  private readonly destroyRef = inject(DestroyRef);

  readonly currencyCode = CURRENCY_CODE;
  readonly skeletonRows = [1, 2, 3];

  /** Sent up when the user clicks "Add expense". The parent opens the form. */
  @Output() readonly addRequested = new EventEmitter<AddExpenseRequest>();

  @ViewChild('dialog') private dialog?: ElementRef<HTMLDialogElement>;

  // ---- What the popup is showing ----
  readonly budget = signal<Budget | null>(null);
  readonly category = signal<BudgetCategory | null>(null);

  // ---- The page of expenses ----
  readonly expenses = signal<Expense[]>([]);
  readonly page = signal(1);
  readonly totalPages = signal(1);
  readonly totalElements = signal(0);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);

  // ---- Values read from the category and the budget (they update by themselves) ----
  readonly title = computed(() => this.category()?.name ?? '');
  readonly monthText = computed(() => {
    const budget = this.budget();
    return budget ? monthLabel(budget) : '';
  });
  readonly allocated = computed(() => this.category()?.allocatedAmount ?? 0);

  private loadSubscription?: Subscription;

  /** Opens the popup for one category and loads the first page. */
  open(budget: Budget, category: BudgetCategory): void {
    this.budget.set(budget);
    this.category.set(category);
    this.expenses.set([]);
    this.page.set(1);
    this.totalPages.set(1);
    this.totalElements.set(0);
    this.load();
    this.dialog?.nativeElement.showModal();
  }

  /**
   * Loads the list again from page 1. Call it after an expense was saved:
   * the list is newest first, so the new expense is on page 1.
   * Does nothing if the popup was never opened.
   */
  reload(): void {
    if (this.category() === null) {
      return;
    }
    this.page.set(1);
    this.load();
  }

  load(): void {
    const category = this.category();
    if (category === null) {
      return;
    }

    // Cancel the request that is still running. Without this, clicking Next quickly
    // lets an older, slower answer arrive last and replace the newer one.
    this.loadSubscription?.unsubscribe();

    this.loading.set(true);
    this.loadError.set(null);

    this.loadSubscription = this.expenseService
      .getAllPaginatedExpensesByBudgetCategoryId(category.id, this.page(), PAGE_SIZE)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.expenses.set(response.content);
          this.totalPages.set(Math.max(response.totalPages, 1));
          this.totalElements.set(response.totalElements);
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.loadError.set(this.errorMessage(error));
          this.loading.set(false);
        },
      });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.page()) {
      return;
    }
    this.page.set(page);
    this.load();
  }

  /** The user clicked "Add expense". The parent decides how to open the form. */
  requestAdd(): void {
    const budget = this.budget();
    const category = this.category();
    if (budget === null || category === null) {
      return;
    }
    this.addRequested.emit({ budget, category });
  }

  close(): void {
    this.dialog?.nativeElement.close();
  }

  /** Runs when the popup closes in any way (Close button or Escape). */
  onClosed(): void {
    // A request that is still running has nobody left to show its result to.
    this.loadSubscription?.unsubscribe();
    this.loading.set(false);
  }

  private errorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse && error.status === 404) {
      return 'This category no longer exists. Close this window and reload the page.';
    }
    return 'We could not load the expenses. Please try again.';
  }
}
